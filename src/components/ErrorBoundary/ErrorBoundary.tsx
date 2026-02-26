import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    if (typeof window !== 'undefined') {
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
      existingLogs.push(logEntry);
      
      if (existingLogs.length > 50) {
        existingLogs.shift();
      }
      
      localStorage.setItem('error_logs', JSON.stringify(existingLogs));
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary">
          <div className="error-boundary__content">
            <div className="error-boundary__icon">
              <AlertTriangle size={48} />
            </div>
            
            <h1>Something went wrong</h1>
            <p>
              We encountered an unexpected error. This has been logged and we'll
              work to fix it.
            </p>

            {this.state.error && (
              <div className="error-boundary__details">
                <details>
                  <summary>
                    <Bug size={16} />
                    Error Details
                  </summary>
                  <pre>
                    {this.state.error.message}
                    {this.state.error.stack && `\n\n${this.state.error.stack}`}
                  </pre>
                </details>
              </div>
            )}

            <div className="error-boundary__actions">
              <button onClick={this.handleReset} className="error-boundary__btn error-boundary__btn--primary">
                <RefreshCw size={18} />
                Try Again
              </button>
              <button onClick={this.handleReload} className="error-boundary__btn">
                Reload Page
              </button>
              <button onClick={this.handleGoHome} className="error-boundary__btn">
                <Home size={18} />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
}) => {
  return (
    <div className="error-fallback">
      <AlertTriangle size={24} />
      <h3>Something went wrong</h3>
      {error && <p>{error.message}</p>}
      {resetError && (
        <button onClick={resetError}>
          <RefreshCw size={16} />
          Try again
        </button>
      )}
    </div>
  );
};

export default ErrorBoundary;
