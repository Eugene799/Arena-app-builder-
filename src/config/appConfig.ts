/**
 * Arena AI Builder Application Configuration
 * 
 * REQUIRED BUILDER ENVIRONMENT VARIABLES (set at build time with VITE_ prefix):
 * 
 * 1. VITE_APP_NAME - Application name for the builder
 * 2. VITE_APP_URL - Base URL for the builder application
 * 3. VITE_GROQ_API_KEY - Groq API key for AI features
 * 4. VITE_GEMINI_API_KEY - Google Gemini API key for AI features
 * 5. VITE_OPENROUTER_API_KEY - OpenRouter API key for AI features
 * 6. VITE_LEONARDO_API_KEY - Leonardo AI API key for image generation
 * 7. VITE_VERCEL_TOKEN - Vercel deployment token
 * 8. VITE_NETLIFY_TOKEN - Netlify deployment token
 * 9. VITE_AVAX_RPC_URL - Avalanche RPC URL for blockchain features
 * 10. VITE_AVAX_CHAIN_ID - Avalanche chain ID (default: 43113 for testnet)
 * 
 * OPTIONAL FEATURE FLAG VARIABLES:
 * - VITE_ENABLE_ONBOARDING - Enable onboarding flow (default: true)
 * - VITE_SHOW_FEE_CALCULATOR - Show fee calculator (default: true)
 * - VITE_ENABLE_TEMPLATES - Enable project templates (default: true)
 * - VITE_RATE_LIMIT_REQUESTS - Rate limit max requests (default: 100)
 * - VITE_RATE_LIMIT_WINDOW - Rate limit window in ms (default: 60000)
 * 
 * NOTE: Variables prefixed with VITE_ are bundled at build time and cannot be
 * changed at runtime. For user-project environment variables (optional suggestions
 * for dApp building), see EnvVarsManager component.
 */

interface AppConfig {
  app: {
    name: string;
    url: string;
  };
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
  // Application metadata
  app: {
    name: getEnvVar('VITE_APP_NAME', 'Arena AI Builder'),
    url: getEnvVar('VITE_APP_URL', 'https://arena-ai-builder.app'),
  },
  // AI Provider API Keys
  api: {
    groqKey: getEnvVar('VITE_GROQ_API_KEY', ''),
    geminiKey: getEnvVar('VITE_GEMINI_API_KEY', ''),
    openrouterKey: getEnvVar('VITE_OPENROUTER_API_KEY', ''),
    leonardoKey: getEnvVar('VITE_LEONARDO_API_KEY', ''),
  },
  // Blockchain configuration (Avalanche)
  blockchain: {
    avaxRpcUrl: getEnvVar('VITE_AVAX_RPC_URL', 'https://api.avax-test.network/ext/bc/C/rpc'),
    avaxChainId: getEnvNum('VITE_AVAX_CHAIN_ID', 43113),
    avaxChainIdHex: getEnvVar('VITE_AVAX_CHAIN_ID_HEX', '0xa869'),
  },
  // Deployment platform tokens
  deployment: {
    vercelToken: getEnvVar('VITE_VERCEL_TOKEN', ''),
    netlifyToken: getEnvVar('VITE_NETLIFY_TOKEN', ''),
  },
  // Feature flags
  features: {
    onboardingEnabled: getEnvBool('VITE_ENABLE_ONBOARDING', true),
    feeCalculatorEnabled: getEnvBool('VITE_SHOW_FEE_CALCULATOR', true),
    templatesEnabled: getEnvBool('VITE_ENABLE_TEMPLATES', true),
  },
  // Rate limiting configuration
  rateLimit: {
    maxRequests: getEnvNum('VITE_RATE_LIMIT_REQUESTS', 100),
    windowMs: getEnvNum('VITE_RATE_LIMIT_WINDOW', 60000),
  },
  // Pricing configuration
  pricing: {
    processingFeePercent: 2.9,
    processingFeeFixed: 0.30,
    gasBufferPercent: 10,
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

export default appConfig;
