import { Component, type ReactNode } from 'react'

type ErrorBoundaryProps = {
  children: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 text-center text-slate-100">
          <div className="max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl">
            <h1 className="text-2xl font-semibold">Something went wrong</h1>
            <p className="mt-3 text-sm text-slate-300">
              The app hit an unexpected error. Refresh the page and try again.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary