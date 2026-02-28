import React, { useState, useCallback } from 'react';
import {
  Cpu,
  Globe,
  Database,
  Code2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Plus,
  ExternalLink,
  Sparkles,
  Layers,
  Box,
} from 'lucide-react';
import type { EnvVariable } from '../../types';
import './FullstackConfig.css';

interface PlatformsGuideProps {
  envVariables: EnvVariable[];
  onChange: (envVariables: EnvVariable[]) => void;
}

interface Blockchain {
  id: string;
  name: string;
  symbol: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  description: string;
  category: 'evm' | 'non-evm' | 'layer2';
  sdks: {
    name: string;
    installCommand: string;
    description: string;
  }[];
}

interface SDK {
  id: string;
  name: string;
  category: 'blockchain' | 'storage' | 'auth' | 'ai' | 'payment' | 'analytics';
  description: string;
  installCommand: string;
  docsUrl: string;
  requiredEnvVars: {
    key: string;
    description: string;
    placeholder: string;
  }[];
}

interface ExternalAPI {
  id: string;
  name: string;
  category: 'data' | 'payment' | 'communication' | 'ai' | 'social' | 'other';
  description: string;
  baseUrl: string;
  docsUrl: string;
  requiredEnvVars: {
    key: string;
    description: string;
    placeholder: string;
  }[];
}

const BLOCKCHAINS: Blockchain[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    chainId: 1,
    rpcUrl: 'https://eth.llamarpc.com',
    explorerUrl: 'https://etherscan.io',
    description: 'The original smart contract platform and largest blockchain ecosystem',
    category: 'evm',
    sdks: [
      {
        name: 'ethers.js',
        installCommand: 'npm install ethers',
        description: 'Complete Ethereum wallet interaction and utilities',
      },
      {
        name: 'viem',
        installCommand: 'npm install viem',
        description: 'Modern TypeScript-first Ethereum interface',
      },
      {
        name: 'wagmi',
        installCommand: 'npm install wagmi',
        description: 'React Hooks for Ethereum',
      },
    ],
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    symbol: 'AVAX',
    chainId: 43114,
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    explorerUrl: 'https://snowtrace.io',
    description: 'High-speed, low-cost smart contracts platform with three chains',
    category: 'evm',
    sdks: [
      {
        name: 'ethers.js',
        installCommand: 'npm install ethers',
        description: 'Ethers.js works with all EVM-compatible chains',
      },
      {
        name: 'avalanche-sdk',
        installCommand: 'npm install avalanche',
        description: 'Official Avalanche TypeScript SDK',
      },
    ],
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    chainId: 137,
    rpcUrl: 'https://polygon.llamarpc.com',
    explorerUrl: 'https://polygonscan.com',
    description: 'Leading Ethereum scaling and infrastructure development',
    category: 'layer2',
    sdks: [
      {
        name: 'ethers.js',
        installCommand: 'npm install ethers',
        description: 'Works seamlessly with Polygon',
      },
      {
        name: 'polygon-sdk',
        installCommand: 'npm install @maticnetwork/maticjs',
        description: 'Official Polygon SDK',
      },
    ],
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    symbol: 'ARB',
    chainId: 42161,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    description: 'Optimistic rollup scaling solution for Ethereum',
    category: 'layer2',
    sdks: [
      {
        name: 'ethers.js',
        installCommand: 'npm install ethers',
        description: 'Full EVM compatibility',
      },
      {
        name: 'arbitrum-sdk',
        installCommand: 'npm install @arbitrum/sdk',
        description: 'Official Arbitrum SDK',
      },
    ],
  },
  {
    id: 'base',
    name: 'Base',
    symbol: 'ETH',
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    description: 'Coinbase\'s Ethereum L2 for easy onboarding',
    category: 'layer2',
    sdks: [
      {
        name: 'ethers.js',
        installCommand: 'npm install ethers',
        description: 'Full EVM compatibility',
      },
      {
        name: 'viem',
        installCommand: 'npm install viem',
        description: 'Optimized for Base',
      },
    ],
  },
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    chainId: 0,
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    explorerUrl: 'https://explorer.solana.com',
    description: 'High-performance blockchain for decentralized apps',
    category: 'non-evm',
    sdks: [
      {
        name: '@solana/web3.js',
        installCommand: 'npm install @solana/web3.js',
        description: 'Official Solana JavaScript SDK',
      },
      {
        name: '@solana/spl-token',
        installCommand: 'npm install @solana/spl-token',
        description: 'SPL Token standard implementation',
      },
    ],
  },
  {
    id: 'ton',
    name: 'TON',
    symbol: 'TON',
    chainId: 0,
    rpcUrl: 'https://toncenter.com/api/v2/jsonRPC',
    explorerUrl: 'https://tonscan.org',
    description: 'The Open Network - fast and scalable blockchain',
    category: 'non-evm',
    sdks: [
      {
        name: 'ton',
        installCommand: 'npm install ton',
        description: 'Official TON SDK',
      },
      {
        name: '@ton/ton',
        installCommand: 'npm install @ton/ton @ton/core',
        description: 'Modern TON TypeScript SDK',
      },
    ],
  },
];

