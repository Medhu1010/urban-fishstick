import { BrowserRouter } from 'react-router-dom'
import { AppProviders } from './providers/AppProviders'
import { AppRoutes } from './routes'
import { AppErrorBoundary } from './ErrorBoundary'

export default function App() {
  return (
    <AppErrorBoundary>
      <AppProviders>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProviders>
    </AppErrorBoundary>
  )
}
