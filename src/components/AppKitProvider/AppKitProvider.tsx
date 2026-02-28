import React, { useEffect, useRef, useCallback, useState } from 'react';
import { createAppKit } from '@reown/appkit';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import { mainnet, sepolia, base, baseSepolia } from '@reown/appkit/networks';
import type { AppKitNetwork } from '@reown/appkit/networks';
import {
  type Config,
  reconnect,
  watchAccount,
  watchChainId,
  getAccount,
  getChainId,
  disconnect,
  signMessage as wagmiSignMessage,
  sendTransaction as wagmiSendTransaction,
  getBalance as wagmiGetBalance,
} from '@wagmi/core';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import type { ChainType, WalletConnector } from '../../types';
import { appConfig, supportedChains, isReownConfigured } from '../../config/appConfig';
import './AppKitProvider.css';

interface AppKitProviderProps {
  children: React.ReactNode;
}

interface AppKitInstance {
  open: (options?: { view: 'Connect' | 'Account' | 'Networks' }) => void;
  close: () => void;
}

export const AppKitProvider: React.FC<AppKitProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const appKitRef = useRef<AppKitInstance | null>(null);
  const wagmiConfigRef = useRef<Config | null>(null);
  const solanaConnectionRef = useRef<Connection | null>(null);
  const unwatchAccountRef = useRef<(() => void) | null>(null);
  const unwatchChainIdRef = useRef<(() => void) | null>(null);
  const currentConnectorRef = useRef<WalletConnector | null>(null);

  // Initialize AppKit
  useEffect(() => {
    if (!isReownConfigured() || isInitialized) return;

    const initAppKit = async () => {
      try {
        // Create EVM networks configuration
        const evmNetworks: [AppKitNetwork, ...AppKitNetwork[]] = [
          mainnet,
          sepolia,
          base,
          baseSepolia,
        ];

        // Create Wagmi Adapter for EVM chains
        const wagmiAdapter = new WagmiAdapter({
          networks: evmNetworks,
          projectId: appConfig.reown.projectId,
        });

        wagmiConfigRef.current = wagmiAdapter.wagmiConfig;

        // Create Solana Adapter
        const solanaAdapter = new SolanaAdapter({
          wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
        });

        // Initialize Solana connection
        solanaConnectionRef.current = new Connection(
          clusterApiUrl('mainnet-beta'),
          'confirmed'
        );

        // Create AppKit instance
        const modal = createAppKit({
          adapters: [wagmiAdapter, solanaAdapter],
          networks: evmNetworks,
          projectId: appConfig.reown.projectId,
          metadata: {
            name: appConfig.reown.appName,
            description: appConfig.reown.appDescription,
            url: appConfig.reown.appUrl,
            icons: [appConfig.reown.appIcon],
          },
          features: {
            analytics: true,
            email: true,
            socials: ['google', 'twitter', 'discord'],
          },
          themeMode: 'dark',
        });

        appKitRef.current = modal;

        // Reconnect previous session
        await reconnect(wagmiAdapter.wagmiConfig);

        // Set up watchers
        setupWatchers(wagmiAdapter.wagmiConfig);

        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize AppKit:', error);
      }
    };

    initAppKit();

    return () => {
      // Cleanup watchers
      if (unwatchAccountRef.current) {
        unwatchAccountRef.current();
      }
      if (unwatchChainIdRef.current) {
        unwatchChainIdRef.current();
      }
    };
  }, [isInitialized]);

  const setupWatchers = useCallback((config: Config) => {
    // Watch account changes
    unwatchAccountRef.current = watchAccount(config, {
      onChange: (account) => {
        const chainId = getChainId(config);
        handleAccountChange(account.address, chainId);
      },
    });

    // Watch chain changes
    unwatchChainIdRef.current = watchChainId(config, {
      onChange: (chainId) => {
        const account = getAccount(config);
        handleAccountChange(account.address, chainId);
      },
    });
  }, []);

  const handleAccountChange = useCallback((
    address: string | undefined,
    chainId: number | undefined
  ) => {
    const event = new CustomEvent('appkit:accountChanged', {
      detail: {
        address: address || null,
        chainId: chainId || null,
        connector: currentConnectorRef.current,
      },
    });
    window.dispatchEvent(event);
  }, []);

  // Handle open modal request
  useEffect(() => {
    const handleOpen = (event: CustomEvent) => {
      if (appKitRef.current) {
        const { connector } = event.detail || {};
        currentConnectorRef.current = connector || null;
        appKitRef.current.open({ view: 'Connect' });
      }
    };

    window.addEventListener('appkit:open', handleOpen as EventListener);
    return () => window.removeEventListener('appkit:open', handleOpen as EventListener);
  }, []);

  // Handle disconnect request
  useEffect(() => {
    const handleDisconnectRequest = async () => {
      if (wagmiConfigRef.current) {
        try {
          await disconnect(wagmiConfigRef.current);
        } catch (error) {
          console.error('Disconnect error:', error);
        }
      }
      currentConnectorRef.current = null;
    };

    window.addEventListener('appkit:disconnect', handleDisconnectRequest as EventListener);
    return () => window.removeEventListener('appkit:disconnect', handleDisconnectRequest as EventListener);
  }, []);

  // Handle chain switch request
  useEffect(() => {
    const handleSwitchChain = async (event: CustomEvent) => {
      const { chainId } = event.detail;
      if (wagmiConfigRef.current && chainId) {
        try {
          // Chain switching is handled by AppKit UI
          // This event can be used for additional logic
          console.log('Switching to chain:', chainId);
        } catch (error) {
          console.error('Chain switch error:', error);
        }
      }
    };

    window.addEventListener('appkit:switchChain', handleSwitchChain as EventListener);
    return () => window.removeEventListener('appkit:switchChain', handleSwitchChain as EventListener);
  }, []);

  // Handle send transaction request
  useEffect(() => {
    const handleSendTransaction = async (event: CustomEvent) => {
      if (!wagmiConfigRef.current) {
        window.dispatchEvent(new CustomEvent('appkit:transactionResponse', {
          detail: { error: 'Wagmi not initialized' },
        }));
        return;
      }

      try {
        const { to, value, data } = event.detail;
        const result = await wagmiSendTransaction(wagmiConfigRef.current, {
          to,
          value: BigInt(value),
          data: data as `0x${string}` | undefined,
        });

        window.dispatchEvent(new CustomEvent('appkit:transactionResponse', {
          detail: { hash: result },
        }));
      } catch (error) {
        window.dispatchEvent(new CustomEvent('appkit:transactionResponse', {
          detail: { error: error instanceof Error ? error.message : 'Transaction failed' },
        }));
      }
    };

    window.addEventListener('appkit:sendTransaction', handleSendTransaction as EventListener);
    return () => window.removeEventListener('appkit:sendTransaction', handleSendTransaction as EventListener);
  }, []);

  // Handle sign message request
  useEffect(() => {
    const handleSignMessage = async (event: CustomEvent) => {
      if (!wagmiConfigRef.current) {
        window.dispatchEvent(new CustomEvent('appkit:signResponse', {
          detail: { error: 'Wagmi not initialized' },
        }));
        return;
      }

      try {
        const { message } = event.detail;
        const signature = await wagmiSignMessage(wagmiConfigRef.current, {
          message,
        });

        window.dispatchEvent(new CustomEvent('appkit:signResponse', {
          detail: { signature },
        }));
      } catch (error) {
        window.dispatchEvent(new CustomEvent('appkit:signResponse', {
          detail: { error: error instanceof Error ? error.message : 'Signing failed' },
        }));
      }
    };

    window.addEventListener('appkit:signMessage', handleSignMessage as EventListener);
    return () => window.removeEventListener('appkit:signMessage', handleSignMessage as EventListener);
  }, []);

  // Handle get balance request
  useEffect(() => {
    const handleGetBalance = async (event: CustomEvent) => {
      if (!wagmiConfigRef.current) {
        window.dispatchEvent(new CustomEvent('appkit:balanceResponse', {
          detail: { error: 'Wagmi not initialized' },
        }));
        return;
      }

      try {
        const { address } = event.detail;
        const chainId = getChainId(wagmiConfigRef.current);
        const balance = await wagmiGetBalance(wagmiConfigRef.current, {
          address: address as `0x${string}`,
          chainId,
        });

        window.dispatchEvent(new CustomEvent('appkit:balanceResponse', {
          detail: { balance: balance.formatted },
        }));
      } catch (error) {
        window.dispatchEvent(new CustomEvent('appkit:balanceResponse', {
          detail: { error: error instanceof Error ? error.message : 'Failed to get balance' },
        }));
      }
    };

    window.addEventListener('appkit:getBalance', handleGetBalance as EventListener);
    return () => window.removeEventListener('appkit:getBalance', handleGetBalance as EventListener);
  }, []);

  // If AppKit is not configured, just render children without the provider
  if (!isReownConfigured()) {
    return <>{children}</>;
  }

  return (
    <div className="appkit-provider">
      {children}
    </div>
  );
};

export default AppKitProvider;
