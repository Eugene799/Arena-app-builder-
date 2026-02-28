# Reown AppKit Multi-Chain Wallet Integration

This document describes the multi-chain wallet integration using Reown AppKit for the Arena AI Builder.

## Overview

The Arena AI Builder now supports multi-chain dApp building with Reown AppKit, enabling wallet connections to:

- **Ethereum** (Mainnet & Sepolia)
- **Base** (Mainnet & Sepolia)
- **Solana** (Mainnet & Devnet)
- **Bitcoin** (Mainnet & Testnet)
- **TON** (Mainnet & Testnet)

## Supported Wallets

- MetaMask
- Rainbow
- Coinbase Wallet
- WalletConnect
- Phantom (Solana)
- OKX Wallet
- Trust Wallet

## Setup

### 1. Get a Reown Project ID

1. Visit [https://cloud.reown.com](https://cloud.reown.com)
2. Sign up or log in to your account
3. Create a new project
4. Copy your Project ID

### 2. Configure Environment Variables

Add the following to your `.env` file:

```bash
# Reown AppKit (Multi-Chain Wallet Support)
VITE_REOWN_PROJECT_ID=your_project_id_here

# Optional: Enable/Disable multi-chain wallet feature
VITE_ENABLE_MULTICHAIN_WALLET=true
```

### 3. Install Dependencies

```bash
npm install @reown/appkit @reown/appkit-adapter-wagmi @reown/appkit-adapter-solana wagmi viem @solana/web3.js @solana/wallet-adapter-wallets
```

## Usage

### Wrap Your App with AppKitProvider

```tsx
import { AppKitProvider } from './components/AppKitProvider';

function App() {
  return (
    <AppKitProvider>
      <YourApp />
    </AppKitProvider>
  );
}
```

### Use the Wallet Connector Component

```tsx
import { WalletConnector } from './components/WalletConnector';

function Header() {
  return (
    <header>
      <h1>My dApp</h1>
      <WalletConnector />
    </header>
  );
}
```

### Use the useWallet Hook

```tsx
import { useWallet } from './hooks/useWallet';

function MyComponent() {
  const {
    connection,
    walletState,
    connect,
    disconnect,
    switchChain,
    sendTransaction,
    signMessage,
    getBalance,
    isAppKitAvailable,
  } = useWallet();

  if (!isAppKitAvailable) {
    return <div>Wallet integration not configured</div>;
  }

  if (!connection.isConnected) {
    return <button onClick={connect}>Connect Wallet</button>;
  }

  return (
    <div>
      <p>Address: {connection.address}</p>
      <p>Chain: {connection.chainType}</p>
      <button onClick={disconnect}>Disconnect</button>
      <button onClick={() => switchChain('solana')}>Switch to Solana</button>
    </div>
  );
}
```

## API Reference

### useWallet Hook

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `connection` | `WalletConnection` | Current wallet connection state |
| `walletState` | `'disconnected' \| 'connecting' \| 'connected' \| 'error'` | Connection state |
| `error` | `string \| null` | Error message if any |
| `connect` | `(connector?, chainType?) => Promise<void>` | Connect wallet |
| `disconnect` | `() => Promise<void>` | Disconnect wallet |
| `switchChain` | `(chainType, chainId?) => Promise<void>` | Switch chain |
| `sendTransaction` | `(transaction) => Promise<string \| null>` | Send transaction |
| `signMessage` | `(message) => Promise<WalletSignature \| null>` | Sign message |
| `getBalance` | `() => Promise<string \| null>` | Get wallet balance |
| `isSupportedChain` | `(chainId) => boolean` | Check if chain is supported |
| `getCurrentChainConfig` | `() => ChainConfig \| null` | Get current chain config |
| `availableChains` | `ChainConfig[]` | List of available chains |
| `isAppKitAvailable` | `boolean` | Whether AppKit is configured |

### WalletConnector Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `''` | Additional CSS class |
| `showChainSelector` | `boolean` | `true` | Show chain selector dropdown |
| `variant` | `'default' \| 'compact' \| 'full'` | `'default'` | Visual variant |

## Chain Configuration

Chains are configured in `src/config/appConfig.ts`:

```typescript
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
  // ... more chains
];
```

## Architecture

### Event-Based Communication

The integration uses custom events for communication between the hook and provider:

- `appkit:open` - Open the connection modal
- `appkit:accountChanged` - Account/chain changed
- `appkit:disconnect` - Disconnect wallet
- `appkit:switchChain` - Switch chain request
- `appkit:sendTransaction` - Send transaction request
- `appkit:signMessage` - Sign message request
- `appkit:getBalance` - Get balance request

### Optional Feature

The multi-chain wallet is an **optional feature**. If `VITE_REOWN_PROJECT_ID` is not set:

- The `useWallet` hook will return `isAppKitAvailable: false`
- The `WalletConnector` component will show an unconfigured state
- The `AppKitProvider` will render children without any wallet functionality
- The existing AVAX/Stars Arena integration continues to work

## Troubleshooting

### "Reown AppKit is not configured"

Make sure you've set `VITE_REOWN_PROJECT_ID` in your `.env` file and restarted the dev server.

### Chain switching not working

Chain switching is handled by the wallet itself. Some wallets may not support all chains.

### Transactions failing

Ensure you're connected to the correct network and have sufficient balance for gas fees.

## Security Considerations

1. Never commit your `VITE_REOWN_PROJECT_ID` to version control
2. Use environment variables for all sensitive configuration
3. Always validate transactions before signing
4. Implement proper error handling for all wallet operations
