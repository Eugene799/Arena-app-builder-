import React, { useCallback } from 'react';
import {
  Store,
  Wallet,
  User,
  Send,
  Box,
  Info,
} from 'lucide-react';
import type { ArenaAppConfig } from '../../types';
import './FullstackConfig.css';

interface ArenaAppIntegrationProps {
  arenaConfig: ArenaAppConfig | undefined;
  onChange: (config: ArenaAppConfig) => void;
}

export const ArenaAppIntegration: React.FC<ArenaAppIntegrationProps> = ({
  arenaConfig,
  onChange,
}) => {
  const config = arenaConfig || {
    enabled: false,
    appName: '',
    appDescription: '',
    port: 3481,
    enableWagmiConnector: false,
    enableWalletSupport: false,
    enableProfileSupport: false,
    enableTransactions: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const handleEnabledChange = useCallback((enabled: boolean) => {
    onChange({
      ...config,
      enabled,
      updatedAt: new Date(),
    });
  }, [config, onChange]);

  const handleAppNameChange = useCallback((appName: string) => {
    onChange({
      ...config,
      appName,
      updatedAt: new Date(),
    });
  }, [config, onChange]);

  const handleAppDescriptionChange = useCallback((appDescription: string) => {
    onChange({
      ...config,
      appDescription,
      updatedAt: new Date(),
    });
  }, [config, onChange]);

  const handlePortChange = useCallback((port: number) => {
    onChange({
      ...config,
      port,
      updatedAt: new Date(),
    });
  }, [config, onChange]);

  const handleWagmiConnectorChange = useCallback((enableWagmiConnector: boolean) => {
    onChange({
      ...config,
      enableWagmiConnector,
      updatedAt: new Date(),
    });
  }, [config, onChange]);

  const handleWalletSupportChange = useCallback((enableWalletSupport: boolean) => {
    onChange({
      ...config,
      enableWalletSupport,
      updatedAt: new Date(),
    });
  }, [config, onChange]);

  const handleProfileSupportChange = useCallback((enableProfileSupport: boolean) => {
    onChange({
      ...config,
      enableProfileSupport,
      updatedAt: new Date(),
    });
  }, [config, onChange]);

  const handleTransactionsChange = useCallback((enableTransactions: boolean) => {
    onChange({
      ...config,
      enableTransactions,
      updatedAt: new Date(),
    });
  }, [config, onChange]);

  return (
    <div className="arena-config">
      <div className="arena-config__header">
        <div className="arena-config__title">
          <Store size={20} />
          <h3>Arena App Store Integration</h3>
        </div>
      </div>

      {/* Enable Toggle */}
      <div className="arena-config__section">
        <div className="arena-config__toggle-row">
          <label className="arena-config__toggle-label">
            <span>Enable Arena App Store</span>
            <span className="arena-config__toggle-desc">
              Publish your dApp to Arena's App Store
            </span>
          </label>
          <button
            className={`arena-config__toggle ${config.enabled ? 'active' : ''}`}
            onClick={() => handleEnabledChange(!config.enabled)}
            role="switch"
            aria-checked={config.enabled}
          >
            <span className="arena-config__toggle-slider" />
          </button>
        </div>
      </div>

      {config.enabled && (
        <>
          {/* App Information */}
          <div className="arena-config__section">
            <h4>
              <Box size={16} />
              App Information
            </h4>
            <div className="arena-config__form">
              <label className="arena-config__label">
                App Name
                <input
                  type="text"
                  value={config.appName}
                  onChange={e => handleAppNameChange(e.target.value)}
                  className="arena-config__input"
                  placeholder="My Awesome dApp"
                />
              </label>
              <label className="arena-config__label">
                App Description
                <textarea
                  value={config.appDescription}
                  onChange={e => handleAppDescriptionChange(e.target.value)}
                  className="arena-config__textarea"
                  placeholder="Describe your dApp and its features..."
                  rows={3}
                />
              </label>
              <label className="arena-config__label">
                Port
                <input
                  type="number"
                  value={config.port}
                  onChange={e => handlePortChange(parseInt(e.target.value) || 3481)}
                  className="arena-config__input"
                  min="1"
                  max="65535"
                />
                <span className="arena-config__label-hint">
                  Arena apps typically use port 3481
                </span>
              </label>
            </div>
          </div>

          {/* SDK Features */}
          <div className="arena-config__section">
            <h4>
              <Info size={16} />
              SDK Features
            </h4>
            <div className="arena-config__features">
              <label className="arena-config__checkbox">
                <input
                  type="checkbox"
                  checked={config.enableWalletSupport}
                  onChange={e => handleWalletSupportChange(e.target.checked)}
                />
                <Wallet size={16} />
                <span>Wallet Connection</span>
                <span className="arena-config__checkbox-desc">
                  Enable AVAX wallet connection via Stars Arena
                </span>
              </label>
              <label className="arena-config__checkbox">
                <input
                  type="checkbox"
                  checked={config.enableProfileSupport}
                  onChange={e => handleProfileSupportChange(e.target.checked)}
                />
                <User size={16} />
                <span>Profile Support</span>
                <span className="arena-config__checkbox-desc">
                  Access user profile data from Arena
                </span>
              </label>
              <label className="arena-config__checkbox">
                <input
                  type="checkbox"
                  checked={config.enableTransactions}
                  onChange={e => handleTransactionsChange(e.target.checked)}
                />
                <Send size={16} />
                <span>AVAX Transactions</span>
                <span className="arena-config__checkbox-desc">
                  Enable signing and sending AVAX transactions
                </span>
              </label>
              <label className="arena-config__checkbox">
                <input
                  type="checkbox"
                  checked={config.enableWagmiConnector}
                  onChange={e => handleWagmiConnectorChange(e.target.checked)}
                />
                <Box size={16} />
                <span>Wagmi Connector</span>
                <span className="arena-config__checkbox-desc">
                  Add Wagmi v2 connector for EVM wallet integration
                </span>
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className="arena-config__preview">
            <h4>
              <Box size={16} />
              Generated SDK Integration
            </h4>
            <div className="arena-config__preview-info">
              <p>When Arena SDK is enabled, the following will be added to your project:</p>
              <ul>
                <li><code>@the-arena/arena-app-store-sdk</code> package</li>
                {config.enableWagmiConnector && (
                  <li><code>@arena-app-store-sdk/wagmi2-connector</code> package</li>
                )}
                <li>CORS configuration for Arena platform</li>
                <li>SDK initialization in your app</li>
              </ul>
              {config.appName && (
                <p className="arena-config__preview-app">
                  <strong>App:</strong> {config.appName}
                  {config.appDescription && (
                    <> — {config.appDescription}</>
                  )}
                </p>
              )}
            </div>
            <pre className="arena-config__preview-code">
{`// SDK Dependencies
{
  "dependencies": {
    "@the-arena/arena-app-store-sdk": "^1.0.0"
    ${config.enableWagmiConnector ? ',\n    "@arena-app-store-sdk/wagmi2-connector": "^1.0.0"' : ''}
  }
}

// vite.config.ts
{
  "server": {
    "port": ${config.port},
    "cors": {
      "origin": "*"
    }
  }
}

// main.tsx or App.tsx
import { ArenaAppSDK } from '@the-arena/arena-app-store-sdk';

const arenaSDK = new ArenaAppSDK({
  appName: '${config.appName || 'My App'}',
  appDescription: '${config.appDescription || ''}',
  enableWallet: ${config.enableWalletSupport},
  enableProfile: ${config.enableProfileSupport},
  enableTransactions: ${config.enableTransactions}
});

await arenaSDK.initialize();`}
            </pre>
          </div>

          {/* Info Box */}
          <div className="arena-config__info">
            <Info size={16} />
            <div>
              <strong>About Arena App Store</strong>
              <p>
                Arena App Store allows you to publish your dApps to reach Arena's user base.
                Your app will be displayed in the Arena marketplace and can be accessed by
                thousands of AVAX users. Make sure your app handles the SDK events properly
                for the best user experience.
              </p>
            </div>
          </div>
        </>
      )}

      {!config.enabled && (
        <div className="arena-config__disabled">
          <Store size={48} />
          <h4>Publish to Arena App Store</h4>
          <p>
            Enable Arena App Store integration to publish your dApp to Arena's marketplace.
            Users will be able to access your app directly through Arena's platform.
          </p>
        </div>
      )}
    </div>
  );
};
