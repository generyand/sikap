import { useState, useCallback } from 'react'
import { Profile } from '@prisma/client'
import { profileAPI } from '../../../preload/api/profile.api'

export const useProfile = () => {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true)
      const data = await profileAPI.getProfiles()
      setProfiles(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profiles')
    } finally {
      setLoading(false)
    }
  }, [])

  const createProfile = useCallback(async (profileData: Omit<Profile, 'id'>) => {
    try {
      setLoading(true)
      const newProfile = await profileAPI.createProfile(profileData)
      setProfiles(prev => [...prev, newProfile])
      return newProfile
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    profiles,
    loading,
    error,
    fetchProfiles,
    createProfile
  }
} 