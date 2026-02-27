import React, { useState, useCallback } from 'react';
import {
  Server,
  Code,
  Package,
  Play,
  Settings,
  Terminal,
  Box,
} from 'lucide-react';
import type { BackendConfig, BackendRuntime, BackendFramework } from '../../types';
import './FullstackConfig.css';

interface BackendConfigurationProps {
  backendConfig: BackendConfig;
  onChange: (config: BackendConfig) => void;
}

const RUNTIME_OPTIONS: { value: BackendRuntime; label: string; icon: string }[] = [
  { value: 'nodejs', label: 'Node.js', icon: '⬢' },
  { value: 'bun', label: 'Bun', icon: '🍞' },
  { value: 'deno', label: 'Deno', icon: '🦕' },
];

const FRAMEWORK_OPTIONS: { value: BackendFramework; label: string; description: string }[] = [
  { value: 'express', label: 'Express', description: 'Fast, unopinionated web framework' },
  { value: 'fastify', label: 'Fastify', description: 'Low overhead web framework' },
  { value: 'nestjs', label: 'NestJS', description: 'Progressive Node.js framework' },
  { value: 'nextjs', label: 'Next.js API', description: 'API routes in Next.js app' },
  { value: 'none', label: 'None', description: 'No backend framework' },
];

const DEFAULT_CONFIGS: Record<BackendRuntime, Record<BackendFramework, { install: string; start: string; build: string }>> = {
  nodejs: {
    express: {
      install: 'npm install',
      start: 'node server.js',
      build: '',
    },
    fastify: {
      install: 'npm install',
      start: 'node server.js',
      build: '',
    },
    nestjs: {
      install: 'npm install',
      start: 'npm run start:dev',
      build: 'npm run build',
    },
    nextjs: {
      install: 'npm install',
      start: 'npm run dev',
      build: 'npm run build',
    },
    none: {
      install: 'npm install',
      start: 'node index.js',
      build: '',
    },
  },
  bun: {
    express: {
      install: 'bun install',
      start: 'bun run server.ts',
      build: '',
    },
    fastify: {
      install: 'bun install',
      start: 'bun run server.ts',
      build: '',
    },
    nestjs: {
      install: 'bun install',
      start: 'bun run start:dev',
      build: 'bun run build',
    },
    nextjs: {
      install: 'bun install',
      start: 'bun run dev',
      build: 'bun run build',
    },
    none: {
      install: 'bun install',
      start: 'bun run index.ts',
      build: '',
    },
  },
  deno: {
    express: {
      install: '',
      start: 'deno run --allow-all server.ts',
      build: '',
    },
    fastify: {
      install: '',
      start: 'deno run --allow-all server.ts',
      build: '',
    },
    nestjs: {
      install: 'deno install',
      start: 'deno task start',
      build: 'deno task build',
    },
    nextjs: {
      install: 'deno install',
      start: 'deno task dev',
      build: 'deno task build',
    },
    none: {
      install: '',
      start: 'deno run --allow-all index.ts',
      build: '',
    },
  },
};

const generateId = () => Math.random().toString(36).substring(2, 11);

