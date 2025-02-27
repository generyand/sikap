import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useProfile } from '@/providers/ProfileProvider'

export const RequireProfile = ({ children }: { children: ReactNode }) => {
  const { profileId } = useProfile()

  if (!profileId) {
    return <Navigate to="/profiles" replace />
  }

  return <>{children}</>
} 