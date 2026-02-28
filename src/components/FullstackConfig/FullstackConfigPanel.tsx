import React, { useState, useCallback, useEffect } from 'react';
import {
  X,
  Key,
  Database,
  Server,
  Save,
  RotateCcw,
  Store,
} from 'lucide-react';
import type { FullStackConfig, EnvVariable, DatabaseConnection, BackendConfig, ArenaAppConfig } from '../../types';
import { storageService } from '../../services/storageService';
import { EnvVarsManager } from './EnvVarsManager';
import { DatabaseIntegration } from './DatabaseIntegration';
import { BackendConfiguration } from './BackendConfig';
import { ArenaAppIntegration } from './ArenaAppIntegration';
import './FullstackConfig.css';

interface FullstackConfigPanelProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'env' | 'database' | 'backend' | 'arena';

const createDefaultArenaConfig = (): ArenaAppConfig => ({
  id: Math.random().toString(36).substring(2, 11),
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
});

const createDefaultBackendConfig = (): BackendConfig => ({
  id: Math.random().toString(36).substring(2, 11),
  runtime: 'nodejs',
  framework: 'express',
  port: 3000,
  installScript: 'npm install',
  startScript: 'node server.js',
  buildScript: '',
  customDependencies: {},
  environment: 'development',
  createdAt: new Date(),
  updatedAt: new Date(),
});

const createDefaultFullStackConfig = (projectId: string): FullStackConfig => ({
  projectId,
  envVariables: [],
  databaseConnections: [],
  backendConfig: createDefaultBackendConfig(),
  arenaConfig: createDefaultArenaConfig(),
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const FullstackConfigPanel: React.FC<FullstackConfigPanelProps> = ({
  projectId,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('env');
  const [config, setConfig] = useState<FullStackConfig>(() => 
    createDefaultFullStackConfig(projectId)
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Load config when panel opens
  useEffect(() => {
    if (isOpen) {
      const existingConfig = storageService.getFullStackConfig(projectId);
      if (existingConfig) {
        setConfig(existingConfig);
      } else {
        setConfig(createDefaultFullStackConfig(projectId));
      }
      setHasChanges(false);
      setSaveStatus('idle');
    }
  }, [isOpen, projectId]);

  const handleEnvVariablesChange = useCallback((envVariables: EnvVariable[]) => {
    setConfig(prev => ({ ...prev, envVariables }));
    setHasChanges(true);
    setSaveStatus('idle');
  }, []);

  const handleDatabaseConnectionsChange = useCallback((databaseConnections: DatabaseConnection[]) => {
    setConfig(prev => ({ ...prev, databaseConnections }));
    setHasChanges(true);
    setSaveStatus('idle');
  }, []);

  const handleBackendConfigChange = useCallback((backendConfig: BackendConfig) => {
    setConfig(prev => ({ ...prev, backendConfig }));
    setHasChanges(true);
    setSaveStatus('idle');
  }, []);

  const handleArenaConfigChange = useCallback((arenaConfig: ArenaAppConfig) => {
    setConfig(prev => ({ ...prev, arenaConfig }));
    setHasChanges(true);
    setSaveStatus('idle');
  }, []);

  const handleSave = useCallback(() => {
    setSaveStatus('saving');
    
    // Simulate save delay
    setTimeout(() => {
      storageService.saveFullStackConfig(config);
      setSaveStatus('saved');
      setHasChanges(false);
      
      // Reset status after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  }, [config]);

  const handleReset = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all configuration? This cannot be undone.')) {
      const defaultConfig = createDefaultFullStackConfig(projectId);
      setConfig(defaultConfig);
      setHasChanges(true);
      setSaveStatus('idle');
    }
  }, [projectId]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'env' as TabType, label: 'Environment Variables', icon: Key, count: config.envVariables.length },
    { id: 'database' as TabType, label: 'Database', icon: Database, count: config.databaseConnections.length },
    { id: 'backend' as TabType, label: 'Backend', icon: Server, count: 0 },
    { id: 'arena' as TabType, label: 'Arena App Store', icon: Store, count: config.arenaConfig?.enabled ? 1 : 0 },
  ];

  return (
    <div className="fullstack-config-panel">
      <div className="fullstack-config-panel__overlay" onClick={onClose} />
      <div className="fullstack-config-panel__container">
        <div className="fullstack-config-panel__header">
          <div className="fullstack-config-panel__title">
            <Server size={24} />
            <div>
              <h2>Fullstack Configuration</h2>
              <p>Configure environment variables, databases, and backend</p>
            </div>
          </div>
          <button className="fullstack-config-panel__close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="fullstack-config-panel__tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`fullstack-config-panel__tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="fullstack-config-panel__tab-badge">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        <div className="fullstack-config-panel__content">
          {activeTab === 'env' && (
            <EnvVarsManager
              envVariables={config.envVariables}
              onChange={handleEnvVariablesChange}
            />
          )}
          
          {activeTab === 'database' && (
            <DatabaseIntegration
              databaseConnections={config.databaseConnections}
              onChange={handleDatabaseConnectionsChange}
            />
          )}
          
          {activeTab === 'backend' && (
            <BackendConfiguration
              backendConfig={config.backendConfig}
              onChange={handleBackendConfigChange}
            />
          )}
          
          {activeTab === 'arena' && (
            <ArenaAppIntegration
              arenaConfig={config.arenaConfig}
              onChange={handleArenaConfigChange}
            />
          )}
        </div>

        <div className="fullstack-config-panel__footer">
          <div className="fullstack-config-panel__footer-left">
            <button
              className="fullstack-config-panel__reset-btn"
              onClick={handleReset}
            >
              <RotateCcw size={16} />
              Reset
            </button>
            {hasChanges && (
              <span className="fullstack-config-panel__unsaved">
                Unsaved changes
              </span>
            )}
          </div>
          <div className="fullstack-config-panel__footer-right">
            <button
              className="fullstack-config-panel__save-btn"
              onClick={handleSave}
              disabled={!hasChanges || saveStatus === 'saving'}
            >
              {saveStatus === 'saving' ? (
                <>
                  <RotateCcw size={16} className="fullstack-config-panel__spinner" />
                  Saving...
                </>
              ) : saveStatus === 'saved' ? (
                <>
                  <Save size={16} />
                  Saved!
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Configuration
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