const SDKS: SDK[] = [
  // Blockchain SDKs
  {
    id: 'ethers',
    name: 'ethers.js',
    category: 'blockchain',
    description: 'Complete Ethereum wallet interaction, smart contract utilities, and more',
    installCommand: 'npm install ethers',
    docsUrl: 'https://docs.ethers.org',
    requiredEnvVars: [],
  },
  {
    id: 'viem',
    name: 'viem',
    category: 'blockchain',
    description: 'TypeScript-first Ethereum interface with better performance',
    installCommand: 'npm install viem',
    docsUrl: 'https://viem.sh',
    requiredEnvVars: [],
  },
  {
    id: 'wagmi',
    name: 'wagmi',
    category: 'blockchain',
    description: 'React Hooks for Ethereum with wallet connection',
    installCommand: 'npm install wagmi viem',
    docsUrl: 'https://wagmi.sh',
    requiredEnvVars: [],
  },
  // Storage SDKs
  {
    id: 'ipfs',
    name: 'IPFS',
    category: 'storage',
    description: 'Decentralized storage network for NFTs and files',
    installCommand: 'npm install ipfs-http-client',
    docsUrl: 'https://docs.ipfs.io',
    requiredEnvVars: [],
  },
  {
    id: 'pinata',
    name: 'Pinata',
    category: 'storage',
    description: 'IPFS pinning service with easy API',
    installCommand: 'npm install @pinata/sdk',
    docsUrl: 'https://docs.pinata.cloud',
    requiredEnvVars: [
      {
        key: 'PINATA_API_KEY',
        description: 'Pinata API Key',
        placeholder: 'your_pinata_api_key',
      },
      {
        key: 'PINATA_SECRET_KEY',
        description: 'Pinata API Secret',
        placeholder: 'your_pinata_secret_key',
      },
    ],
  },
  // Auth SDKs
  {
    id: 'nextauth',
    name: 'NextAuth.js',
    category: 'auth',
    description: 'Authentication for Next.js with many providers',
    installCommand: 'npm install next-auth',
    docsUrl: 'https://next-auth.js.org',
    requiredEnvVars: [
      {
        key: 'NEXTAUTH_SECRET',
        description: 'NextAuth secret key',
        placeholder: 'your_nextauth_secret',
      },
      {
        key: 'NEXTAUTH_URL',
        description: 'NextAuth URL',
        placeholder: 'http://localhost:3000',
      },
    ],
  },
  {
    id: 'clerk',
    name: 'Clerk',
    category: 'auth',
    description: 'Complete authentication and user management',
    installCommand: 'npm install @clerk/nextjs',
    docsUrl: 'https://clerk.com/docs',
    requiredEnvVars: [
      {
        key: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
        description: 'Clerk Publishable Key',
        placeholder: 'pk_test_...',
      },
      {
        key: 'CLERK_SECRET_KEY',
        description: 'Clerk Secret Key',
        placeholder: 'sk_test_...',
      },
    ],
  },
  // AI SDKs
  {
    id: 'openai',
    name: 'OpenAI',
    category: 'ai',
    description: 'GPT models and AI capabilities',
    installCommand: 'npm install openai',
    docsUrl: 'https://platform.openai.com/docs',
    requiredEnvVars: [
      {
        key: 'OPENAI_API_KEY',
        description: 'OpenAI API Key',
        placeholder: 'sk-...',
      },
    ],
  },
  {
    id: 'langchain',
    name: 'LangChain',
    category: 'ai',
    description: 'Framework for building AI applications',
    installCommand: 'npm install langchain',
    docsUrl: 'https://js.langchain.com',
    requiredEnvVars: [],
  },
  // Payment SDKs
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'payment',
    description: 'Payment processing platform',
    installCommand: 'npm install stripe',
    docsUrl: 'https://stripe.com/docs',
    requiredEnvVars: [
      {
        key: 'STRIPE_SECRET_KEY',
        description: 'Stripe Secret Key',
        placeholder: 'sk_test_...',
      },
      {
        key: 'STRIPE_PUBLISHABLE_KEY',
        description: 'Stripe Publishable Key',
        placeholder: 'pk_test_...',
      },
    ],
  },
  {
    id: 'coinbase-commerce',
    name: 'Coinbase Commerce',
    category: 'payment',
    description: 'Crypto payment gateway',
    installCommand: 'npm install @coinbase/commerce-sdk',
    docsUrl: 'https://commerce.coinbase.com/docs',
    requiredEnvVars: [
      {
        key: 'COINBASE_COMMERCE_API_KEY',
        description: 'Coinbase Commerce API Key',
        placeholder: 'your_api_key',
      },
    ],
  },
  // Analytics SDKs
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    category: 'analytics',
    description: 'Web analytics and reporting',
    installCommand: 'npm install @next/third-parties',
    docsUrl: 'https://developers.google.com/analytics',
    requiredEnvVars: [
      {
        key: 'NEXT_PUBLIC_GA_MEASUREMENT_ID',
        description: 'GA Measurement ID',
        placeholder: 'G-XXXXXXXXXX',
      },
    ],
  },
  {
    id: 'mixpanel',
    name: 'Mixpanel',
    category: 'analytics',
    description: 'Product analytics for web and mobile',
    installCommand: 'npm install mixpanel-browser',
    docsUrl: 'https://developer.mixpanel.com',
    requiredEnvVars: [
      {
        key: 'NEXT_PUBLIC_MIXPANEL_TOKEN',
        description: 'Mixpanel Project Token',
        placeholder: 'your_mixpanel_token',
      },
    ],
  },
];

