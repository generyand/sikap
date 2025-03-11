import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Profile } from '@/types'
import { UserCircle2, Check, Plus, Trash2, Sparkles, ArrowRight, Circle, Lock } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from '@/lib/utils'
import { CreateProfileModal } from '@/components/CreateProfileModal'
import { motion } from 'framer-motion'
import { useProfile } from '../providers/ProfileProvider'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profileService } from '@/services/profileService'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const ProfileSelector = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { setProfileId } = useProfile()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [profileToDelete, setProfileToDelete] = useState<Profile | null>(null)
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  
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
    mutationFn: ({ id, password }: { id: string, password: string }) => 
      profileService.setCurrentProfile(id, password),
    onSuccess: (_, { id }) => {
      setProfileId(id)
      navigate('/dashboard')
    },
    onError: (error) => {
      setError('Invalid password. Please try again.')
      setPassword('')
    }
  })

  const handleProfileSelect = (profile: Profile) => {
    setSelectedProfile(profile)
    setPassword('')
    setError(null)
  }

  const handlePasswordSubmit = () => {
    if (!selectedProfile) return
    setProfileMutation.mutate({ id: selectedProfile.id, password })
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
    <div className="min-h-screen overflow-auto relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] 
                    dark:from-primary/5 dark:via-background dark:to-background
                    from-primary/5 via-background to-background">
      {/* Decorative Elements - Modified to use relative sizing */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top-right decorative sphere */}
        <div
          className="absolute -top-[5%] -right-[5%] w-[30%] h-[30%] min-w-[200px] min-h-[200px]
                     bg-gradient-to-br from-primary/20 via-primary/5 to-transparent
                     rounded-full blur-3xl"
        />
        
        {/* Bottom-left decorative sphere */}
        <div
          className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] min-w-[300px] min-h-[300px]
                     bg-gradient-to-tr from-primary/20 via-primary/5 to-transparent
                     rounded-full blur-3xl"
        />

        {/* Static circles - Keep as is */}
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

        {/* Grid pattern - Keep as is */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)]
                     bg-[size:14px_24px]
                     [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      </div>

      {/* Main Content - Modified for better responsiveness */}
      <div className="relative min-h-screen flex flex-col p-4 md:p-6 lg:p-8 overflow-auto">
        <header className="text-center space-y-4 sm:space-y-6 mb-6 sm:mb-8 lg:mb-12 flex-shrink-0">
          <div className="inline-flex items-center justify-center gap-2 
                         px-3 sm:px-4 py-1 sm:py-1.5 rounded-full 
                         bg-primary/10 text-primary dark:text-primary/80
                         text-xs sm:text-sm font-medium">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="truncate">Welcome to your productivity journey</span>
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight 
                         bg-gradient-to-r from-primary via-primary/80 to-primary/60
                         dark:from-primary dark:via-sky-400 dark:to-sky-500/60
                         bg-clip-text text-transparent
                         drop-shadow-sm">
              SIKAP
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg font-medium max-w-md mx-auto">
              Your intelligent companion for mindful planning and effortless productivity
            </p>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-2 sm:px-4 overflow-auto">
          <div className={cn(
            "w-full mx-auto",
            profiles.length === 0 ? "max-w-md" : "max-w-[95%] lg:max-w-5xl"
          )}>
            <motion.div
              className={cn(
                "relative backdrop-blur-xl border rounded-2xl",
                "bg-background/60 dark:bg-card/40",
                "border-border/50 dark:border-border/10",
                "shadow-xl shadow-primary/5 dark:shadow-primary/5",
                profiles.length === 0 ? "p-4 sm:p-6" : "p-4 sm:p-6 md:p-8",
                "before:absolute before:inset-0 before:-z-10",
                "before:bg-gradient-to-b before:from-primary/5 before:to-transparent",
                "before:rounded-2xl"
              )}
            >
              <div className={cn(
                "mx-auto space-y-4 sm:space-y-6 lg:space-y-8",
                profiles.length === 0 ? "" : "max-w-3xl"
              )}>
                <div className="space-y-1 sm:space-y-2 text-center">
                  <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground/90">
                    {getContentMessage().title}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground/80 max-w-md mx-auto">
                    {getContentMessage().description}
                  </p>
                </div>

                <div className={cn(
                  "flex flex-wrap justify-center gap-2 sm:gap-4",
                  "max-w-full mx-auto",
                  "overflow-visible"
                )}>
                  {isLoading ? (
                    <div className="flex items-center justify-center h-32 sm:h-64">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                  ) : profiles.map(profile => (
                    <div 
                      key={profile.id}
                      onClick={() => handleProfileSelect(profile)}
                      className={cn(
                        "group relative transition-all duration-300",
                        "w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] md:w-[180px] md:h-[180px]", // Responsive sizing
                        "rounded-xl overflow-hidden",
                        "cursor-pointer p-3 sm:p-4 md:p-5",
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
                      <div className="relative mx-auto w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 mb-2 sm:mb-3">
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent rounded-full" />
                        <Avatar className="w-full h-full ring-2 ring-border dark:ring-border/50 
                                       shadow-lg shadow-primary/5
                                       group-hover:ring-primary/50 
                                       transition-all duration-300 overflow-hidden">
                          <AvatarImage src={profile.avatar || ''} alt={profile.name} className="object-cover" />
                          <AvatarFallback 
                            className="bg-primary/10 dark:bg-primary/20 
                                     text-primary dark:text-primary/80">
                            <UserCircle2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
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
                        <h3 className="text-xs sm:text-sm font-medium truncate
                                   text-foreground/80 group-hover:text-primary
                                   dark:group-hover:text-primary/80
                                   transition-colors duration-200">
                          {profile.name}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-muted-foreground/60">
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
                        className="absolute top-1 sm:top-2 right-1 sm:right-2 h-6 w-6 sm:h-7 sm:w-7
                                 opacity-0 group-hover:opacity-100
                                 transition-all duration-200 
                                 hover:bg-destructive/10 dark:hover:bg-destructive/20
                                 hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={handleCreateProfile}
                    className={cn(
                      "w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] md:w-[180px] md:h-[180px]",
                      "relative overflow-hidden",
                      "transition-all duration-200",
                      "group",
                      "flex flex-col items-center justify-center gap-2 sm:gap-3",
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
                    <Plus className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-muted-foreground 
                                    group-hover:text-primary 
                                    transition-colors duration-200" />
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground
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

      <Dialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Sign In to Profile
            </DialogTitle>
            <DialogDescription className="text-muted-foreground/80">
              Enter your password to access {selectedProfile?.name}'s profile
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                placeholder="Enter your password"
                className={cn(
                  error && "border-destructive focus-visible:ring-destructive"
                )}
              />
              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSelectedProfile(null)}>
              Cancel
            </Button>
            <Button onClick={handlePasswordSubmit} className="gap-2">
              <Lock className="w-4 h-4" />
              Sign In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 