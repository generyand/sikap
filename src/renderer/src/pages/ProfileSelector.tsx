import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Profile } from '@prisma/client'
import { UserCircle2, Check, Plus, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from '@/lib/utils'

export const ProfileSelector: React.FC = () => {
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<string>()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [profileToDelete, setProfileToDelete] = useState<Profile | null>(null)

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
    setIsCreateModalOpen(true)
  }

  const handleDeleteProfile = async (profile: Profile) => {
    setProfileToDelete(profile)
  }

  const handleConfirmDelete = async () => {
    if (!profileToDelete) return

    try {
      await window.electron.ipcRenderer.invoke('delete-profile', profileToDelete.id)
      await loadProfiles()
      setProfileToDelete(null)
    } catch (error) {
      console.error('Failed to delete profile:', error)
    }
  }

  return (
    <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-sky-50 via-background to-sky-50/40">
      <div className="h-screen flex flex-col p-4 md:p-6 lg:p-8">
        {/* Header with modern gradient and animation */}
        <header className="text-center space-y-3 mb-12 animate-fade-down">
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight 
                         bg-gradient-to-r from-primary-gradient-from to-primary-gradient-to
                         bg-clip-text text-transparent
                         drop-shadow-sm">
            SIKAP
          </h1>
          <p className="font-sans text-muted-foreground text-base md:text-lg font-medium">
            Intelligent planning, effortless productivity
          </p>
        </header>

        {/* Main Content with glass effect and animations */}
        <main className="flex-1 flex items-center justify-center px-4 animate-fade-up">
          <div className="w-full max-w-5xl mx-auto">
            <div className="bg-white/60 backdrop-blur-xl 
                          border border-white/20
                          rounded-2xl shadow-xl shadow-sky-900/5
                          p-6 md:p-8">
              
              <div className="max-w-3xl mx-auto space-y-8">
                <div className="space-y-2 text-center md:text-left">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground/90">
                    Select Profile
                  </h2>
                  <p className="text-muted-foreground/80">
                    Choose a profile to continue or create a new one
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {profiles.map(profile => (
                    <div 
                      key={profile.id}
                      onClick={() => handleProfileSelect(profile.id)}
                      className={cn(
                        "group relative rounded-xl overflow-hidden transition-all duration-300",
                        "cursor-pointer border p-4 md:p-5",
                        "hover:shadow-lg hover:shadow-sky-900/5 hover:scale-[1.02]",
                        "animate-scale-up",
                        selectedProfile === profile.id 
                          ? "border-sky-500/50 bg-sky-50/50 ring-2 ring-sky-500/20" 
                          : "border-border/50 bg-white/60 hover:border-sky-200 hover:bg-sky-50/30"
                      )}
                    >
                      <Avatar className="w-16 h-16 mx-auto mb-3 
                                       ring-2 ring-white shadow-md">
                        <AvatarImage src={profile.avatar || ''} alt={profile.name} />
                        <AvatarFallback className="bg-sky-50 text-sky-700">
                          <UserCircle2 className="w-8 h-8" />
                        </AvatarFallback>
                      </Avatar>

                      <h3 className="text-sm font-medium text-center truncate
                                   text-foreground/80 group-hover:text-sky-700
                                   transition-colors duration-200">
                        {profile.name}
                      </h3>

                      {selectedProfile === profile.id && (
                        <div className="absolute top-3 right-3 
                                      bg-sky-500 rounded-full p-1.5
                                      shadow-sm animate-in fade-in zoom-in
                                      duration-200">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteProfile(profile)
                        }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100
                                 transition-all duration-200 hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={handleCreateProfile}
                    className="h-auto aspect-square flex flex-col items-center justify-center gap-3
                             border-2 border-dashed border-sky-200/50
                             hover:border-sky-300 hover:bg-sky-50/50
                             transition-all duration-200
                             animate-scale-up"
                  >
                    <Plus className="h-8 w-8 text-sky-600" />
                    <span className="text-sm font-medium text-sky-700">New Profile</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!profileToDelete} onOpenChange={() => setProfileToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Profile</DialogTitle>
            <DialogDescription className="text-muted-foreground/80">
              Are you sure you want to delete {profileToDelete?.name}'s profile? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setProfileToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}
                    className="gap-2">
              <Trash2 className="w-4 h-4" />
              Delete Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 