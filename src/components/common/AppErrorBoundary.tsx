import React from 'react';
import { Button } from '../ui/Button';

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends React.Component<React.PropsWithChildren, AppErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Application render failure:', error);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] flex items-center justify-center p-6 bg-background">
          <div className="w-full max-w-md rounded-panel bg-surface border border-border shadow-elevated p-6 text-center">
            <h1 className="text-lg font-bold text-text-strong mb-2">Unable to load the app</h1>
            <p className="text-sm text-text-muted mb-5">
              Something went wrong while opening the website. Please reload and try again.
            </p>
            <Button type="button" onClick={this.handleReload} fullWidth>
              Reload Website
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