const EXTERNAL_APIS: ExternalAPI[] = [
  {
    id: 'openai-api',
    name: 'OpenAI API',
    category: 'ai',
    description: 'Access GPT-4, DALL-E, and other AI models',
    baseUrl: 'https://api.openai.com/v1',
    docsUrl: 'https://platform.openai.com/docs',
    requiredEnvVars: [
      {
        key: 'OPENAI_API_KEY',
        description: 'OpenAI API Key',
        placeholder: 'sk-...',
      },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    category: 'ai',
    description: 'Claude AI models for various applications',
    baseUrl: 'https://api.anthropic.com/v1',
    docsUrl: 'https://docs.anthropic.com',
    requiredEnvVars: [
      {
        key: 'ANTHROPIC_API_KEY',
        description: 'Anthropic API Key',
        placeholder: 'sk-ant-...',
      },
    ],
  },
  {
    id: 'weatherapi',
    name: 'WeatherAPI',
    category: 'data',
    description: 'Real-time and forecast weather data',
    baseUrl: 'https://api.weatherapi.com/v1',
    docsUrl: 'https://www.weatherapi.com/docs',
    requiredEnvVars: [
      {
        key: 'WEATHER_API_KEY',
        description: 'WeatherAPI Key',
        placeholder: 'your_api_key',
      },
    ],
  },
  {
    id: 'resend',
    name: 'Resend',
    category: 'communication',
    description: 'Email API for developers',
    baseUrl: 'https://api.resend.com',
    docsUrl: 'https://resend.com/docs',
    requiredEnvVars: [
      {
        key: 'RESEND_API_KEY',
        description: 'Resend API Key',
        placeholder: 're_...',
      },
    ],
  },
  {
    id: 'twilio',
    name: 'Twilio',
    category: 'communication',
    description: 'SMS, voice, and communication APIs',
    baseUrl: 'https://api.twilio.com',
    docsUrl: 'https://www.twilio.com/docs',
    requiredEnvVars: [
      {
        key: 'TWILIO_ACCOUNT_SID',
        description: 'Twilio Account SID',
        placeholder: 'AC...',
      },
      {
        key: 'TWILIO_AUTH_TOKEN',
        description: 'Twilio Auth Token',
        placeholder: 'your_auth_token',
      },
    ],
  },
  {
    id: 'coingecko',
    name: 'CoinGecko',
    category: 'data',
    description: 'Cryptocurrency prices and market data',
    baseUrl: 'https://api.coingecko.com/api/v3',
    docsUrl: 'https://www.coingecko.com/en/api/documentation',
    requiredEnvVars: [],
  },
  {
    id: 'github',
    name: 'GitHub API',
    category: 'data',
    description: 'Access GitHub repositories, users, and more',
    baseUrl: 'https://api.github.com',
    docsUrl: 'https://docs.github.com/en/rest',
    requiredEnvVars: [
      {
        key: 'GITHUB_TOKEN',
        description: 'GitHub Personal Access Token',
        placeholder: 'ghp_...',
      },
    ],
  },
];

const generateId = () => Math.random().toString(36).substring(2, 11);

export const PlatformsGuide: React.FC<PlatformsGuideProps> = ({
  envVariables,
  onChange,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['blockchains', 'sdks', 'apis']));
  const [copiedCommands, setCopiedCommands] = useState<Set<string>>(new Set());

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  const copyToClipboard = useCallback(async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedCommands(prev => new Set(prev).add(id));
    setTimeout(() => {
      setCopiedCommands(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 2000);
  }, []);

  const addEnvVars = useCallback((vars: { key: string; value: string; description: string }[]) => {
    const now = new Date();
    const newVars = vars
      .filter(v => !envVariables.some(ev => ev.key === v.key))
      .map(v => ({
        id: generateId(),
        key: v.key,
        value: v.value,
        description: v.description,
        isSecret: v.key.toLowerCase().includes('secret') || v.key.toLowerCase().includes('key') || v.key.toLowerCase().includes('token'),
        environment: 'development' as const,
        createdAt: now,
        updatedAt: now,
      }));

    if (newVars.length > 0) {
      onChange([...envVariables, ...newVars]);
    }

    return newVars.length;
  }, [envVariables, onChange]);

  const addBlockchainEnvVars = useCallback((blockchain: Blockchain) => {
    const vars = [
      {
        key: `${blockchain.symbol.toUpperCase()}_RPC_URL`,
        value: blockchain.rpcUrl,
        description: `${blockchain.name} RPC URL`,
      },
    ];

    const added = addEnvVars(vars);
    if (added > 0) {
      alert(`Added ${added} environment variable(s) for ${blockchain.name}`);
    } else {
      alert('Environment variables already exist');
    }
  }, [addEnvVars]);

  const addSDKEnvVars = useCallback((sdk: SDK) => {
    const vars = sdk.requiredEnvVars.map(v => ({
      key: v.key.startsWith('NEXT_PUBLIC_') ? v.key : v.key,
      value: v.placeholder,
      description: v.description,
    }));

    const added = addEnvVars(vars);
    if (added > 0) {
      alert(`Added ${added} environment variable(s) for ${sdk.name}`);
    } else {
      alert('Environment variables already exist');
    }
  }, [addEnvVars]);

  const addAPIEnvVars = useCallback((api: ExternalAPI) => {
    const vars = api.requiredEnvVars.map(v => ({
      key: v.key.startsWith('NEXT_PUBLIC_') ? v.key : v.key,
      value: v.placeholder,
      description: v.description,
    }));

    const added = addEnvVars(vars);
    if (added > 0) {
      alert(`Added ${added} environment variable(s) for ${api.name}`);
    } else {
      alert('Environment variables already exist');
    }
  }, [addEnvVars]);

  const hasEnvVars = useCallback((keys: string[]) => {
    return keys.some(key => envVariables.some(ev => ev.key === key));
  }, [envVariables]);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      evm: '#627eea',
      'non-evm': '#00ffa3',
      layer2: '#8b5cf6',
      blockchain: '#f59e0b',
      storage: '#10b981',
      auth: '#3b82f6',
      ai: '#ec4899',
      payment: '#8b5cf6',
      analytics: '#f97316',
      data: '#06b6d4',
      communication: '#14b8a6',
      social: '#a855f7',
      other: '#6b7280',
    };
    return colors[category] || '#6b7280';
  };

  return (
    <div className="platforms-guide">
      {/* Header */}
      <div className="platforms-guide__header">
        <div className="platforms-guide__title">
          <Sparkles size={20} />
          <h3>Platforms, SDKs & APIs Guide</h3>
        </div>
        <p className="platforms-guide__subtitle">
          Discover available integrations and quickly add required environment variables
        </p>
      </div>

      {/* Info Box */}
      <div className="platforms-guide__info">
        <InfoIcon />
        <div>
          <strong>Quick Start Guide</strong>
          <p>Browse the available platforms, SDKs, and APIs below. Click "Add to Project" to automatically add required environment variables to your project. Use the copy button to copy installation commands.</p>
        </div>
      </div>

      {/* Blockchains Section */}
      <div className="platforms-guide__section">
        <button
          className="platforms-guide__section-header"
          onClick={() => toggleSection('blockchains')}
        >
          <div className="platforms-guide__section-title">
            <Globe size={18} />
            <h4>Blockchains & Networks</h4>
            <span className="platforms-guide__badge">{BLOCKCHAINS.length}</span>
          </div>
          {expandedSections.has('blockchains') ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {expandedSections.has('blockchains') && (
          <div className="platforms-guide__content">
            <div className="platforms-guide__grid">
              {BLOCKCHAINS.map(blockchain => (
                <div key={blockchain.id} className="platforms-guide__card">
                  <div className="platforms-guide__card-header">
                    <div className="platforms-guide__card-icon" style={{ backgroundColor: getCategoryColor(blockchain.category) }}>
                      {blockchain.symbol.charAt(0)}
                    </div>
                    <div className="platforms-guide__card-title">
                      <h5>{blockchain.name}</h5>
                      <span className="platforms-guide__category-badge" style={{ backgroundColor: `${getCategoryColor(blockchain.category)}20`, color: getCategoryColor(blockchain.category) }}>
                        {blockchain.category}
                      </span>
                    </div>
                    <div className="platforms-guide__card-actions">
                      <a
                        href={blockchain.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="platforms-guide__icon-btn"
                        title="View Explorer"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>

                  <p className="platforms-guide__card-desc">{blockchain.description}</p>

                  <div className="platforms-guide__card-details">
                    <div className="platforms-guide__detail">
                      <span className="platforms-guide__detail-label">Chain ID:</span>
                      <code>{blockchain.chainId}</code>
                    </div>
                    <div className="platforms-guide__detail">
                      <span className="platforms-guide__detail-label">Symbol:</span>
                      <code>{blockchain.symbol}</code>
                    </div>
                  </div>

                  <div className="platforms-guide__sdks">
                    <span className="platforms-guide__sdks-title">SDKs:</span>
                    <div className="platforms-guide__sdks-list">
                      {blockchain.sdks.map((sdk, idx) => (
                        <div key={idx} className="platforms-guide__sdk-item">
                          <code>{sdk.name}</code>
                          <button
                            className="platforms-guide__copy-btn"
                            onClick={() => copyToClipboard(sdk.installCommand, `${blockchain.id}-${sdk.id}`)}
                          >
                            {copiedCommands.has(`${blockchain.id}-${sdk.id}`) ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    className="platforms-guide__add-btn"
                    onClick={() => addBlockchainEnvVars(blockchain)}
                  >
                    <Plus size={14} />
                    Add RPC URL to Project
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SDKs Section */}
      <div className="platforms-guide__section">
        <button
          className="platforms-guide__section-header"
          onClick={() => toggleSection('sdks')}
        >
          <div className="platforms-guide__section-title">
            <Code2 size={18} />
            <h4>SDKs & Libraries</h4>
            <span className="platforms-guide__badge">{SDKS.length}</span>
          </div>
          {expandedSections.has('sdks') ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {expandedSections.has('sdks') && (
          <div className="platforms-guide__content">
            <div className="platforms-guide__grid">
              {SDKS.map(sdk => (
                <div key={sdk.id} className="platforms-guide__card">
                  <div className="platforms-guide__card-header">
                    <div className="platforms-guide__card-icon" style={{ backgroundColor: getCategoryColor(sdk.category) }}>
                      <Code2 size={16} />
                    </div>
                    <div className="platforms-guide__card-title">
                      <h5>{sdk.name}</h5>
                      <span className="platforms-guide__category-badge" style={{ backgroundColor: `${getCategoryColor(sdk.category)}20`, color: getCategoryColor(sdk.category) }}>
                        {sdk.category}
                      </span>
                    </div>
                    <div className="platforms-guide__card-actions">
                      <a
                        href={sdk.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="platforms-guide__icon-btn"
                        title="View Docs"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>

                  <p className="platforms-guide__card-desc">{sdk.description}</p>

                  <div className="platforms-guide__install">
                    <code className="platforms-guide__install-cmd">{sdk.installCommand}</code>
                    <button
                      className="platforms-guide__copy-btn"
                      onClick={() => copyToClipboard(sdk.installCommand, sdk.id)}
                    >
                      {copiedCommands.has(sdk.id) ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>

                  {sdk.requiredEnvVars.length > 0 && (
                    <>
                      <div className="platforms-guide__env-vars">
                        <span className="platforms-guide__env-vars-title">
                          Required Environment Variables:
                        </span>
                        {sdk.requiredEnvVars.map((envVar, idx) => (
                          <div key={idx} className="platforms-guide__env-var">
                            <code>{envVar.key}</code>
                            <span>{envVar.description}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        className="platforms-guide__add-btn"
                        onClick={() => addSDKEnvVars(sdk)}
                        disabled={hasEnvVars(sdk.requiredEnvVars.map(v => v.key))}
                      >
                        <Plus size={14} />
                        {hasEnvVars(sdk.requiredEnvVars.map(v => v.key)) ? 'Env Vars Added' : 'Add Env Vars'}
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* External APIs Section */}
      <div className="platforms-guide__section">
        <button
          className="platforms-guide__section-header"
          onClick={() => toggleSection('apis')}
        >
          <div className="platforms-guide__section-title">
            <Layers size={18} />
            <h4>External APIs</h4>
            <span className="platforms-guide__badge">{EXTERNAL_APIS.length}</span>
          </div>
          {expandedSections.has('apis') ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {expandedSections.has('apis') && (
          <div className="platforms-guide__content">
            <div className="platforms-guide__grid">
              {EXTERNAL_APIS.map(api => (
                <div key={api.id} className="platforms-guide__card">
                  <div className="platforms-guide__card-header">
                    <div className="platforms-guide__card-icon" style={{ backgroundColor: getCategoryColor(api.category) }}>
                      <Box size={16} />
                    </div>
                    <div className="platforms-guide__card-title">
                      <h5>{api.name}</h5>
                      <span className="platforms-guide__category-badge" style={{ backgroundColor: `${getCategoryColor(api.category)}20`, color: getCategoryColor(api.category) }}>
                        {api.category}
                      </span>
                    </div>
                    <div className="platforms-guide__card-actions">
                      <a
                        href={api.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="platforms-guide__icon-btn"
                        title="View Docs"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>

                  <p className="platforms-guide__card-desc">{api.description}</p>

                  <div className="platforms-guide__detail">
                    <span className="platforms-guide__detail-label">Base URL:</span>
                    <code className="platforms-guide__url">{api.baseUrl}</code>
                  </div>

                  {api.requiredEnvVars.length > 0 && (
                    <>
                      <div className="platforms-guide__env-vars">
                        <span className="platforms-guide__env-vars-title">
                          Required Environment Variables:
                        </span>
                        {api.requiredEnvVars.map((envVar, idx) => (
                          <div key={idx} className="platforms-guide__env-var">
                            <code>{envVar.key}</code>
                            <span>{envVar.description}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        className="platforms-guide__add-btn"
                        onClick={() => addAPIEnvVars(api)}
                        disabled={hasEnvVars(api.requiredEnvVars.map(v => v.key))}
                      >
                        <Plus size={14} />
                        {hasEnvVars(api.requiredEnvVars.map(v => v.key)) ? 'Env Vars Added' : 'Add Env Vars'}
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const InfoIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);
