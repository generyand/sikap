import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Profile } from '@prisma/client'
import { UserCircle2, Check, Plus } from 'lucide-react'

export const ProfileSelector: React.FC = () => {
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<string>()

  const loadProfiles = async () => {
    try {
      const data = await window.electron.ipcRenderer.invoke('get-profiles')
      setProfiles(data)
    } catch (error) {
      console.error('Failed to load profiles:', error)
    }
  }

  useEffect(() => {
    loadProfiles()
  }, [])

  const handleProfileSelect = async (profileId: string) => {
    setSelectedProfile(profileId)
    try {
      // Store selected profile in electron-store
      await window.electron.ipcRenderer.invoke('set-current-profile', profileId)
      // Navigate to dashboard using router
      navigate(`/dashboard/${profileId}`)
    } catch (error) {
      console.error('Failed to set profile:', error)
    }
  }

  const handleCreateProfile = () => {
    // Show profile creation modal
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Main container with responsive padding */}
      <div className="h-screen flex flex-col p-[var(--spacing-page)] 
                      lg:p-[var(--spacing-section)] xl:p-12">
        {/* App header with adaptive sizing */}
        <header className="flex-none text-center mb-6 lg:mb-8">
          <h1 className="text-[2rem] lg:text-[2.5rem] font-semibold tracking-tight 
                         bg-gradient-to-r from-primary-600 to-primary-700 
                         bg-clip-text text-transparent">
            SIKAP
          </h1>
          <p className="mt-1.5 text-base lg:text-lg text-gray-600">
            Intelligent planning, effortless productivity
          </p>
        </header>

        {/* Main content area with improved desktop layout */}
        <main className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-[90rem] mx-auto">
            {/* Card with responsive width and padding */}
            <div className="bg-white/80 backdrop-blur-sm rounded-[var(--radius-lg)] 
                          border border-gray-200
                          shadow-lg shadow-primary-950/5
                          p-6 lg:p-8 mx-auto
                          w-full max-w-screen-md lg:max-w-screen-lg">
              
              <div className="max-w-3xl mx-auto">
                <h2 className="text-xl lg:text-2xl font-semibold text-gray-900">
                  Select Profile
                </h2>
                <p className="mt-1 text-gray-600">
                  Choose a profile to continue or create a new one
                </p>

                {/* Responsive grid with better space utilization */}
                <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                  {profiles.map(profile => (
                    <div 
                      key={profile.id}
                      onClick={() => handleProfileSelect(profile.id)}
                      className={`
                        group relative rounded-[var(--radius-md)] overflow-hidden 
                        transition-all duration-300 ease-[var(--ease-productive)]
                        cursor-pointer border hover:shadow-md
                        ${selectedProfile === profile.id 
                          ? 'border-primary-300 bg-primary-50 ring-2 ring-primary-200' 
                          : 'border-gray-200 bg-white hover:border-primary-200 hover:bg-gradient-to-b hover:from-white hover:to-primary-50'
                        }
                      `}
                    >
                      <div className="p-4 lg:p-5">
                        {/* Responsive avatar sizing */}
                        <div className="aspect-square w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-3 
                                      rounded-[var(--radius-full)] bg-gray-100 
                                      overflow-hidden ring-2 ring-gray-200 ring-offset-2">
                          {profile.avatar ? (
                            <img 
                              src={profile.avatar} 
                              alt={profile.name}
                              className="w-full h-full object-cover 
                                       transition-transform duration-300 ease-[var(--ease-productive)]
                                       group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <UserCircle2 
                                className="w-8 h-8 lg:w-10 lg:h-10 text-gray-400 
                                         group-hover:text-primary-400 
                                         transition-colors duration-300"
                              />
                            </div>
                          )}
                        </div>

                        <h3 className="text-sm lg:text-base font-medium text-center 
                                     text-gray-900
                                     group-hover:text-primary-600 
                                     transition-colors duration-300 truncate px-1">
                          {profile.name}
                        </h3>

                        {selectedProfile === profile.id && (
                          <div className="absolute top-2 right-2 lg:top-3 lg:right-3 
                                        bg-primary-500 
                                        rounded-full p-1 shadow-sm animate-in fade-in duration-300">
                            <Check className="h-3 w-3 lg:h-4 lg:w-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Create New Profile Card */}
                  <div 
                    onClick={handleCreateProfile}
                    className="
                      relative rounded-[var(--radius-md)] overflow-hidden 
                      border-2 border-dashed border-gray-200 
                      hover:border-primary-300
                      transition-all duration-300 ease-[var(--ease-productive)]
                      cursor-pointer bg-white hover:bg-gradient-to-b 
                      hover:from-white hover:to-primary-50
                      hover:shadow-md group
                    "
                  >
                    <div className="p-4 lg:p-5 text-center">
                      <div className="aspect-square w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-3 
                                    flex items-center justify-center rounded-[var(--radius-full)] 
                                    bg-primary-50 
                                    group-hover:bg-primary-100 
                                    ring-2 ring-primary-100 ring-offset-2
                                    transition-colors duration-300">
                        <Plus className="h-6 w-6 lg:h-8 lg:w-8 text-primary-600" />
                      </div>
                      <p className="text-sm lg:text-base font-medium 
                                  text-primary-600 
                                  group-hover:text-primary-700 
                                  transition-colors duration-300">
                        New Profile
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 