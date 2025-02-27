import { createContext, useContext, ReactNode, useState } from 'react'

type ProfileContextType = {
  profileId: string | null
  setProfileId: (id: string) => void
}

const ProfileContext = createContext<ProfileContextType | null>(null)

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profileId, setProfileId] = useState<string | null>(null)
  
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