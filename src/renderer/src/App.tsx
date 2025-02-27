import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ProfileSelector } from './pages/ProfileSelector'
import TaskDashboard from './pages/TaskDashboard'
import { ThemeProvider } from './providers/ThemeProvider'
import Tasks from './pages/Tasks'
import Calendar from './pages/Calendar'
import Notifications from './pages/Notifications'
import { Sidebar } from './components/navigation/Sidebar'
import { QueryProvider } from './providers/QueryProvider'
import { ProfileProvider, useProfile } from './providers/ProfileProvider'
import Settings from './pages/Settings'
import { WindowControls } from './components/WindowControls'
import './styles/titlebar.css'

const MainLayout = () => {
  return (
    <div className="flex flex-1">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/dashboard" element={<TaskDashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
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
            <div className="flex flex-col h-screen">
              <div className="titlebar shrink-0 flex justify-between items-center p-2 bg-white dark:bg-gray-800">
                <div>Sikap</div>
                <WindowControls />
              </div>
              <div className="flex-1 flex">
                <AppContent />
              </div>
            </div>
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
