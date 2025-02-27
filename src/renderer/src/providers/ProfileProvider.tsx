import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

type ProfileContextType = {
  profileId: string | null
  setProfileId: (id: string) => void
}

const ProfileContext = createContext<ProfileContextType | null>(null)

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profileId, setProfileId] = useState<string | null>(null)
  const navigate = useNavigate()
  
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

  return (
    <ProfileContext.Provider value={{ profileId, setProfileId }}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => {
  const context = useContext(ProfileContext)
  if (!context) throw new Error('useProfile must be used within ProfileProvider')
  return context
} 