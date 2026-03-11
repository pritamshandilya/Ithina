import { AlertTriangle } from "lucide-react";
import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("[ErrorBoundary]", error, info.componentStack); // eslint-disable-line no-console
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-rose-400/20 bg-rose-900/10 p-8 text-center" role="alert">
          <AlertTriangle className="size-8 text-rose-400" />
          <h3 className="text-sm font-semibold text-white">Something went wrong</h3>
          <p className="max-w-sm text-xs text-slate-400">{this.state.error?.message ?? "An unexpected error occurred."}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="rounded-lg border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-xs font-medium text-rose-400 transition-colors hover:bg-rose-400/20"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
