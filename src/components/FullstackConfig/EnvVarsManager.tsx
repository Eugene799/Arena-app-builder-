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
} from 'lucide-react';
import type { EnvVariable } from '../../types';
import './FullstackConfig.css';

interface EnvVarsManagerProps {
  envVariables: EnvVariable[];
  onChange: (envVariables: EnvVariable[]) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export const EnvVarsManager: React.FC<EnvVarsManagerProps> = ({
  envVariables,
  onChange,
}) => {
  const [showValues, setShowValues] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
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
    </div>
  );
};
