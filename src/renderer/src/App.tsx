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

const MainLayout = () => {
  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 min-h-0">
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
              {/* <div className="titlebar h-10 shrink-0 flex justify-between items-center px-4 bg-background border-b sticky top-0 z-10">
                <div className="text-sm font-medium">Sikap</div>
                <WindowControls />
              </div> */}
              <div className="flex-1 min-h-0">
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
