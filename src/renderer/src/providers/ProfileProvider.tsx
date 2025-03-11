import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Profile } from '@/types'

type ProfileContextType = {
  profileId: string | null
  currentProfile: Profile | null
  isLoading: boolean
  setProfileId: (id: string) => void
  signOut: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextType | null>(null)

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profileId, setProfileId] = useState<string | null>(null)
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  
  // Check for stored profile on mount
  useEffect(() => {
    const checkStoredProfile = async () => {
      try {
        setIsLoading(true)
        const storedProfileId = await window.electron.ipcRenderer.invoke('get-current-profile')
        
        if (!storedProfileId) {
          console.log('No stored profile found')
          if (location.pathname !== '/profiles') {
            navigate('/profiles', { replace: true })
          }
          setIsLoading(false)
          return
        }
        
        console.log('Found stored profile:', storedProfileId)
        setProfileId(storedProfileId)
      } catch (error) {
        console.error('Profile check failed:', error)
        if (location.pathname !== '/profiles') {
          navigate('/profiles', { replace: true })
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkStoredProfile()
  }, [navigate, location.pathname])

  useEffect(() => {
    const loadProfile = async () => {
      if (!profileId) {
        console.log('No profile ID to load')
        return
      }
      
      try {
        console.log('Loading profile with ID:', profileId)
        setIsLoading(true)
        const profile = await window.electron.ipcRenderer.invoke('get-profile', profileId)
        console.log('Profile loaded:', profile)
        
        if (!profile) {
          console.warn('Profile not found for ID:', profileId)
          setCurrentProfile(null)
          if (location.pathname !== '/profiles') {
            navigate('/profiles', { replace: true })
          }
          return
        }
        
        setCurrentProfile(profile)
        if (location.pathname === '/profiles') {
          navigate('/dashboard', { replace: true })
        }
      } catch (error) {
        console.error('Failed to load profile:', error)
        setCurrentProfile(null)
        if (location.pathname !== '/profiles') {
          navigate('/profiles', { replace: true })
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [profileId, navigate, location.pathname])

  const signOut = async () => {
    await window.electron.ipcRenderer.invoke('set-current-profile', null)
    setProfileId(null)
    setCurrentProfile(null)
    navigate('/profiles', { replace: true })
  }

  return (
    <ProfileContext.Provider value={{ 
      profileId, 
      currentProfile, 
      isLoading,
      setProfileId, 
      signOut 
    }}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => {
  const context = useContext(ProfileContext)
  if (!context) throw new Error('useProfile must be used within ProfileProvider')
  return context
} 