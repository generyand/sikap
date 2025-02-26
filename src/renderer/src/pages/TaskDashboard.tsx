import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Profile } from '@prisma/client'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { UserCircle2 } from 'lucide-react'

export const TaskDashboard: React.FC = () => {
  const { profileId } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const currentProfileId = await window.electron.ipcRenderer.invoke('get-current-profile')
        
        if (currentProfileId !== profileId) {
          navigate('/')
          return
        }

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-[var(--spacing-page)]">
        <header className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={profile.avatar || ''} alt={profile.name} />
                <AvatarFallback>
                  <UserCircle2 className="w-6 h-6 text-gray-400" />
                </AvatarFallback>
              </Avatar>
              <h1 className="text-2xl font-semibold text-gray-900">
                {profile.name}'s Dashboard
              </h1>
            </div>
            
            <Button
              variant="outline"
              onClick={() => navigate('/')}
            >
              Switch Profile
            </Button>
          </div>
        </header>
        
        {/* Dashboard content will go here */}
      </div>
    </div>
  )
} 