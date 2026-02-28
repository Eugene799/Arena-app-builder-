import React, { useState, useCallback } from 'react';
import {
  Wallet,
  ChevronDown,
  ExternalLink,
  Copy,
  LogOut,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { useWallet } from '../../hooks/useWallet';
import type { ChainType, ChainConfig } from '../../types';
import './WalletConnector.css';

interface WalletConnectorProps {
  className?: string;
  showChainSelector?: boolean;
  variant?: 'default' | 'compact' | 'full';
}

const CHAIN_ICONS: Record<ChainType, string> = {
  ethereum: '◈',
  base: '🔵',
  solana: '◎',
  bitcoin: '₿',
  ton: '💎',
};

const CHAIN_COLORS: Record<ChainType, string> = {
  ethereum: '#627eea',
  base: '#0052ff',
  solana: '#14f195',
  bitcoin: '#f7931a',
  ton: '#0088cc',
};

export const WalletConnector: React.FC<WalletConnectorProps> = ({
  className = '',
  showChainSelector = true,
  variant = 'default',
}) => {
  const {
    connection,
    walletState,
    error,
    connect,
    disconnect,
    switchChain,
    getBalance,
    getCurrentChainConfig,
    availableChains,
    isAppKitAvailable,
  } = useWallet();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isChainMenuOpen, setIsChainMenuOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);

  const currentChain = getCurrentChainConfig();

  const handleConnect = useCallback(async () => {
    try {
      await connect();
    } catch (err) {
      console.error('Connection failed:', err);
    }
  }, [connect]);

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnect();
      setIsDropdownOpen(false);
    } catch (err) {
      console.error('Disconnect failed:', err);
    }
  }, [disconnect]);

  const handleSwitchChain = useCallback(async (chainType: ChainType) => {
    try {
      await switchChain(chainType);
      setIsChainMenuOpen(false);
    } catch (err) {
      console.error('Chain switch failed:', err);
    }
  }, [switchChain]);

  const handleCopyAddress = useCallback(() => {
    if (connection.address) {
      navigator.clipboard.writeText(connection.address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  }, [connection.address]);

  const handleRefreshBalance = useCallback(async () => {
    if (!connection.isConnected) return;
    setIsRefreshingBalance(true);
    try {
      await getBalance();
    } finally {
      setIsRefreshingBalance(false);
    }
  }, [connection.isConnected, getBalance]);

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getMainnetChains = (): ChainConfig[] => {
    return availableChains.filter(chain => !chain.testnet);
  };

  // Not configured state
  if (!isAppKitAvailable) {
    return (
      <div className={`wallet-connector wallet-connector--unconfigured ${className}`}>
        <div className="wallet-connector__tooltip">
          <AlertCircle size={16} />
          <span>Multi-chain wallet not configured</span>
        </div>
      </div>
    );
  }

  // Loading state
  if (walletState === 'connecting') {
    return (
      <div className={`wallet-connector wallet-connector--loading ${className}`}>
        <div className="wallet-connector__loading">
          <RefreshCw size={16} className="wallet-connector__spinner" />
          <span>Connecting...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (walletState === 'error' && error) {
    return (
      <div className={`wallet-connector wallet-connector--error ${className}`}>
        <div className="wallet-connector__error">
          <AlertCircle size={16} />
          <span>Connection error</span>
        </div>
      </div>
    );
  }

  // Not connected state
  if (!connection.isConnected) {
    return (
      <div className={`wallet-connector ${className}`}>
        <button
          className="wallet-connector__connect-btn"
          onClick={handleConnect}
          disabled={walletState === 'connecting'}
        >
          <Wallet size={18} />
          <span>Connect Wallet</span>
        </button>
      </div>
    );
  }

  // Connected state
  return (
    <div className={`wallet-connector wallet-connector--connected ${className}`}>
      {/* Chain Selector */}
      {showChainSelector && (
        <div className="wallet-connector__chain-wrapper">
          <button
            className="wallet-connector__chain-btn"
            onClick={() => setIsChainMenuOpen(!isChainMenuOpen)}
          >
            <span
              className="wallet-connector__chain-icon"
              style={{ color: currentChain ? CHAIN_COLORS[currentChain.type] : '#888' }}
            >
              {currentChain ? CHAIN_ICONS[currentChain.type] : '⬡'}
            </span>
            <span className="wallet-connector__chain-name">
              {currentChain?.type || 'Unknown'}
            </span>
            <ChevronDown size={14} />
          </button>

          {isChainMenuOpen && (
            <div className="wallet-connector__chain-menu">
              <div className="wallet-connector__chain-header">
                <Layers size={14} />
                <span>Select Network</span>
              </div>
              {getMainnetChains().map((chain) => (
                <button
                  key={chain.id}
                  className={`wallet-connector__chain-option ${
                    currentChain?.id === chain.id ? 'active' : ''
                  }`}
                  onClick={() => handleSwitchChain(chain.type)}
                >
                  <span
                    className="wallet-connector__chain-option-icon"
                    style={{ color: CHAIN_COLORS[chain.type] }}
                  >
                    {CHAIN_ICONS[chain.type]}
                  </span>
                  <span className="wallet-connector__chain-option-name">{chain.name}</span>
                  {currentChain?.id === chain.id && (
                    <CheckCircle2 size={14} className="wallet-connector__chain-check" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Account Button / Dropdown */}
      <div className="wallet-connector__account-wrapper">
        <button
          className="wallet-connector__account-btn"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="wallet-connector__account-info">
            <span className="wallet-connector__account-address">
              {connection.address ? formatAddress(connection.address) : 'Unknown'}
            </span>
            {connection.balance && (
              <span className="wallet-connector__account-balance">
                {parseFloat(connection.balance).toFixed(4)} {currentChain?.currency || 'ETH'}
              </span>
            )}
          </div>
          <ChevronDown size={14} />
        </button>

        {isDropdownOpen && (
          <div className="wallet-connector__dropdown">
            <div className="wallet-connector__dropdown-header">
              <Wallet size={16} />
              <span>Connected Wallet</span>
            </div>

            <div className="wallet-connector__dropdown-address">
              <span className="wallet-connector__dropdown-label">Address</span>
              <div className="wallet-connector__dropdown-value">
                <code>{connection.address}</code>
                <button
                  className="wallet-connector__dropdown-copy"
                  onClick={handleCopyAddress}
                  title="Copy address"
                >
                  {copiedAddress ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div className="wallet-connector__dropdown-balance">
              <span className="wallet-connector__dropdown-label">Balance</span>
              <div className="wallet-connector__dropdown-value">
                <span>
                  {connection.balance
                    ? `${parseFloat(connection.balance).toFixed(6)} ${currentChain?.currency || 'ETH'}`
                    : 'Loading...'}
                </span>
                <button
                  className="wallet-connector__dropdown-refresh"
                  onClick={handleRefreshBalance}
                  disabled={isRefreshingBalance}
                  title="Refresh balance"
                >
                  <RefreshCw
                    size={14}
                    className={isRefreshingBalance ? 'wallet-connector__spinner' : ''}
                  />
                </button>
              </div>
            </div>

            <div className="wallet-connector__dropdown-network">
              <span className="wallet-connector__dropdown-label">Network</span>
              <span className="wallet-connector__dropdown-network-badge">
                <span
                  className="wallet-connector__dropdown-network-icon"
                  style={{ color: currentChain ? CHAIN_COLORS[currentChain.type] : '#888' }}
                >
                  {currentChain ? CHAIN_ICONS[currentChain.type] : '⬡'}
                </span>
                {currentChain?.name || 'Unknown Network'}
              </span>
            </div>

            <div className="wallet-connector__dropdown-actions">
              {currentChain?.explorerUrl && connection.address && (
                <a
                  href={`${currentChain.explorerUrl}/address/${connection.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wallet-connector__dropdown-action"
                >
                  <ExternalLink size={14} />
                  <span>View on Explorer</span>
                </a>
              )}

              <button
                className="wallet-connector__dropdown-action wallet-connector__dropdown-action--disconnect"
                onClick={handleDisconnect}
              >
                <LogOut size={14} />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdowns */}
      {(isDropdownOpen || isChainMenuOpen) && (
        <div
          className="wallet-connector__backdrop"
          onClick={() => {
            setIsDropdownOpen(false);
            setIsChainMenuOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default WalletConnector;
