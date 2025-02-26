import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProfileSelector } from './components/ProfileSelector'
import { TaskDashboard } from './pages/TaskDashboard'
import { ProtectedRoute } from './components/ProtectedRoute'

const App: React.FC = () => {
  return (
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
  )
}

export default App
