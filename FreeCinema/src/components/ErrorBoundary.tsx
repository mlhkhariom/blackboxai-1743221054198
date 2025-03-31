
import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-moviemate-background p-4 text-white">
          <div className="w-full max-w-md rounded-lg bg-moviemate-card p-6 text-center shadow-xl">
            <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
            <h1 className="mb-2 text-2xl font-bold">Oops! Something went wrong</h1>
            <p className="mb-6 text-gray-400">
              The application has encountered an unexpected error. Please try refreshing the page.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button 
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reload Page
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/'}
              >
                Go to Homepage
              </Button>
            </div>
            
            {this.state.error && (
              <div className="mt-6 rounded-md bg-red-950/20 p-4 text-left">
                <p className="mb-2 text-sm font-semibold text-red-400">Error details:</p>
                <pre className="overflow-auto text-xs text-red-300">
                  {this.state.error.toString()}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
