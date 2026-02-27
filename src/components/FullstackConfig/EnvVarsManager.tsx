import React, { useState, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Download,
  Upload,
  Key,
  RefreshCw,
  Check,
  X,
  Lightbulb,
  Database,
  Globe,
  Server,
  Link,
} from 'lucide-react';
import type { EnvVariable, SuggestedEnvVar, SuggestedEnvVarCategory } from '../../types';
import './FullstackConfig.css';

interface EnvVarsManagerProps {
  envVariables: EnvVariable[];
  onChange: (envVariables: EnvVariable[]) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

/**
 * Suggested environment variables for dApp building.
 * These are OPTIONAL suggestions for users building dApps, not required for the builder itself.
 */
const SUGGESTED_ENV_VAR_CATEGORIES: SuggestedEnvVarCategory[] = [
  {
    id: 'blockchain-rpc',
    name: 'Blockchain RPC URLs',
    description: 'RPC endpoints for connecting to various blockchain networks',
    icon: 'Globe',
    variables: [
      { key: 'SEPOLIA_RPC_URL', description: 'Ethereum Sepolia testnet RPC endpoint', category: 'blockchain-rpc', isSecret: false },
      { key: 'BASE_RPC_URL', description: 'Base mainnet RPC endpoint', category: 'blockchain-rpc', isSecret: false },
      { key: 'SOLANA_RPC_URL', description: 'Solana RPC endpoint (e.g., Helius, QuickNode)', category: 'blockchain-rpc', isSecret: false },
      { key: 'AVAX_RPC_URL', description: 'Avalanche C-Chain RPC endpoint', category: 'blockchain-rpc', isSecret: false },
      { key: 'POLYGON_RPC_URL', description: 'Polygon mainnet RPC endpoint', category: 'blockchain-rpc', isSecret: false },
      { key: 'ARBITRUM_RPC_URL', description: 'Arbitrum One RPC endpoint', category: 'blockchain-rpc', isSecret: false },
    ],
  },
  {
    id: 'external-api',
    name: 'External API Keys',
    description: 'API keys for external services and providers',
    icon: 'Server',
    variables: [
      { key: 'ALCHEMY_API_KEY', description: 'Alchemy API key for enhanced blockchain access', category: 'external-api', isSecret: true },
      { key: 'QUICKNODE_API_KEY', description: 'QuickNode API key for dedicated RPC access', category: 'external-api', isSecret: true },
      { key: 'INFURA_API_KEY', description: 'Infura API key for Ethereum access', category: 'external-api', isSecret: true },
      { key: 'MORALIS_API_KEY', description: 'Moralis API key for Web3 data', category: 'external-api', isSecret: true },
      { key: 'COINBASE_COMMERCE_KEY', description: 'Coinbase Commerce API key for payments', category: 'external-api', isSecret: true },
    ],
  },
  {
    id: 'database',
    name: 'Database Connections',
    description: 'Connection strings and credentials for database services',
    icon: 'Database',
    variables: [
      { key: 'SUPABASE_URL', description: 'Supabase project URL', category: 'database', isSecret: false },
      { key: 'SUPABASE_ANON_KEY', description: 'Supabase anonymous key for client-side access', category: 'database', isSecret: true },
      { key: 'SUPABASE_SERVICE_ROLE_KEY', description: 'Supabase service role key for admin access', category: 'database', isSecret: true },
      { key: 'NEON_CONNECTION_STRING', description: 'Neon PostgreSQL connection string', category: 'database', isSecret: true },
      { key: 'PLANETSCALE_URL', description: 'PlanetScale database URL', category: 'database', isSecret: true },
      { key: 'MONGODB_URI', description: 'MongoDB connection URI', category: 'database', isSecret: true },
      { key: 'REDIS_URL', description: 'Redis connection URL', category: 'database', isSecret: true },
    ],
  },
  {
    id: 'auth',
    name: 'Authentication',
    description: 'Authentication provider credentials',
    icon: 'Key',
    variables: [
      { key: 'NEXTAUTH_SECRET', description: 'NextAuth.js secret key for JWT signing', category: 'auth', isSecret: true },
      { key: 'NEXTAUTH_URL', description: 'NextAuth.js callback URL', category: 'auth', isSecret: false },
      { key: 'AUTH0_DOMAIN', description: 'Auth0 tenant domain', category: 'auth', isSecret: false },
      { key: 'AUTH0_CLIENT_ID', description: 'Auth0 application client ID', category: 'auth', isSecret: false },
      { key: 'AUTH0_CLIENT_SECRET', description: 'Auth0 application client secret', category: 'auth', isSecret: true },
    ],
  },
  {
    id: 'storage',
    name: 'File Storage',
    description: 'Decentralized and cloud storage providers',
    icon: 'Link',
    variables: [
      { key: 'PINATA_API_KEY', description: 'Pinata API key for IPFS uploads', category: 'storage', isSecret: true },
      { key: 'PINATA_SECRET_KEY', description: 'Pinata secret key for IPFS', category: 'storage', isSecret: true },
      { key: 'AWS_ACCESS_KEY_ID', description: 'AWS access key for S3 storage', category: 'storage', isSecret: true },
      { key: 'AWS_SECRET_ACCESS_KEY', description: 'AWS secret key for S3 storage', category: 'storage', isSecret: true },
      { key: 'AWS_S3_BUCKET', description: 'AWS S3 bucket name', category: 'storage', isSecret: false },
    ],
  },
];

const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'Globe': return Globe;
    case 'Server': return Server;
    case 'Database': return Database;
    case 'Key': return Key;
    case 'Link': return Link;
    default: return Key;
  }
};

