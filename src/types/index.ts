// Base types from original template
export interface FileNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: FileNode[];
  path: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  codeBlocks?: CodeBlock[];
}

export interface CodeBlock {
  filename: string;
  language: string;
  code: string;
}

export interface UserProfile {
  userId: string;
  username: string;
  userHandle: string;
  userName: string;
  userImageUrl: string;
  followerCount: number;
  badges: string[];
  ticketHoldings: number;
  ticketHolders: string;
  tokenHoldings: string;
}

export interface SubscriptionPlan {
  id: 'starter' | 'pro' | 'premium';
  name: string;
  price: number;
  appsLimit: number;
  messagesLimit: number;
  features: string[];
}

export interface UserSubscription {
  planId: string;
  appsUsed: number;
  messagesUsed: number;
  expiresAt: Date;
}

export type AIProvider = 'groq' | 'gemini' | 'openrouter';

export interface Project {
  id: string;
  name: string;
  files: FileNode[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  deployedUrl?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  aiProvider: AIProvider;
  autoSave: boolean;
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
}

export interface APIKeys {
  groq: string;
  gemini: string;
  openrouter: string;
}

// Fee-related types
export interface GasPrice {
  slow: number;
  standard: number;
  fast: number;
  lastUpdated: Date;
}

export interface GasPriceOption {
  id: 'slow' | 'standard' | 'fast';
  label: string;
  priceInGwei: number;
  estimatedTime: string;
  description: string;
}

export interface TransactionFee {
  gasPrice: number;
  gasLimit: number;
  totalInAvax: number;
  totalInUsd: number;
}

export interface DeploymentCost {
  platform: string;
  framework: string;
  pages: number;
  baseCost: number;
  computeUnitCost: number;
  bandwidthCost: number;
  storageCost: number;
  gasFee: number;
  total: number;
}

export interface DeploymentEstimate {
  platform: string;
  monthlyBandwidth: number;
  monthlyStorage: number;
  computeUnits: number;
  gasFee: number;
  totalMonthly: number;
}

export interface SubscriptionPricing {
  planId: string;
  planName: string;
  subtotal: number;
  processingFee: number;
  gasFee: number;
  total: number;
  billingPeriod: 'monthly' | 'yearly';
}

export interface PlatformPricing {
  platform: string;
  freeTier: {
    bandwidth: number;
    builds: number;
    storage: number;
  };
  paidTiers: {
    name: string;
    price: number;
    bandwidth: number;
    builds: number;
    storage: number;
  }[];
}

// Onboarding types
export interface OnboardingProgress {
  completedSteps: string[];
  currentStep: number;
  totalSteps: number;
  selectedTemplate?: string;
  selectedPlan?: string;
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  projectType?: 'web-app' | 'mobile-app' | 'api' | 'website';
  aiProvider?: 'groq' | 'gemini' | 'openrouter';
  goal?: 'build-app' | 'learn' | 'portfolio';
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  component: string;
}

// Template types
export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  techStack: string[];
  files: FileNode[];
  features: string[];
  popularity: number;
}

export interface TemplateCategory {
  id: string;
  name: string;
  icon: string;
  templateCount: number;
}

// App configuration types
export interface AppConfig {
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
}

// Validation types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ValidationRule {
  validate: (value: string) => boolean;
  message: string;
}

// Rate limiter types
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitState {
  remaining: number;
  reset: number;
  blocked: boolean;
}

// Multi-Chain Wallet Types
export type ChainType = 'ethereum' | 'base' | 'solana' | 'bitcoin' | 'ton';

export type ChainNamespace = 'eip155' | 'solana' | 'bip122' | 'ton';

export interface ChainConfig {
  id: number | string;
  name: string;
  type: ChainType;
  namespace: ChainNamespace;
  currency: string;
  explorerUrl: string;
  rpcUrl?: string;
  testnet?: boolean;
}

export type WalletConnector = 'metamask' | 'rainbow' | 'coinbase' | 'walletconnect' | 'phantom' | 'okx' | 'trust';

export interface WalletConnection {
  isConnected: boolean;
  address: string | null;
  chainId: number | string | null;
  chainType: ChainType | null;
  connector: WalletConnector | null;
  balance: string | null;
}

export interface AppKitConfig {
  projectId: string;
  chains: ChainConfig[];
  defaultChain: ChainType;
  enableWallets: WalletConnector[];
  metadata: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
}

export interface WalletTransaction {
  to: string;
  value: string;
  data?: string;
  chainId?: number | string;
}

export interface WalletSignature {
  message: string;
  signature: string;
  address: string;
}

// Fullstack Configuration types
export type DatabaseType = 'postgresql' | 'mysql' | 'mongodb' | 'supabase' | 'neon' | 'none';

export type BackendRuntime = 'nodejs' | 'bun' | 'deno';

export type BackendFramework = 'express' | 'fastify' | 'nestjs' | 'nextjs' | 'none';

export interface EnvVariable {
  id: string;
  key: string;
  value: string;
  description: string;
  isSecret: boolean;
  environment: 'development' | 'staging' | 'production';
  createdAt: Date;
  updatedAt: Date;
}

export interface DatabaseConnection {
  id: string;
  type: DatabaseType;
  name: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  connectionString?: string;
  ssl: boolean;
  isConnected: boolean;
  lastTested?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BackendConfig {
  id: string;
  runtime: BackendRuntime;
  framework: BackendFramework;
  port: number;
  startScript: string;
  installScript: string;
  buildScript: string;
  customDependencies: Record<string, string>;
  environment: 'development' | 'staging' | 'production';
  createdAt: Date;
  updatedAt: Date;
}

export interface ArenaAppConfig {
  enabled: boolean;
  appName: string;
  appDescription: string;
  port: number;
  enableWagmiConnector: boolean;
  enableWalletSupport: boolean;
  enableProfileSupport: boolean;
  enableTransactions: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FullStackConfig {
  projectId: string;
  envVariables: EnvVariable[];
  databaseConnections: DatabaseConnection[];
  backendConfig: BackendConfig;
  arenaConfig?: ArenaAppConfig;
  createdAt: Date;
  updatedAt: Date;
}
