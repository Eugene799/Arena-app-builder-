import { ethers } from 'ethers';
import type {
  GasPrice,
  GasPriceOption,
  TransactionFee,
  DeploymentCost,
  DeploymentEstimate,
  SubscriptionPricing,
  PlatformPricing,
} from '../types';

const AVAX_USD_PRICE = 35.0;

const DEFAULT_GAS_PRICES: GasPrice = {
  slow: 25,
  standard: 30,
  fast: 40,
  lastUpdated: new Date(),
};

const PLATFORM_PRICING: Record<string, PlatformPricing> = {
  vercel: {
    platform: 'Vercel',
    freeTier: { bandwidth: 100, builds: 100, storage: 0 },
    paidTiers: [
      { name: 'Pro', price: 20, bandwidth: 1000, builds: 3000, storage: 50 },
      { name: 'Enterprise', price: 0, bandwidth: 0, builds: 0, storage: 0 },
    ],
  },
  netlify: {
    platform: 'Netlify',
    freeTier: { bandwidth: 100, builds: 100, storage: 1 },
    paidTiers: [
      { name: 'Pro', price: 19, bandwidth: 1000, builds: 500, storage: 100 },
      { name: 'Business', price: 99, bandwidth: 2000, builds: 1000, storage: 200 },
    ],
  },
};

const FRAMEWORK_BASELINE_COSTS: Record<string, { base: number; perPage: number }> = {
  'react': { base: 5, perPage: 0.5 },
  'vue': { base: 4, perPage: 0.4 },
  'nextjs': { base: 8, perPage: 0.8 },
  'vanilla': { base: 2, perPage: 0.2 },
  'astro': { base: 3, perPage: 0.3 },
};

const PROCESSING_FEE_PERCENT = 2.9;
const PROCESSING_FEE_FIXED = 0.30;
const GAS_BUFFER_PERCENT = 10;

class FeeService {
  private cachedGasPrice: GasPrice | null = null;
  private gasPriceCacheTTL = 60000;

  async getGasPrice(): Promise<GasPrice> {
    if (
      this.cachedGasPrice &&
      Date.now() - this.cachedGasPrice.lastUpdated.getTime() < this.gasPriceCacheTTL
    ) {
      return this.cachedGasPrice;
    }

    try {
      const provider = new ethers.JsonRpcProvider(
        import.meta.env.VITE_AVAX_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc'
      );
      const feeData = await provider.getFeeData();

      if (feeData.gasPrice) {
        const gasPriceInGwei = Number(ethers.formatUnits(feeData.gasPrice, 'gwei'));
        
        this.cachedGasPrice = {
          slow: Math.round(gasPriceInGwei * 0.8),
          standard: Math.round(gasPriceInGwei),
          fast: Math.round(gasPriceInGwei * 1.3),
          lastUpdated: new Date(),
        };
        return this.cachedGasPrice;
      }
    } catch (error) {
      console.warn('Failed to fetch gas price from network, using defaults:', error);
    }

    return DEFAULT_GAS_PRICES;
  }

  getGasPriceOptions(): GasPriceOption[] {
    return [
      {
        id: 'slow',
        label: 'Slow',
        priceInGwei: 25,
        estimatedTime: '3-5 minutes',
        description: 'Lower fee, suitable for non-urgent transactions',
      },
      {
        id: 'standard',
        label: 'Standard',
        priceInGwei: 30,
        estimatedTime: '30 seconds - 2 minutes',
        description: 'Balanced fee and speed',
      },
      {
        id: 'fast',
        label: 'Fast',
        priceInGwei: 40,
        estimatedTime: '10-30 seconds',
        description: 'Higher fee for priority processing',
      },
    ];
  }

