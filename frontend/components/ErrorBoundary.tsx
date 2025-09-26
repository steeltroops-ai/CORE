"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Bug, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-xl text-red-900">
                    Something went wrong
                  </CardTitle>
                  <p className="text-sm text-red-600 mt-1">
                    An unexpected error occurred while loading this component
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Bug className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Error Details:</p>
                    <p className="text-sm text-gray-600 font-mono bg-gray-100 p-2 rounded">
                      {this.state.error?.message || 'Unknown error occurred'}
                    </p>
                    {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                          Stack Trace (Development Only)
                        </summary>
                        <pre className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-auto max-h-40">
                          {this.state.error?.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              <div className="flex items-center gap-3 pt-4">
                <Button
                  onClick={this.handleRetry}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
              </div>

              <div className="text-xs text-gray-500 pt-4 border-t">
                <p>If this problem persists, please contact support with the error details above.</p>
                <p className="mt-1">Error ID: {Date.now().toString(36)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;