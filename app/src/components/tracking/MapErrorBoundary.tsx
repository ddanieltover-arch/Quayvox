import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode; fallback?: ReactNode };

type State = { failed: boolean };

export class MapErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('map render failed', error, info.componentStack);
  }

  render() {
    if (this.state.failed) {
      return (
        this.props.fallback ?? (
          <p className="px-4 py-8 text-center text-sm text-text-secondary">
            Map could not load. Refresh the page to try again.
          </p>
        )
      );
    }
    return this.props.children;
  }
}