export const EnvVarsManager: React.FC<EnvVarsManagerProps> = ({
  envVariables,
  onChange,
}) => {
  const [showValues, setShowValues] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [newVar, setNewVar] = useState<Partial<EnvVariable>>({
    key: '',
    value: '',
    description: '',
    isSecret: false,
    environment: 'development',
  });

  const toggleValueVisibility = useCallback((id: string) => {
    setShowValues(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

  const addSuggestedVariable = useCallback((suggested: SuggestedEnvVar) => {
    const now = new Date();
    const variable: EnvVariable = {
      id: generateId(),
      key: suggested.key,
      value: suggested.defaultValue || '',
      description: suggested.description,
      isSecret: suggested.isSecret,
      environment: 'development',
      createdAt: now,
      updatedAt: now,
    };

    onChange([...envVariables, variable]);
  }, [envVariables, onChange]);

  const isVariableAdded = useCallback((key: string) => {
    return envVariables.some(v => v.key === key);
  }, [envVariables]);

  const addVariable = useCallback(() => {
    if (!newVar.key?.trim()) return;

    const now = new Date();
    const variable: EnvVariable = {
      id: generateId(),
      key: newVar.key.trim(),
      value: newVar.value || '',
      description: newVar.description || '',
      isSecret: newVar.isSecret || false,
      environment: newVar.environment || 'development',
      createdAt: now,
      updatedAt: now,
    };

    onChange([...envVariables, variable]);
    setNewVar({
      key: '',
      value: '',
      description: '',
      isSecret: false,
      environment: 'development',
    });
  }, [newVar, envVariables, onChange]);

  const updateVariable = useCallback((id: string, updates: Partial<EnvVariable>) => {
    onChange(
      envVariables.map(v =>
        v.id === id ? { ...v, ...updates, updatedAt: new Date() } : v
      )
    );
  }, [envVariables, onChange]);

  const deleteVariable = useCallback((id: string) => {
    onChange(envVariables.filter(v => v.id !== id));
  }, [envVariables, onChange]);

  const exportEnvFile = useCallback(() => {
    const envContent = envVariables
      .map(v => `${v.key}=${v.value}`)
      .join('\n');

    const blob = new Blob([envContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.env';
    a.click();
    URL.revokeObjectURL(url);
  }, [envVariables]);

  const importEnvFile = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.env,.txt';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim() && !line.startsWith('#'));
      const now = new Date();

      const imported: EnvVariable[] = lines
        .map(line => {
          const eqIndex = line.indexOf('=');
          if (eqIndex === -1) return null;
          const key = line.substring(0, eqIndex).trim();
          const value = line.substring(eqIndex + 1).trim();
          if (!key) return null;

          return {
            id: generateId(),
            key,
            value,
            description: `Imported from ${file.name}`,
            isSecret: key.toLowerCase().includes('secret') || key.toLowerCase().includes('password') || key.toLowerCase().includes('key'),
            environment: 'development' as const,
            createdAt: now,
            updatedAt: now,
          };
        })
        .filter((v): v is EnvVariable => v !== null);

      onChange([...envVariables, ...imported]);
    };
    input.click();
  }, [envVariables, onChange]);

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'development': return 'var(--color-env-dev)';
      case 'staging': return 'var(--color-env-stage)';
      case 'production': return 'var(--color-env-prod)';
      default: return 'var(--color-text-muted)';
    }
  };

  return (
    <div className="env-vars-manager">
      <div className="env-vars-manager__header">
        <div className="env-vars-manager__title">
          <Key size={20} />
          <h3>Environment Variables</h3>
        </div>
        <div className="env-vars-manager__actions">
          <button
            className="env-vars-manager__action-btn"
            onClick={importEnvFile}
            title="Import .env file"
          >
            <Upload size={16} />
            Import
          </button>
          <button
            className="env-vars-manager__action-btn"
            onClick={exportEnvFile}
            disabled={envVariables.length === 0}
            title="Export .env file"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Add New Variable Form */}
      <div className="env-vars-manager__add-form">
        <div className="env-vars-manager__form-row">
          <input
            type="text"
            placeholder="KEY_NAME"
            value={newVar.key}
            onChange={e => setNewVar(prev => ({ ...prev, key: e.target.value.toUpperCase().replace(/\s/g, '_') }))}
            className="env-vars-manager__input"
          />
          <input
            type={newVar.isSecret ? 'password' : 'text'}
            placeholder="value"
            value={newVar.value}
            onChange={e => setNewVar(prev => ({ ...prev, value: e.target.value }))}
            className="env-vars-manager__input"
          />
          <select
            value={newVar.environment}
            onChange={e => setNewVar(prev => ({ ...prev, environment: e.target.value as any }))}
            className="env-vars-manager__select"
          >
            <option value="development">Development</option>
            <option value="staging">Staging</option>
            <option value="production">Production</option>
          </select>
          <label className="env-vars-manager__checkbox-label">
            <input
              type="checkbox"
              checked={newVar.isSecret}
              onChange={e => setNewVar(prev => ({ ...prev, isSecret: e.target.checked }))}
            />
            <EyeOff size={14} />
            Secret
          </label>
          <button
            className="env-vars-manager__add-btn"
            onClick={addVariable}
            disabled={!newVar.key?.trim()}
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>

      {/* Variables List */}
      <div className="env-vars-manager__list">
        {envVariables.length === 0 ? (
          <div className="env-vars-manager__empty">
            <Key size={32} />
            <p>No environment variables yet</p>
            <span>Add variables above or import from a .env file</span>
          </div>
        ) : (
          envVariables.map(variable => (
            <div key={variable.id} className="env-vars-manager__item">
              <div className="env-vars-manager__item-header">
                <span className="env-vars-manager__key">
                  {variable.isSecret && <EyeOff size={14} className="env-vars-manager__key-icon" />}
                  {variable.key}
                </span>
                <span
                  className="env-vars-manager__env-badge"
                  style={{ backgroundColor: getEnvironmentColor(variable.environment) }}
                >
                  {variable.environment}
                </span>
              </div>
              <div className="env-vars-manager__item-value">
                <code>
                  {showValues.has(variable.id) ? variable.value : '••••••••'}
                </code>
                <button
                  className="env-vars-manager__toggle-btn"
                  onClick={() => toggleValueVisibility(variable.id)}
                  title={showValues.has(variable.id) ? 'Hide value' : 'Show value'}
                >
                  {showValues.has(variable.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {variable.description && (
                <div className="env-vars-manager__item-desc">
                  {variable.description}
                </div>
              )}
              <div className="env-vars-manager__item-actions">
                <button
                  className="env-vars-manager__delete-btn"
                  onClick={() => deleteVariable(variable.id)}
                  title="Delete variable"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      {envVariables.length > 0 && (
        <div className="env-vars-manager__stats">
          <span>{envVariables.length} variable{envVariables.length !== 1 ? 's' : ''}</span>
          <span>•</span>
          <span>{envVariables.filter(v => v.isSecret).length} secret{envVariables.filter(v => v.isSecret).length !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Suggested Variables for dApp Building */}
      <div className="env-vars-manager__suggestions">
        <div className="env-vars-manager__suggestions-header">
          <Lightbulb size={18} />
          <h4>Suggested Variables for dApps</h4>
          <span className="env-vars-manager__suggestions-subtitle">
            Optional suggestions for your project
          </span>
        </div>
        
        <div className="env-vars-manager__categories">
          {SUGGESTED_ENV_VAR_CATEGORIES.map(category => {
            const CategoryIcon = getCategoryIcon(category.icon);
            const isExpanded = expandedCategories.has(category.id);
            const addedCount = category.variables.filter(v => isVariableAdded(v.key)).length;
            
            return (
              <div key={category.id} className="env-vars-manager__category">
                <button
                  className="env-vars-manager__category-header"
                  onClick={() => toggleCategory(category.id)}
                >
                  <CategoryIcon size={16} />
                  <span className="env-vars-manager__category-name">{category.name}</span>
                  <span className="env-vars-manager__category-count">
                    {addedCount}/{category.variables.length}
                  </span>
                  <span className="env-vars-manager__category-desc">{category.description}</span>
                  <span className={`env-vars-manager__category-chevron ${isExpanded ? 'expanded' : ''}`}>
                    ▼
                  </span>
                </button>
                
                {isExpanded && (
                  <div className="env-vars-manager__category-variables">
                    {category.variables.map(variable => {
                      const isAdded = isVariableAdded(variable.key);
                      
                      return (
                        <div
                          key={variable.key}
                          className={`env-vars-manager__suggested-var ${isAdded ? 'added' : ''}`}
                        >
                          <div className="env-vars-manager__suggested-var-info">
                            <span className="env-vars-manager__suggested-var-key">
                              {variable.key}
                              {variable.isSecret && (
                                <EyeOff size={12} className="env-vars-manager__suggested-secret-icon" />
                              )}
                            </span>
                            <span className="env-vars-manager__suggested-var-desc">
                              {variable.description}
                            </span>
                          </div>
                          <button
                            className="env-vars-manager__suggested-add-btn"
                            onClick={() => addSuggestedVariable(variable)}
                            disabled={isAdded}
                            title={isAdded ? 'Already added' : 'Add to your variables'}
                          >
                            {isAdded ? (
                              <>
                                <Check size={14} />
                                Added
                              </>
                            ) : (
                              <>
                                <Plus size={14} />
                                Add
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
