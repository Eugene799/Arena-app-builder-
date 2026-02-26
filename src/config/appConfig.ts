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
