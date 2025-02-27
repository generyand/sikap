import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProfileSelector } from './pages/ProfileSelector'
import TaskDashboard from './pages/TaskDashboard'
import { ThemeProvider } from './providers/ThemeProvider'
import Tasks from './pages/Tasks'
import Calendar from './pages/Calendar'
import Notifications from './pages/Notifications'
import { Sidebar } from './components/navigation/Sidebar'
import { QueryProvider } from './providers/QueryProvider'
import { ProfileProvider, useProfile } from './providers/ProfileProvider'
import { RequireProfile } from '@/components/RequireProfile'

const MainLayout = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/dashboard" element={<TaskDashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </main>
    </div>
  )
}

const App: React.FC = () => {
  return (
    <QueryProvider>
      <BrowserRouter>
        <ProfileProvider>
          <ThemeProvider defaultTheme="system">
            {/* <ThemeDebug /> */}
            <AppContent />
          </ThemeProvider>
        </ProfileProvider>
      </BrowserRouter>
    </QueryProvider>
  )
}

const AppContent = () => {
  const { profileId } = useProfile()
  return !profileId ? <ProfileSelector /> : <MainLayout />
}

export default App
