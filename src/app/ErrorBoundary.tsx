import type { ErrorInfo, PropsWithChildren } from 'react'
import { Component } from 'react'
import { Button } from '../components/ui/Button'
import { StatePanel } from '../components/feedback/StatePanel'

type ErrorBoundaryState = {
  hasError: boolean
}

export class AppErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  public constructor(props: PropsWithChildren) {
    super(props)
    this.state = { hasError: false }
  }

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error('Unhandled application error', error, errorInfo)
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto mt-10 max-w-3xl px-4">
          <StatePanel
            tone="error"
            title="Something went wrong"
            message="Solo System could not render this view. Please reload the page."
          />
          <div className="mt-4">
            <Button onClick={() => window.location.reload()} aria-label="Reload application">
              Reload app
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