export const BackendConfiguration: React.FC<BackendConfigurationProps> = ({
  backendConfig,
  onChange,
}) => {
  const [newDepKey, setNewDepKey] = useState('');
  const [newDepValue, setNewDepValue] = useState('');

  const handleRuntimeChange = useCallback((runtime: BackendRuntime) => {
    const defaultConfig = DEFAULT_CONFIGS[runtime][backendConfig.framework];
    onChange({
      ...backendConfig,
      runtime,
      installScript: defaultConfig.install,
      startScript: defaultConfig.start,
      buildScript: defaultConfig.build,
      updatedAt: new Date(),
    });
  }, [backendConfig, onChange]);

  const handleFrameworkChange = useCallback((framework: BackendFramework) => {
    const defaultConfig = DEFAULT_CONFIGS[backendConfig.runtime][framework];
    onChange({
      ...backendConfig,
      framework,
      installScript: defaultConfig.install,
      startScript: defaultConfig.start,
      buildScript: defaultConfig.build,
      updatedAt: new Date(),
    });
  }, [backendConfig, onChange]);

  const addDependency = useCallback(() => {
    if (!newDepKey.trim() || !newDepValue.trim()) return;

    onChange({
      ...backendConfig,
      customDependencies: {
        ...backendConfig.customDependencies,
        [newDepKey.trim()]: newDepValue.trim(),
      },
      updatedAt: new Date(),
    });
    setNewDepKey('');
    setNewDepValue('');
  }, [backendConfig, newDepKey, newDepValue, onChange]);

  const removeDependency = useCallback((key: string) => {
    const { [key]: _, ...rest } = backendConfig.customDependencies;
    onChange({
      ...backendConfig,
      customDependencies: rest,
      updatedAt: new Date(),
    });
  }, [backendConfig, onChange]);

  return (
    <div className="backend-config">
      <div className="backend-config__header">
        <div className="backend-config__title">
          <Server size={20} />
          <h3>Backend Configuration</h3>
        </div>
      </div>

      {/* Runtime Selection */}
      <div className="backend-config__section">
        <h4>
          <Box size={16} />
          Runtime
        </h4>
        <div className="backend-config__runtime-options">
          {RUNTIME_OPTIONS.map(option => (
            <button
              key={option.value}
              className={`backend-config__runtime-btn ${backendConfig.runtime === option.value ? 'active' : ''}`}
              onClick={() => handleRuntimeChange(option.value)}
            >
              <span className="backend-config__runtime-icon">{option.icon}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Framework Selection */}
      <div className="backend-config__section">
        <h4>
          <Code size={16} />
          Framework
        </h4>
        <div className="backend-config__framework-options">
          {FRAMEWORK_OPTIONS.map(option => (
            <button
              key={option.value}
              className={`backend-config__framework-btn ${backendConfig.framework === option.value ? 'active' : ''}`}
              onClick={() => handleFrameworkChange(option.value)}
            >
              <span className="backend-config__framework-label">{option.label}</span>
              <span className="backend-config__framework-desc">{option.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Port Configuration */}
      <div className="backend-config__section">
        <h4>
          <Settings size={16} />
          Server Settings
        </h4>
        <div className="backend-config__form-row">
          <label className="backend-config__label">
            Port
            <input
              type="number"
              value={backendConfig.port}
              onChange={e => onChange({
                ...backendConfig,
                port: parseInt(e.target.value) || 3000,
                updatedAt: new Date(),
              })}
              className="backend-config__input"
              min="1"
              max="65535"
            />
          </label>
          <label className="backend-config__label">
            Environment
            <select
              value={backendConfig.environment}
              onChange={e => onChange({
                ...backendConfig,
                environment: e.target.value as any,
                updatedAt: new Date(),
              })}
              className="backend-config__select"
            >
              <option value="development">Development</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
            </select>
          </label>
        </div>
      </div>

      {/* Scripts */}
      <div className="backend-config__section">
        <h4>
          <Terminal size={16} />
          Scripts
        </h4>
        <div className="backend-config__scripts">
          <label className="backend-config__label">
            Install Script
            <input
              type="text"
              value={backendConfig.installScript}
              onChange={e => onChange({
                ...backendConfig,
                installScript: e.target.value,
                updatedAt: new Date(),
              })}
              className="backend-config__input"
              placeholder="npm install"
            />
          </label>
          <label className="backend-config__label">
            Start Script
            <input
              type="text"
              value={backendConfig.startScript}
              onChange={e => onChange({
                ...backendConfig,
                startScript: e.target.value,
                updatedAt: new Date(),
              })}
              className="backend-config__input"
              placeholder="node server.js"
            />
          </label>
          <label className="backend-config__label">
            Build Script
            <input
              type="text"
              value={backendConfig.buildScript}
              onChange={e => onChange({
                ...backendConfig,
                buildScript: e.target.value,
                updatedAt: new Date(),
              })}
              className="backend-config__input"
              placeholder="npm run build"
            />
          </label>
        </div>
      </div>

      {/* Custom Dependencies */}
      <div className="backend-config__section">
        <h4>
          <Package size={16} />
          Custom Dependencies
        </h4>
        <div className="backend-config__deps-form">
          <input
            type="text"
            placeholder="Package name"
            value={newDepKey}
            onChange={e => setNewDepKey(e.target.value)}
            className="backend-config__input"
          />
          <input
            type="text"
            placeholder="Version"
            value={newDepValue}
            onChange={e => setNewDepValue(e.target.value)}
            className="backend-config__input"
          />
          <button
            className="backend-config__add-dep-btn"
            onClick={addDependency}
            disabled={!newDepKey.trim() || !newDepValue.trim()}
          >
            Add
          </button>
        </div>
        
        {Object.keys(backendConfig.customDependencies).length > 0 && (
          <div className="backend-config__deps-list">
            {Object.entries(backendConfig.customDependencies).map(([key, value]) => (
              <div key={key} className="backend-config__dep-item">
                <code>{key}@{value}</code>
                <button
                  className="backend-config__remove-dep-btn"
                  onClick={() => removeDependency(key)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="backend-config__preview">
        <h4>
          <Play size={16} />
          Generated package.json scripts
        </h4>
        <pre className="backend-config__preview-code">
{JSON.stringify({
  scripts: {
    install: backendConfig.installScript || '(not set)',
    start: backendConfig.startScript || '(not set)',
    build: backendConfig.buildScript || '(not set)',
  },
  dependencies: backendConfig.customDependencies
}, null, 2)}
        </pre>
      </div>
    </div>
  );
};
