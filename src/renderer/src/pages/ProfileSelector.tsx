import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Profile } from '@prisma/client'
import { UserCircle2, Check, Plus, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from '@/lib/utils'
import { CreateProfileModal } from '@/components/CreateProfileModal'

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

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false)
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
    <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] 
                    dark:from-slate-950 dark:via-background dark:to-slate-950/90
                    from-sky-50 via-background to-sky-50/40">
      <div className="h-screen flex flex-col p-4 md:p-6 lg:p-8">
        <header className="text-center space-y-3 mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight 
                         bg-gradient-to-r from-primary to-primary-gradient-to
                         dark:from-primary dark:to-sky-400
                         bg-clip-text text-transparent
                         drop-shadow-sm">
            SIKAP
          </h1>
          <p className="font-sans text-muted-foreground text-base md:text-lg font-medium">
            Intelligent planning, effortless productivity
          </p>
        </header>

        <main className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-5xl mx-auto">
            <div className="bg-background/60 dark:bg-card/40 backdrop-blur-xl 
                          border border-border/50 dark:border-border/10
                          rounded-2xl shadow-xl shadow-sky-900/5
                          dark:shadow-sky-950/5
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
                        "cursor-pointer p-4 md:p-5",
                        "hover:scale-[1.02]",
                        "animate-scale-up",
                        selectedProfile === profile.id 
                          ? "bg-primary/10 dark:bg-primary/20 border-primary/50 ring-2 ring-primary/30" 
                          : cn(
                              "border border-border/50 hover:border-primary/30",
                              "bg-card dark:bg-card/50",
                              "hover:bg-accent/50 dark:hover:bg-accent/10",
                              "dark:shadow-none"
                            )
                      )}
                    >
                      <div className="relative mx-auto w-16 h-16 mb-3 rounded-full
                                    ring-2 ring-border dark:ring-border/50 
                                    shadow-lg shadow-primary/5
                                    group-hover:ring-primary/50 
                                    transition-all duration-300">
                        <Avatar className="w-full h-full">
                          <AvatarImage src={profile.avatar || ''} alt={profile.name} />
                          <AvatarFallback 
                            className="bg-primary/10 dark:bg-primary/20 
                                     text-primary dark:text-primary/80">
                            <UserCircle2 className="w-8 h-8" />
                          </AvatarFallback>
                        </Avatar>

                        {selectedProfile === profile.id && (
                          <div className="absolute -top-1 -right-1 
                                        bg-primary dark:bg-primary/80 
                                        rounded-full p-1.5
                                        shadow-lg shadow-primary/30
                                        animate-in fade-in zoom-in
                                        duration-200">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>

                      <h3 className="text-sm font-medium text-center truncate
                                   text-foreground/80 group-hover:text-primary
                                   dark:group-hover:text-primary/80
                                   transition-colors duration-200">
                        {profile.name}
                      </h3>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteProfile(profile)
                        }}
                        className="absolute top-2 right-2 h-7 w-7
                                 opacity-0 group-hover:opacity-100
                                 transition-all duration-200 
                                 hover:bg-destructive/10 dark:hover:bg-destructive/20
                                 hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={handleCreateProfile}
                    className={cn(
                      "h-auto aspect-square flex flex-col items-center justify-center gap-3",
                      "border-2 border-dashed",
                      "transition-all duration-200",
                      "animate-scale-up",
                      "hover:border-primary/50 hover:bg-accent/50",
                      "dark:border-border/30 dark:hover:border-primary/50 dark:hover:bg-accent/10",
                      "group"
                    )}
                  >
                    <Plus className="h-8 w-8 text-muted-foreground 
                                   group-hover:text-primary
                                   transition-colors duration-200" />
                    <span className="text-sm font-medium text-muted-foreground
                                   group-hover:text-primary
                                   transition-colors duration-200">
                      New Profile
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <CreateProfileModal 
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSuccess={loadProfiles}
      />

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