import type { ChainConfig, WalletConnector } from '../types';

interface AppConfig {
  api: {
    groqKey: string;
    geminiKey: string;
    openrouterKey: string;
    leonardoKey: string;
  };
  blockchain: {
    avaxRpcUrl: string;
    avaxChainId: number;
    avaxChainIdHex: string;
  };
  deployment: {
    vercelToken: string;
    netlifyToken: string;
  };
  features: {
    onboardingEnabled: boolean;
    feeCalculatorEnabled: boolean;
    templatesEnabled: boolean;
    multiChainWalletEnabled: boolean;
  };
  rateLimit: {
    maxRequests: number;
    windowMs: number;
  };
  pricing: {
    processingFeePercent: number;
    processingFeeFixed: number;
    gasBufferPercent: number;
  };
  reown: {
    projectId: string;
    appName: string;
    appDescription: string;
    appUrl: string;
    appIcon: string;
  };
}

const getEnvVar = (key: string, defaultValue: string): string => {
  return import.meta.env[key] || defaultValue;
};

const getEnvNum = (key: string, defaultValue: number): number => {
  const value = import.meta.env[key];
  return value ? parseInt(value, 10) : defaultValue;
};

const getEnvBool = (key: string, defaultValue: boolean): boolean => {
  const value = import.meta.env[key];
  if (!value) return defaultValue;
  return value === 'true' || value === '1';
};

export const appConfig: AppConfig = {
  api: {
    groqKey: getEnvVar('VITE_GROQ_API_KEY', ''),
    geminiKey: getEnvVar('VITE_GEMINI_API_KEY', ''),
    openrouterKey: getEnvVar('VITE_OPENROUTER_API_KEY', ''),
    leonardoKey: getEnvVar('VITE_LEONARDO_API_KEY', ''),
  },
  blockchain: {
    avaxRpcUrl: getEnvVar('VITE_AVAX_RPC_URL', 'https://api.avax-test.network/ext/bc/C/rpc'),
    avaxChainId: getEnvNum('VITE_AVAX_CHAIN_ID', 43113),
    avaxChainIdHex: getEnvVar('VITE_AVAX_CHAIN_ID_HEX', '0xa869'),
  },
  deployment: {
    vercelToken: getEnvVar('VITE_VERCEL_TOKEN', ''),
    netlifyToken: getEnvVar('VITE_NETLIFY_TOKEN', ''),
  },
  features: {
    onboardingEnabled: getEnvBool('VITE_ENABLE_ONBOARDING', true),
    feeCalculatorEnabled: getEnvBool('VITE_SHOW_FEE_CALCULATOR', true),
    templatesEnabled: getEnvBool('VITE_ENABLE_TEMPLATES', true),
    multiChainWalletEnabled: getEnvBool('VITE_ENABLE_MULTICHAIN_WALLET', true),
  },
  rateLimit: {
    maxRequests: getEnvNum('VITE_RATE_LIMIT_REQUESTS', 100),
    windowMs: getEnvNum('VITE_RATE_LIMIT_WINDOW', 60000),
  },
  pricing: {
    processingFeePercent: 2.9,
    processingFeeFixed: 0.30,
    gasBufferPercent: 10,
  },
  reown: {
    projectId: getEnvVar('VITE_REOWN_PROJECT_ID', ''),
    appName: 'Arena AI Builder',
    appDescription: 'Build and deploy multi-chain dApps with AI',
    appUrl: typeof window !== 'undefined' ? window.location.origin : 'https://arena-ai-builder.com',
    appIcon: 'https://arena-ai-builder.com/icon.png',
  },
};

export const isProduction = import.meta.env.PROD;
export const isDevelopment = import.meta.env.DEV;

export const getApiKey = (provider: string): string => {
  switch (provider) {
    case 'groq':
      return appConfig.api.groqKey;
    case 'gemini':
      return appConfig.api.geminiKey;
    case 'openrouter':
      return appConfig.api.openrouterKey;
    default:
      return '';
  }
};

export const hasApiKey = (provider: string): boolean => {
  return !!getApiKey(provider);
};

// Multi-Chain Configurations
export const supportedChains: ChainConfig[] = [
  {
    id: 1,
    name: 'Ethereum Mainnet',
    type: 'ethereum',
    namespace: 'eip155',
    currency: 'ETH',
    explorerUrl: 'https://etherscan.io',
    rpcUrl: 'https://ethereum.publicnode.com',
  },
  {
    id: 11155111,
    name: 'Ethereum Sepolia',
    type: 'ethereum',
    namespace: 'eip155',
    currency: 'ETH',
    explorerUrl: 'https://sepolia.etherscan.io',
    rpcUrl: 'https://ethereum-sepolia.publicnode.com',
    testnet: true,
  },
  {
    id: 8453,
    name: 'Base Mainnet',
    type: 'base',
    namespace: 'eip155',
    currency: 'ETH',
    explorerUrl: 'https://basescan.org',
    rpcUrl: 'https://mainnet.base.org',
  },
  {
    id: 84532,
    name: 'Base Sepolia',
    type: 'base',
    namespace: 'eip155',
    currency: 'ETH',
    explorerUrl: 'https://sepolia.basescan.org',
    rpcUrl: 'https://sepolia.base.org',
    testnet: true,
  },
  {
    id: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
    name: 'Solana Mainnet',
    type: 'solana',
    namespace: 'solana',
    currency: 'SOL',
    explorerUrl: 'https://explorer.solana.com',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
  },
  {
    id: 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
    name: 'Solana Devnet',
    type: 'solana',
    namespace: 'solana',
    currency: 'SOL',
    explorerUrl: 'https://explorer.solana.com/?cluster=devnet',
    rpcUrl: 'https://api.devnet.solana.com',
    testnet: true,
  },
  {
    id: '000000000019d6689c085ae165831e93',
    name: 'Bitcoin Mainnet',
    type: 'bitcoin',
    namespace: 'bip122',
    currency: 'BTC',
    explorerUrl: 'https://mempool.space',
  },
  {
    id: '000000000933ea01ad0ee984209779ba',
    name: 'Bitcoin Testnet',
    type: 'bitcoin',
    namespace: 'bip122',
    currency: 'BTC',
    explorerUrl: 'https://mempool.space/testnet',
    testnet: true,
  },
  {
    id: '-239',
    name: 'TON Mainnet',
    type: 'ton',
    namespace: 'ton',
    currency: 'TON',
    explorerUrl: 'https://tonscan.org',
    rpcUrl: 'https://toncenter.com/api/v2/jsonRPC',
  },
  {
    id: '-3',
    name: 'TON Testnet',
    type: 'ton',
    namespace: 'ton',
    currency: 'TON',
    explorerUrl: 'https://testnet.tonscan.org',
    rpcUrl: 'https://testnet.toncenter.com/api/v2/jsonRPC',
    testnet: true,
  },
];

export const defaultSupportedWallets: WalletConnector[] = [
  'metamask',
  'rainbow',
  'coinbase',
  'walletconnect',
  'phantom',
  'okx',
  'trust',
];

export const getChainConfig = (chainId: number | string): ChainConfig | undefined => {
  return supportedChains.find(chain => chain.id === chainId);
};

export const getChainConfigByType = (type: ChainType): ChainConfig | undefined => {
  return supportedChains.find(chain => chain.type === type && !chain.testnet);
};

export const getTestnetConfig = (type: ChainType): ChainConfig | undefined => {
  return supportedChains.find(chain => chain.type === type && chain.testnet === true);
};

export const isReownConfigured = (): boolean => {
  return !!appConfig.reown.projectId;
};

export default appConfig;
