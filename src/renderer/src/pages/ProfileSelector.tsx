import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Profile } from '@/types'
import { UserCircle2, Check, Plus, Trash2, Sparkles, ArrowRight, Circle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from '@/lib/utils'
import { CreateProfileModal } from '@/components/CreateProfileModal'
import { motion } from 'framer-motion'
import { useProfile } from '../providers/ProfileProvider'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profileService } from '@/services/profileService'

export const ProfileSelector = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { setProfileId } = useProfile()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [profileToDelete, setProfileToDelete] = useState<Profile | null>(null)
  
  // Query for profiles
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: profileService.getProfiles
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: profileService.deleteProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
      setProfileToDelete(null)
    }
  })

  // Set current profile mutation
  const setProfileMutation = useMutation({
    mutationFn: profileService.setCurrentProfile,
    onSuccess: (_, profileId) => {
      setProfileId(profileId)
      navigate('/dashboard')
    }
  })

  const handleProfileSelect = (profileId: string) => {
    setProfileMutation.mutate(profileId)
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

  const handleConfirmDelete = () => {
    if (!profileToDelete) return
    deleteMutation.mutate(profileToDelete.id)
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
        <div
          className="absolute -top-20 -right-20 w-96 h-96
                     bg-gradient-to-br from-primary/20 via-primary/5 to-transparent
                     rounded-full blur-3xl"
        />
        
        {/* Bottom-left decorative sphere */}
        <div
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px]
                     bg-gradient-to-tr from-primary/20 via-primary/5 to-transparent
                     rounded-full blur-3xl"
        />

        {/* Static circles instead of floating ones */}
        <div className="absolute inset-0">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${20 + Math.random() * 60}%`,
                opacity: 0.2
              }}
            >
              <Circle 
                className="text-primary/20" 
                size={10 + Math.random() * 20} 
              />
            </div>
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
          <div className={cn(
            "w-full mx-auto",
            // Adjust max width based on whether there are profiles
            profiles.length === 0 ? "max-w-md" : "max-w-5xl"
          )}>
            <motion.div
              // initial={{ opacity: 0, y: 20 }}
              // animate={{ opacity: 1, y: 0 }}
              // transition={{ duration: 0.5, ease: "easeOut" }}
              className={cn(
                "relative backdrop-blur-xl border rounded-2xl",
                "bg-background/60 dark:bg-card/40",
                "border-border/50 dark:border-border/10",
                "shadow-xl shadow-primary/5 dark:shadow-primary/5",
                // Adjust padding based on whether there are profiles
                profiles.length === 0 ? "p-6" : "p-6 md:p-8",
                "before:absolute before:inset-0 before:-z-10",
                "before:bg-gradient-to-b before:from-primary/5 before:to-transparent",
                "before:rounded-2xl"
              )}
            >
              <div className={cn(
                "mx-auto space-y-8",
                // Adjust max width based on whether there are profiles
                profiles.length === 0 ? "" : "max-w-3xl"
              )}>
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground/90">
                    {getContentMessage().title}
                  </h2>
                  <p className="text-muted-foreground/80 max-w-md mx-auto">
                    {getContentMessage().description}
                  </p>
                </div>

                <div className={cn(
                  "flex flex-wrap justify-center gap-4",
                  // Add max width to contain the flex items
                  "max-w-[1200px] mx-auto"
                )}>
                  {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                  ) : profiles.map(profile => (
                    <div 
                      key={profile.id}
                      onClick={() => handleProfileSelect(profile.id)}
                      className={cn(
                        "group relative transition-all duration-300",
                        "w-[180px] h-[180px]",
                        "rounded-xl overflow-hidden",
                        "cursor-pointer p-4 md:p-5",
                        "border border-border/40",
                        "bg-card/30 dark:bg-card/20",
                        "hover:scale-[1.02]",
                        "hover:border-primary/50",
                        "hover:bg-card/50 dark:hover:bg-card/30",
                        "hover:shadow-lg hover:shadow-primary/5",
                        "hover:ring-1 hover:ring-primary/20",
                        profileToDelete === profile && "bg-destructive/10 dark:bg-destructive/20 border-destructive/50 ring-2 ring-destructive/30"
                      )}
                    >
                      <div className="relative mx-auto w-16 h-16 mb-3">
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent rounded-full" />
                        <Avatar className="w-full h-full ring-2 ring-border dark:ring-border/50 
                                       shadow-lg shadow-primary/5
                                       group-hover:ring-primary/50 
                                       transition-all duration-300 overflow-hidden">
                          <AvatarImage src={profile.avatar || ''} alt={profile.name} className="object-cover" />
                          <AvatarFallback 
                            className="bg-primary/10 dark:bg-primary/20 
                                     text-primary dark:text-primary/80">
                            <UserCircle2 className="w-8 h-8" />
                          </AvatarFallback>
                        </Avatar>

                        {profileToDelete === profile && (
                          <div className="absolute -top-1 -right-1 
                                        bg-destructive dark:bg-destructive/80 
                                        rounded-full p-1.5
                                        shadow-lg shadow-destructive/30">
                            <Check className="w-3 h-3 text-destructive-foreground" />
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
                          Click to continue {profileToDelete === profile && <ArrowRight className="inline w-3 h-3" />}
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
                      "w-[180px] h-[180px]",
                      "relative overflow-hidden",
                      "transition-all duration-200",
                      "group",
                      "flex flex-col items-center justify-center gap-3",
                      "border-2 border-dashed border-border/40",
                      "bg-card/30 dark:bg-card/20",
                      "hover:border-primary/50 hover:border-solid",
                      "hover:bg-card/50 dark:hover:bg-card/30",
                      "hover:shadow-lg hover:shadow-primary/5",
                      "hover:ring-1 hover:ring-primary/20",
                      "before:absolute before:inset-0 before:-z-10",
                      "before:bg-gradient-to-b before:from-primary/5 before:to-transparent",
                      "before:opacity-0 before:group-hover:opacity-100",
                      "before:transition-opacity before:duration-200"
                    )}
                  >
                    <Plus className="h-8 w-8 text-muted-foreground 
                                    group-hover:text-primary 
                                    transition-colors duration-200" />
                    <span className="text-sm font-medium text-muted-foreground
                                    group-hover:text-primary
                                    transition-colors duration-200">
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
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['profiles'] })}
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