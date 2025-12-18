import React, { Component, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

// Error Boundary Component to catch React errors
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, error: null };

  // Explicitly declare props to satisfy TypeScript compiler
  declare props: Readonly<ErrorBoundaryProps>;

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("React Error Boundary Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-rose-50 p-6">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-rose-100 max-w-2xl w-full">
            <h1 className="text-2xl font-bold text-rose-600 mb-4">Application Error</h1>
            <p className="text-slate-600 mb-4">The application failed to render. Please check the console for details.</p>
            <div className="bg-slate-900 text-slate-200 p-4 rounded-lg overflow-auto text-sm font-mono max-h-60">
              {this.state.error?.toString()}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 w-full py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

console.log('Starting Application...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("CRITICAL: Root element not found!");
  throw new Error("Could not find root element to mount to");
}

try {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
  console.log('Application mounted successfully.');
} catch (e) {
  console.error("Error during mounting:", e);
}