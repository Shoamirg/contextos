'use client';

import React from 'react';

type FallbackProps = {
  error: Error;
  resetErrorBoundary: () => void;
};

export class ErrorBoundary extends React.Component<
  { fallback?: React.ComponentType<FallbackProps>; children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('ContextOS UI error:', error);
  }

  resetErrorBoundary = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      const Fallback = this.props.fallback || DefaultFallback;
      return <Fallback error={this.state.error} resetErrorBoundary={this.resetErrorBoundary} />;
    }
    return this.props.children;
  }
}

function DefaultFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="p-4 m-4 rounded border border-red-800 bg-red-950/40 text-red-200">
      <div className="font-semibold mb-1">Something went wrong.</div>
      <div className="text-xs break-all">{error.message}</div>
      <button
        className="mt-2 px-2 py-1 rounded border border-red-700 text-xs hover:bg-red-900"
        onClick={resetErrorBoundary}
      >
        Try again
      </button>
    </div>
  );
}
