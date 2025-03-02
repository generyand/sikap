import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const [error, setError] = useState<Error | null>(null)
  const navigate = useNavigate()
  
  useEffect(() => {
    const loadProfile = async () => {
      if (!profileId) {
        console.log('No profile ID to load');
        return;
      }
      
      try {
        console.log('Loading profile with ID:', profileId);
        setIsLoading(true);
        const profile = await window.electron.ipcRenderer.invoke('get-profile', profileId);
        console.log('Profile loaded result:', profile);
        
        if (!profile) {
          console.warn('Profile not found for ID:', profileId);
          setCurrentProfile(null);
          setIsLoading(false);
          return;
        }
        
        console.log('Setting current profile:', profile);
        setCurrentProfile(profile);
      } catch (error) {
        console.error('Failed to load profile:', error);
        setCurrentProfile(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile()
  }, [profileId, navigate])

  // Check for stored profile on mount
  useEffect(() => {
    const checkStoredProfile = async () => {
      try {
        setIsLoading(true)
        console.log('Checking for stored profile...')
        const storedProfileId = await window.electron.ipcRenderer.invoke('get-current-profile')
        console.log('Stored profile ID:', storedProfileId)
        
        if (!storedProfileId) {
          console.log('No stored profile found')
          navigate('/profiles')
          setIsLoading(false)
          return
        }
        
        setProfileId(storedProfileId)
      } catch (error) {
        console.error('Failed to get stored profile:', error)
        setError(error as Error)
        navigate('/profiles')
        setIsLoading(false)
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