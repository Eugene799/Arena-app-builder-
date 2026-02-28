import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  ChainType,
  ChainConfig,
  WalletConnector,
  WalletConnection,
  WalletTransaction,
  WalletSignature,
} from '../types';
import { appConfig, supportedChains, getChainConfig, isReownConfigured } from '../config/appConfig';

type WalletState = 'disconnected' | 'connecting' | 'connected' | 'error';

interface UseWalletReturn {
  // Connection state
  connection: WalletConnection;
  walletState: WalletState;
  error: string | null;

  // Connection actions
  connect: (connector?: WalletConnector, chainType?: ChainType) => Promise<void>;
  disconnect: () => Promise<void>;
  switchChain: (chainType: ChainType, chainId?: number | string) => Promise<void>;

  // Transaction actions
  sendTransaction: (transaction: WalletTransaction) => Promise<string | null>;
  signMessage: (message: string) => Promise<WalletSignature | null>;
  getBalance: () => Promise<string | null>;

  // Utility
  isSupportedChain: (chainId: number | string) => boolean;
  getCurrentChainConfig: () => ChainConfig | null;
  supportedConnectors: WalletConnector[];
  availableChains: ChainConfig[];

  // Reown AppKit integration status
  isAppKitAvailable: boolean;
}

const initialConnection: WalletConnection = {
  isConnected: false,
  address: null,
  chainId: null,
  chainType: null,
  connector: null,
  balance: null,
};

