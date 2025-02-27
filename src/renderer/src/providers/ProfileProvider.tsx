import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Profile } from '@prisma/client'

type ProfileContextType = {
  profileId: string | null
  currentProfile: Profile | null
  setProfileId: (id: string) => void
  signOut: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextType | null>(null)

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profileId, setProfileId] = useState<string | null>(null)
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null)
  const navigate = useNavigate()
  
  useEffect(() => {
    const loadProfile = async () => {
      if (!profileId) return
      
      try {
        const profile = await window.electron.ipcRenderer.invoke('get-profile', profileId)
        setCurrentProfile(profile)
      } catch (error) {
        console.error('Failed to load profile:', error)
      }
    }

    loadProfile()
  }, [profileId])

  // Check for stored profile on mount
  useEffect(() => {
    const checkStoredProfile = async () => {
      try {
        const storedProfileId = await window.electron.ipcRenderer.invoke('get-current-profile')
        if (!storedProfileId) {
          navigate('/profiles')
          return
        }
        setProfileId(storedProfileId)
      } catch (error) {
        console.error('Failed to get stored profile:', error)
        navigate('/profiles')
      }
    }

    checkStoredProfile()
  }, [navigate])

  const signOut = async () => {
    await window.electron.ipcRenderer.invoke('set-current-profile', null)
    setProfileId(null)
    setCurrentProfile(null)
    navigate('/profiles')
  }

  return (
    <ProfileContext.Provider value={{ profileId, currentProfile, setProfileId, signOut }}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => {
  const context = useContext(ProfileContext)
  if (!context) throw new Error('useProfile must be used within ProfileProvider')
  return context
} 