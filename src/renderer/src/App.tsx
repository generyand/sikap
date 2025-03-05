import React from 'react'
import { HashRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom'
import { ProfileSelector } from './pages/ProfileSelector'
import { RequireProfile } from './components/RequireProfile'
import { Sidebar } from './components/navigation/Sidebar'
import { QueryProvider } from './providers/QueryProvider'
import { ProfileProvider } from './providers/ProfileProvider'
import { ThemeProvider } from './providers/ThemeProvider'
import  TaskDashboard  from './pages/TaskDashboard'
import { Tasks } from './pages/Tasks'
import  Calendar from './pages/Calendar'
import Settings from './pages/Settings'

const AppContent = () => {
  return (
    <Routes>
      <Route path="/profiles" element={<ProfileSelector />} />
      
      {/* Protected Routes with Layout */}
      <Route element={
        <RequireProfile>
          <Layout />
        </RequireProfile>
      }>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<TaskDashboard />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/profiles" replace />} />
    </Routes>
  )
}

// Layout component to wrap protected routes
const Layout = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

// Add new Error Boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can log the error to an error reporting service here
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4">
          <h1 className="text-xl font-bold text-red-600">Something went wrong</h1>
          <pre className="mt-2 p-2 bg-gray-100 rounded">
            {this.state.error?.toString()}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

const App: React.FC = () => {
  // Add error logging for uncaught errors
  React.useEffect(() => {
    window.onerror = (message, source, lineno, colno, error) => {
      console.error('Global error:', { message, source, lineno, colno, error })
    }

    window.onunhandledrejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason)
    }
  }, [])

  return (
    <ErrorBoundary>
      <QueryProvider>
        <HashRouter>
          <ProfileProvider>
            <ThemeProvider defaultTheme="system">
              <AppContent />
            </ThemeProvider>
          </ProfileProvider>
        </HashRouter>
      </QueryProvider>
    </ErrorBoundary>
  )
}

export default App
