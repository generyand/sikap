import React, { useState, useEffect } from 'react'
import { Profile } from '@prisma/client'

export const ProfileSelector: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<string>()

  useEffect(() => {
    // Load profiles from the database
    loadProfiles()
  }, [])

  const handleProfileSelect = (profileId: string) => {
    setSelectedProfile(profileId)
    // Store selected profile in electron-store
    window.electron.store.set('currentProfile', profileId)
  }

  const handleCreateProfile = () => {
    // Show profile creation modal
  }

  return (
    <div className="profile-selector">
      <h2>Select Profile</h2>
      <div className="profiles-grid">
        {profiles.map(profile => (
          <div 
            key={profile.id} 
            className={`profile-card ${selectedProfile === profile.id ? 'selected' : ''}`}
            onClick={() => handleProfileSelect(profile.id)}
          >
            <img src={profile.avatar || '/default-avatar.png'} alt={profile.name} />
            <h3>{profile.name}</h3>
          </div>
        ))}
        <div className="create-profile-card" onClick={handleCreateProfile}>
          <span>+ Create New Profile</span>
        </div>
      </div>
    </div>
  )
} 