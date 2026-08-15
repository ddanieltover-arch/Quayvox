import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode; fallback?: ReactNode; resetKey?: string | number };

type State = { failed: boolean; resetKey?: string | number };

export class MapErrorBoundary extends Component<Props, State> {
  state: State = { failed: false, resetKey: this.props.resetKey };

  static getDerivedStateFromError(): Partial<State> {
    return { failed: true };
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    if (props.resetKey !== state.resetKey) {
      return { failed: false, resetKey: props.resetKey };
    }
    return null;
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