  calculateTransactionFee(
    gasPriceInGwei: number,
    gasLimit: number = 21000
  ): TransactionFee {
    const gasPriceInWei = ethers.parseUnits(gasPriceInGwei.toString(), 'gwei');
    const totalInWei = gasPriceInWei * BigInt(gasLimit);
    const totalInAvax = Number(ethers.formatEther(totalInWei));
    const totalInUsd = totalInAvax * AVAX_USD_PRICE;

    return {
      gasPrice: gasPriceInGwei,
      gasLimit,
      totalInAvax: Math.round(totalInAvax * 10000) / 10000,
      totalInUsd: Math.round(totalInUsd * 100) / 100,
    };
  }

  calculateDeploymentCost(
    platform: string,
    framework: string,
    pages: number,
    bandwidthGB: number = 10
  ): DeploymentCost {
    const pricing = PLATFORM_PRICING[platform] || PLATFORM_PRICING.vercel;
    const frameworkCosts = FRAMEWORK_BASELINE_COSTS[framework] || FRAMEWORK_BASELINE_COSTS.react;

    const baseCost = frameworkCosts.base;
    const computeUnitCost = pages * frameworkCosts.perPage;
    const bandwidthCost = Math.max(0, bandwidthGB - pricing.freeTier.bandwidth) * 0.15;
    const storageCost = 1 * 0.02;

    const { gasFee } = this.calculateTransactionFee(30, 100000);

    const total = baseCost + computeUnitCost + bandwidthCost + storageCost + gasFee;

    return {
      platform,
      framework,
      pages,
      baseCost: Math.round(baseCost * 100) / 100,
      computeUnitCost: Math.round(computeUnitCost * 100) / 100,
      bandwidthCost: Math.round(bandwidthCost * 100) / 100,
      storageCost: Math.round(storageCost * 100) / 100,
      gasFee,
      total: Math.round(total * 100) / 100,
    };
  }

  compareDeploymentCosts(
    framework: string,
    pages: number,
    bandwidthGB: number = 10
  ): DeploymentEstimate[] {
    return Object.entries(PLATFORM_PRICING).map(([key, pricing]) => {
      const { gasFee } = this.calculateTransactionFee(30, 50000);
      let totalMonthly = 0;

      if (bandwidthGB > pricing.freeTier.bandwidth) {
        const overage = bandwidthGB - pricing.freeTier.bandwidth;
        totalMonthly += overage * 0.15;
      }

      return {
        platform: pricing.platform,
        monthlyBandwidth: bandwidthGB,
        monthlyStorage: 5,
        computeUnits: pages * 100,
        gasFee,
        totalMonthly: Math.round(totalMonthly * 100) / 100,
      };
    });
  }

  calculateSubscriptionFees(
    planId: string,
    planPrice: number,
    billingPeriod: 'monthly' | 'yearly' = 'monthly'
  ): SubscriptionPricing {
    const planNames: Record<string, string> = {
      starter: 'Starter',
      pro: 'Pro',
      premium: 'Premium',
    };

    const subtotal = billingPeriod === 'yearly' ? planPrice * 12 * 0.8 : planPrice;
    const processingFee = (subtotal * PROCESSING_FEE_PERCENT) / 100 + PROCESSING_FEE_FIXED;
    const gasFee = this.calculateTransactionFee(30, 50000).totalInAvax;
    const gasFeeInUsd = gasFee * AVAX_USD_PRICE;
    const totalGasFee = (gasFeeInUsd * (1 + GAS_BUFFER_PERCENT / 100));

    const total = subtotal + processingFee + totalGasFee;

    return {
      planId,
      planName: planNames[planId] || planId,
      subtotal: Math.round(subtotal * 100) / 100,
      processingFee: Math.round(processingFee * 100) / 100,
      gasFee: Math.round(totalGasFee * 100) / 100,
      total: Math.round(total * 100) / 100,
      billingPeriod,
    };
  }

  getNetworkFees(): { low: number; medium: number; high: number } {
    return {
      low: 0.001,
      medium: 0.005,
      high: 0.02,
    };
  }

  estimateProjectBandwidth(pages: number, avgPageSizeKB: number = 500): number {
    return (pages * avgPageSizeKB) / (1024 * 1024);
  }
}

export const feeService = new FeeService();
