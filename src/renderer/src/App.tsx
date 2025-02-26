import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProfileSelector } from './pages/ProfileSelector'
import { TaskDashboard } from './pages/TaskDashboard'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ThemeProvider } from './providers/ThemeProvider'
import { ThemeDebug } from './components/theme/ThemeDebug'

const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="system">
      <ThemeDebug />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProfileSelector />} />
          <Route 
            path="/dashboard/:profileId" 
            element={
              <ProtectedRoute>
                <TaskDashboard />
              </ProtectedRoute>
            } 
          />
          {/* Catch all route - redirect to profile selection */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