export const useWallet = (): UseWalletReturn => {
  const [connection, setConnection] = useState<WalletConnection>(initialConnection);
  const [walletState, setWalletState] = useState<WalletState>('disconnected');
  const [error, setError] = useState<string | null>(null);

  // Refs for AppKit modal (will be set when AppKit is initialized)
  const appKitModalRef = useRef<{
    open: (options?: { view: 'Connect' | 'Account' | 'Networks' }) => void;
    close: () => void;
  } | null>(null);

  const isAppKitAvailable = isReownConfigured();

  // Listen for AppKit events if available
  useEffect(() => {
    if (!isAppKitAvailable) return;

    const handleAccountChanged = (event: CustomEvent) => {
      const { address, chainId, connector } = event.detail;
      const chainConfig = getChainConfig(chainId);

      if (address) {
        setConnection({
          isConnected: true,
          address,
          chainId,
          chainType: chainConfig?.type || null,
          connector: connector || null,
          balance: null,
        });
        setWalletState('connected');
      } else {
        setConnection(initialConnection);
        setWalletState('disconnected');
      }
    };

    const handleDisconnect = () => {
      setConnection(initialConnection);
      setWalletState('disconnected');
    };

    window.addEventListener('appkit:accountChanged', handleAccountChanged as EventListener);
    window.addEventListener('appkit:disconnect', handleDisconnect as EventListener);

    return () => {
      window.removeEventListener('appkit:accountChanged', handleAccountChanged as EventListener);
      window.removeEventListener('appkit:disconnect', handleDisconnect as EventListener);
    };
  }, [isAppKitAvailable]);

  const connect = useCallback(async (
    connector?: WalletConnector,
    chainType?: ChainType
  ): Promise<void> => {
    setError(null);
    setWalletState('connecting');

    try {
      if (!isAppKitAvailable) {
        throw new Error('Reown AppKit is not configured. Please set VITE_REOWN_PROJECT_ID in your environment.');
      }

      // Dispatch event to open AppKit modal
      const event = new CustomEvent('appkit:open', {
        detail: { connector, chainType },
      });
      window.dispatchEvent(event);

      // Wait for connection (this is handled by AppKitProvider)
      // The actual connection state will be updated via the accountChanged event
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      setWalletState('error');
      throw err;
    }
  }, [isAppKitAvailable]);

  const disconnect = useCallback(async (): Promise<void> => {
    try {
      const event = new CustomEvent('appkit:disconnect');
      window.dispatchEvent(event);
      setConnection(initialConnection);
      setWalletState('disconnected');
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect wallet';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const switchChain = useCallback(async (
    chainType: ChainType,
    chainId?: number | string
  ): Promise<void> => {
    try {
      if (!connection.isConnected) {
        throw new Error('Wallet not connected');
      }

      let targetChain: ChainConfig | undefined;

      if (chainId) {
        targetChain = getChainConfig(chainId);
      } else {
        targetChain = supportedChains.find(
          chain => chain.type === chainType && !chain.testnet
        );
      }

      if (!targetChain) {
        throw new Error(`Chain configuration not found for ${chainType}`);
      }

      const event = new CustomEvent('appkit:switchChain', {
        detail: { chainId: targetChain.id },
      });
      window.dispatchEvent(event);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to switch chain';
      setError(errorMessage);
      throw err;
    }
  }, [connection.isConnected]);

  const sendTransaction = useCallback(async (
    transaction: WalletTransaction
  ): Promise<string | null> => {
    try {
      if (!connection.isConnected) {
        throw new Error('Wallet not connected');
      }

      return new Promise((resolve, reject) => {
        const handleResponse = (event: CustomEvent) => {
          const { hash, error: txError } = event.detail;
          window.removeEventListener('appkit:transactionResponse', handleResponse as EventListener);

          if (txError) {
            reject(new Error(txError));
          } else {
            resolve(hash);
          }
        };

        window.addEventListener('appkit:transactionResponse', handleResponse as EventListener);

        const requestEvent = new CustomEvent('appkit:sendTransaction', {
          detail: transaction,
        });
        window.dispatchEvent(requestEvent);

        // Timeout after 2 minutes
        setTimeout(() => {
          window.removeEventListener('appkit:transactionResponse', handleResponse as EventListener);
          reject(new Error('Transaction timeout'));
        }, 120000);
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send transaction';
      setError(errorMessage);
      throw err;
    }
  }, [connection.isConnected]);

  const signMessage = useCallback(async (
    message: string
  ): Promise<WalletSignature | null> => {
    try {
      if (!connection.isConnected || !connection.address) {
        throw new Error('Wallet not connected');
      }

      return new Promise((resolve, reject) => {
        const handleResponse = (event: CustomEvent) => {
          const { signature, error: signError } = event.detail;
          window.removeEventListener('appkit:signResponse', handleResponse as EventListener);

          if (signError) {
            reject(new Error(signError));
          } else {
            resolve({
              message,
              signature,
              address: connection.address!,
            });
          }
        };

        window.addEventListener('appkit:signResponse', handleResponse as EventListener);

        const requestEvent = new CustomEvent('appkit:signMessage', {
          detail: { message },
        });
        window.dispatchEvent(requestEvent);

        // Timeout after 1 minute
        setTimeout(() => {
          window.removeEventListener('appkit:signResponse', handleResponse as EventListener);
          reject(new Error('Signing timeout'));
        }, 60000);
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign message';
      setError(errorMessage);
      throw err;
    }
  }, [connection.isConnected, connection.address]);

  const getBalance = useCallback(async (): Promise<string | null> => {
    try {
      if (!connection.isConnected || !connection.address) {
        return null;
      }

      return new Promise((resolve, reject) => {
        const handleResponse = (event: CustomEvent) => {
          const { balance, error: balanceError } = event.detail;
          window.removeEventListener('appkit:balanceResponse', handleResponse as EventListener);

          if (balanceError) {
            reject(new Error(balanceError));
          } else {
            setConnection(prev => ({ ...prev, balance }));
            resolve(balance);
          }
        };

        window.addEventListener('appkit:balanceResponse', handleResponse as EventListener);

        const requestEvent = new CustomEvent('appkit:getBalance', {
          detail: { address: connection.address },
        });
        window.dispatchEvent(requestEvent);

        // Timeout after 30 seconds
        setTimeout(() => {
          window.removeEventListener('appkit:balanceResponse', handleResponse as EventListener);
          reject(new Error('Balance fetch timeout'));
        }, 30000);
      });
    } catch (err) {
      console.error('Failed to get balance:', err);
      return null;
    }
  }, [connection.isConnected, connection.address]);

  const isSupportedChain = useCallback((chainId: number | string): boolean => {
    return supportedChains.some(chain => chain.id === chainId);
  }, []);

  const getCurrentChainConfig = useCallback((): ChainConfig | null => {
    if (!connection.chainId) return null;
    return getChainConfig(connection.chainId) || null;
  }, [connection.chainId]);

  return {
    connection,
    walletState,
    error,
    connect,
    disconnect,
    switchChain,
    sendTransaction,
    signMessage,
    getBalance,
    isSupportedChain,
    getCurrentChainConfig,
    supportedConnectors: ['metamask', 'rainbow', 'coinbase', 'walletconnect', 'phantom', 'okx', 'trust'],
    availableChains: supportedChains,
    isAppKitAvailable,
  };
};

export default useWallet;
