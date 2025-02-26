import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Profile } from '@prisma/client'
import { UserCircle2, Check, Plus, Trash2, Sparkles, ArrowRight, Circle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from '@/lib/utils'
import { CreateProfileModal } from '@/components/CreateProfileModal'
import { motion } from 'framer-motion'

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

  const getContentMessage = () => {
    if (profiles.length === 0) {
      return {
        title: "Create Your First Profile",
        description: "Start your productivity journey by creating a personalized workspace"
      }
    }
    return {
      title: "Choose Your Workspace",
      description: "Select a profile to access your personalized dashboard and continue your productivity journey"
    }
  }

  return (
    <div className="min-h-screen overflow-hidden relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] 
                    dark:from-primary/5 dark:via-background dark:to-background
                    from-primary/5 via-background to-background">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top-right decorative sphere */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute -top-20 -right-20 w-96 h-96
                     bg-gradient-to-br from-primary/20 via-primary/5 to-transparent
                     rounded-full blur-3xl"
        />
        
        {/* Bottom-left decorative sphere */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px]
                     bg-gradient-to-tr from-primary/20 via-primary/5 to-transparent
                     rounded-full blur-3xl"
        />

        {/* Floating circles */}
        <div className="absolute inset-0">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                opacity: 0,
                y: Math.random() * 100,
                x: Math.random() * 100
              }}
              animate={{ 
                opacity: [0.1, 0.3, 0.1],
                y: [0, -50, 0],
                x: [0, 30, 0]
              }}
              transition={{
                duration: 10 + Math.random() * 5,
                repeat: Infinity,
                delay: i * 2,
                ease: "easeInOut"
              }}
              className="absolute"
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${20 + Math.random() * 60}%`,
              }}
            >
              <Circle 
                className="text-primary/20" 
                size={10 + Math.random() * 20} 
              />
            </motion.div>
          ))}
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)]
                     bg-[size:14px_24px]
                     [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      </div>

      {/* Main Content */}
      <div className="relative h-screen flex flex-col p-4 md:p-6 lg:p-8">
        <header className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center justify-center gap-2 
                         px-4 py-1.5 rounded-full 
                         bg-primary/10 text-primary dark:text-primary/80
                         text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>Welcome to your productivity journey</span>
          </div>
          
          <div className="space-y-3">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight 
                         bg-gradient-to-r from-primary via-primary/80 to-primary/60
                         dark:from-primary dark:via-sky-400 dark:to-sky-500/60
                         bg-clip-text text-transparent
                         drop-shadow-sm">
              SIKAP
            </h1>
            <p className="text-muted-foreground text-base md:text-lg font-medium max-w-md mx-auto">
              Your intelligent companion for mindful planning and effortless productivity
            </p>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative bg-background/60 dark:bg-card/40 backdrop-blur-xl 
                        border border-border/50 dark:border-border/10
                        rounded-2xl shadow-xl shadow-primary/5
                        dark:shadow-primary/10
                        p-6 md:p-8
                        before:absolute before:inset-0 before:-z-10 
                        before:bg-gradient-to-b before:from-primary/5 before:to-transparent
                        before:rounded-2xl"
            >
              {/* Card glow effect */}
              <div className="absolute -inset-px bg-gradient-to-b from-primary/20 via-transparent to-transparent 
                            rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="max-w-3xl mx-auto space-y-8">
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground/90">
                    {getContentMessage().title}
                  </h2>
                  <p className="text-muted-foreground/80 max-w-md mx-auto">
                    {getContentMessage().description}
                  </p>
                </div>

                <div className={cn(
                  "grid gap-4",
                  profiles.length === 0 
                    ? "grid-cols-1 sm:grid-cols-1 max-w-xs mx-auto" 
                    : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                )}>
                  {profiles.map(profile => (
                    <div 
                      key={profile.id}
                      onClick={() => handleProfileSelect(profile.id)}
                      className={cn(
                        "group relative rounded-xl overflow-hidden transition-all duration-300",
                        "cursor-pointer p-4 md:p-5",
                        "hover:scale-[1.02]",
                        selectedProfile === profile.id 
                          ? "bg-primary/10 dark:bg-primary/20 border-primary/50 ring-2 ring-primary/30" 
                          : cn(
                              "border border-border/50 hover:border-primary/30",
                              "bg-card/50 dark:bg-card/50",
                              "hover:bg-accent/50 dark:hover:bg-accent/10",
                              "dark:shadow-none"
                            )
                      )}
                    >
                      <div className="relative mx-auto w-16 h-16 mb-3">
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent rounded-full" />
                        <Avatar className="w-full h-full ring-2 ring-border dark:ring-border/50 
                                       shadow-lg shadow-primary/5
                                       group-hover:ring-primary/50 
                                       transition-all duration-300">
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
                                        shadow-lg shadow-primary/30">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 text-center">
                        <h3 className="text-sm font-medium truncate
                                   text-foreground/80 group-hover:text-primary
                                   dark:group-hover:text-primary/80
                                   transition-colors duration-200">
                          {profile.name}
                        </h3>
                        <p className="text-xs text-muted-foreground/60">
                          Click to continue {selectedProfile === profile.id && <ArrowRight className="inline w-3 h-3" />}
                        </p>
                      </div>

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
                      "relative overflow-hidden",
                      "border-2 border-dashed",
                      "transition-all duration-200",
                      "hover:border-primary/50 hover:bg-accent/50",
                      "dark:border-border/30 dark:hover:border-primary/50 dark:hover:bg-accent/10",
                      "group",
                      "before:absolute before:inset-0 before:-z-10",
                      "before:bg-gradient-to-b before:from-primary/5 before:to-transparent",
                      "before:opacity-0 before:group-hover:opacity-100",
                      "before:transition-opacity before:duration-200",
                      profiles.length === 0 && "p-8"
                    )}
                  >
                    <Plus className={cn(
                      "text-muted-foreground group-hover:text-primary transition-colors duration-200",
                      profiles.length === 0 ? "h-12 w-12" : "h-8 w-8"
                    )} />
                    <span className={cn(
                      "text-muted-foreground group-hover:text-primary transition-colors duration-200",
                      profiles.length === 0 ? "text-base" : "text-sm",
                      "font-medium"
                    )}>
                      {profiles.length === 0 ? "Create Profile" : "New Profile"}
                    </span>
                  </Button>
                </div>
              </div>
            </motion.div>
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