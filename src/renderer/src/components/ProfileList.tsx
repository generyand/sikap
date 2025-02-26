import React, { useEffect } from 'react'
import { useProfile } from '../hooks/useProfile'

export const ProfileList: React.FC = () => {
  const { profiles, loading, error, fetchProfiles } = useProfile()

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {profiles.map(profile => (
        <div key={profile.id}>{profile.name}</div>
      ))}
    </div>
  )
} 