import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Profile } from '@prisma/client'

export const TaskDashboard: React.FC = () => {
  const { profileId } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Verify if this is the current profile
        const currentProfileId = await window.electron.ipcRenderer.invoke('get-current-profile')
        
        if (currentProfileId !== profileId) {
          // If not the current profile, redirect to profile selector
          navigate('/')
          return
        }

        // Load profile data
        const profiles = await window.electron.ipcRenderer.invoke('get-profiles')
        const currentProfile = profiles.find(p => p.id === profileId)
        
        if (!currentProfile) {
          navigate('/')
          return
        }

        setProfile(currentProfile)
      } catch (error) {
        console.error('Failed to load profile:', error)
        navigate('/')
      }
    }

    loadProfile()
  }, [profileId, navigate])

  if (!profile) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-[var(--spacing-page)]">
        <header className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">
              {profile.name}'s Dashboard
            </h1>
            <button 
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Switch Profile
            </button>
          </div>
        </header>
        
        {/* Dashboard content will go here */}
      </div>
    </div>
  )
} 