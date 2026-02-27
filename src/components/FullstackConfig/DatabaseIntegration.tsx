import React, { useState, useCallback } from 'react';
import {
  Database,
  Plus,
  Trash2,
  RefreshCw,
  Check,
  X,
  Server,
  Cloud,
  Plug,
} from 'lucide-react';
import type { DatabaseConnection, DatabaseType } from '../../types';
import './FullstackConfig.css';

interface DatabaseIntegrationProps {
  databaseConnections: DatabaseConnection[];
  onChange: (connections: DatabaseConnection[]) => void;
}

const DATABASE_PORTS: Record<DatabaseType, number> = {
  postgresql: 5432,
  mysql: 3306,
  mongodb: 27017,
  supabase: 5432,
  neon: 5432,
  none: 0,
};

const DATABASE_LABELS: Record<DatabaseType, string> = {
  postgresql: 'PostgreSQL',
  mysql: 'MySQL',
  mongodb: 'MongoDB',
  supabase: 'Supabase',
  neon: 'Neon',
  none: 'None',
};

const generateId = () => Math.random().toString(36).substring(2, 11);

export const DatabaseIntegration: React.FC<DatabaseIntegrationProps> = ({
  databaseConnections,
  onChange,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [newConnection, setNewConnection] = useState<Partial<DatabaseConnection>>({
    type: 'postgresql',
    name: '',
    host: 'localhost',
    port: 5432,
    database: '',
    username: '',
    password: '',
    ssl: true,
    isConnected: false,
  });

  const handleTypeChange = useCallback((type: DatabaseType) => {
    setNewConnection(prev => ({
      ...prev,
      type,
      port: DATABASE_PORTS[type],
    }));
  }, []);

  const addConnection = useCallback(() => {
    if (!newConnection.name?.trim()) return;

    const now = new Date();
    const connection: DatabaseConnection = {
      id: generateId(),
      type: newConnection.type || 'postgresql',
      name: newConnection.name.trim(),
      host: newConnection.host || 'localhost',
      port: newConnection.port || DATABASE_PORTS[newConnection.type || 'postgresql'],
      database: newConnection.database || '',
      username: newConnection.username || '',
      password: newConnection.password || '',
      ssl: newConnection.ssl ?? true,
      isConnected: false,
      createdAt: now,
      updatedAt: now,
    };

    onChange([...databaseConnections, connection]);
    setNewConnection({
      type: 'postgresql',
      name: '',
      host: 'localhost',
      port: 5432,
      database: '',
      username: '',
      password: '',
      ssl: true,
      isConnected: false,
    });
  }, [newConnection, databaseConnections, onChange]);

  const updateConnection = useCallback((id: string, updates: Partial<DatabaseConnection>) => {
    onChange(
      databaseConnections.map(c =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c
      )
    );
  }, [databaseConnections, onChange]);

  const deleteConnection = useCallback((id: string) => {
    onChange(databaseConnections.filter(c => c.id !== id));
  }, [databaseConnections, onChange]);

  const testConnection = useCallback(async (connection: DatabaseConnection) => {
    setTestingId(connection.id);
    
    // Simulate connection test (in real app, this would call an API)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo purposes, randomly succeed or fail
    const success = Math.random() > 0.3;
    
    updateConnection(connection.id, {
      isConnected: success,
      lastTested: new Date(),
    });
    
    setTestingId(null);
  }, [updateConnection]);

  const getDbIcon = (type: DatabaseType) => {
    switch (type) {
      case 'postgresql':
        return <span className="db-icon db-icon--postgresql">🐘</span>;
      case 'mysql':
        return <span className="db-icon db-icon--mysql">🐬</span>;
      case 'mongodb':
        return <span className="db-icon db-icon--mongodb">🍃</span>;
      case 'supabase':
        return <span className="db-icon db-icon--supabase">⚡</span>;
      case 'neon':
        return <span className="db-icon db-icon--neon">💡</span>;
      default:
        return <Database size={16} />;
    }
  };

  return (
    <div className="database-integration">
      <div className="database-integration__header">
        <div className="database-integration__title">
          <Database size={20} />
          <h3>Database Connections</h3>
        </div>
      </div>

      {/* Add New Connection Form */}
      <div className="database-integration__add-form">
        <div className="database-integration__form-row">
          <select
            value={newConnection.type}
            onChange={e => handleTypeChange(e.target.value as DatabaseType)}
            className="database-integration__select"
          >
            {Object.entries(DATABASE_LABELS).map(([value, label]) => (
              <option key={value} value={value} disabled={value === 'none'}>
                {label}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Connection Name"
            value={newConnection.name}
            onChange={e => setNewConnection(prev => ({ ...prev, name: e.target.value }))}
            className="database-integration__input"
          />
        </div>
        
        <div className="database-integration__form-row">
          <input
            type="text"
            placeholder="Host"
            value={newConnection.host}
            onChange={e => setNewConnection(prev => ({ ...prev, host: e.target.value }))}
            className="database-integration__input"
          />
          <input
            type="number"
            placeholder="Port"
            value={newConnection.port}
            onChange={e => setNewConnection(prev => ({ ...prev, port: parseInt(e.target.value) || 0 }))}
            className="database-integration__input database-integration__input--port"
          />
          <input
            type="text"
            placeholder="Database Name"
            value={newConnection.database}
            onChange={e => setNewConnection(prev => ({ ...prev, database: e.target.value }))}
            className="database-integration__input"
          />
        </div>

        <div className="database-integration__form-row">
          <input
            type="text"
            placeholder="Username"
            value={newConnection.username}
            onChange={e => setNewConnection(prev => ({ ...prev, username: e.target.value }))}
            className="database-integration__input"
          />
          <input
            type="password"
            placeholder="Password"
            value={newConnection.password}
            onChange={e => setNewConnection(prev => ({ ...prev, password: e.target.value }))}
            className="database-integration__input"
          />
          <label className="database-integration__checkbox-label">
            <input
              type="checkbox"
              checked={newConnection.ssl}
              onChange={e => setNewConnection(prev => ({ ...prev, ssl: e.target.checked }))}
            />
            SSL
          </label>
          <button
            className="database-integration__add-btn"
            onClick={addConnection}
            disabled={!newConnection.name?.trim()}
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>

      {/* Connections List */}
      <div className="database-integration__list">
        {databaseConnections.length === 0 ? (
          <div className="database-integration__empty">
            <Server size={32} />
            <p>No database connections yet</p>
            <span>Add a database to connect your backend</span>
          </div>
        ) : (
          databaseConnections.map(connection => (
            <div key={connection.id} className="database-integration__item">
              <div className="database-integration__item-header">
                <div className="database-integration__item-title">
                  {getDbIcon(connection.type)}
                  <span className="database-integration__name">{connection.name}</span>
                  <span className="database-integration__type">
                    {DATABASE_LABELS[connection.type]}
                  </span>
                </div>
                <div className="database-integration__item-status">
                  {connection.isConnected ? (
                    <span className="database-integration__status database-integration__status--connected">
                      <Check size={14} />
                      Connected
                    </span>
                  ) : (
                    <span className="database-integration__status database-integration__status--disconnected">
                      <X size={14} />
                      Disconnected
                    </span>
                  )}
                </div>
              </div>
              
              <div className="database-integration__item-details">
                <div className="database-integration__detail">
                  <span className="database-integration__label">Host:</span>
                  <code>{connection.host}:{connection.port}</code>
                </div>
                <div className="database-integration__detail">
                  <span className="database-integration__label">Database:</span>
                  <code>{connection.database}</code>
                </div>
                <div className="database-integration__detail">
                  <span className="database-integration__label">User:</span>
                  <code>{connection.username}</code>
                </div>
                <div className="database-integration__detail">
                  <span className="database-integration__label">SSL:</span>
                  <code>{connection.ssl ? 'Enabled' : 'Disabled'}</code>
                </div>
              </div>

              {connection.lastTested && (
                <div className="database-integration__last-tested">
                  Last tested: {connection.lastTested.toLocaleString()}
                </div>
              )}

              <div className="database-integration__item-actions">
                <button
                  className="database-integration__test-btn"
                  onClick={() => testConnection(connection)}
                  disabled={testingId === connection.id}
                  title="Test connection"
                >
                  {testingId === connection.id ? (
                    <RefreshCw size={14} className="database-integration__spinner" />
                  ) : (
                    <Plug size={14} />
                  )}
                  {testingId === connection.id ? 'Testing...' : 'Test'}
                </button>
                <button
                  className="database-integration__delete-btn"
                  onClick={() => deleteConnection(connection.id)}
                  title="Delete connection"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Database Info */}
      <div className="database-integration__info">
        <h4>Supported Databases</h4>
        <div className="database-integration__supported">
          {Object.entries(DATABASE_LABELS).filter(([k]) => k !== 'none').map(([value, label]) => (
            <span key={value} className="database-integration__supported-badge">
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
