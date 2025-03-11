import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  Bell,
  UserCircle2,
  LogOut,
  Settings,
  Loader2,
} from 'lucide-react'
import { useProfile } from '@/providers/ProfileProvider'
import { useNotifications } from '@/hooks/useNotifications'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useState, useCallback, useEffect } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const MIN_SIDEBAR_WIDTH = 200
const MAX_SIDEBAR_WIDTH = 480
const DEFAULT_SIDEBAR_WIDTH = 200

const navItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard'
  },
  {
    label: 'Tasks',
    icon: CheckSquare,
    path: '/tasks'
  },
  {
    label: 'Calendar',
    icon: Calendar,
    path: '/calendar'
  },
  // {
  //   label: 'Timeline',
  //   icon: Clock,
  //   path: '/timeline'
  // },
  {
    label: 'Notifications',
    icon: Bell,
    path: '/notifications'
  },
  {
    label: 'Settings',
    icon: Settings,
    path: '/settings'
  } 
]

export const Sidebar = () => {
  const location = useLocation()
  const { currentProfile, isLoading, signOut } = useProfile()
  const { unreadCount } = useNotifications()
  const [showSignOutDialog, setShowSignOutDialog] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH)
  const [isResizing, setIsResizing] = useState(false)

  const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault()
    setIsResizing(true)
  }, [])

  const stopResizing = useCallback(() => {
    setIsResizing(false)
  }, [])

  const resize = useCallback((mouseMoveEvent: MouseEvent) => {
    if (isResizing) {
      const newWidth = mouseMoveEvent.clientX
      if (newWidth >= MIN_SIDEBAR_WIDTH && newWidth <= MAX_SIDEBAR_WIDTH) {
        setSidebarWidth(newWidth)
      }
    }
  }, [isResizing])

  useEffect(() => {
    window.addEventListener('mousemove', resize)
    window.addEventListener('mouseup', stopResizing)
    return () => {
      window.removeEventListener('mousemove', resize)
      window.removeEventListener('mouseup', stopResizing)
    }
  }, [resize, stopResizing])

  const handleSignOut = async () => {
    await signOut()
    setShowSignOutDialog(false)
  }

  return (
    <aside 
      className="flex-none flex flex-col min-h-0 border-r bg-card shrink-0 relative"
      style={{ width: sidebarWidth }}
    >
      <div
        className={cn(
          "absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize transition-colors",
          isResizing ? "bg-primary" : "hover:bg-accent/50"
        )}
        onMouseDown={startResizing}
      />
      
      <TooltipProvider>
        <div className="h-16 shrink-0 flex items-center gap-3 border-b px-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="h-8 w-8 overflow-hidden cursor-pointer">
                <AvatarImage src={currentProfile?.avatar || ''} className="object-cover" />
                <AvatarFallback>
                  <UserCircle2 className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>Your profile</p>
            </TooltipContent>
          </Tooltip>
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Loading profile...</span>
              </div>
            ) : (
              <>
                <p className="text-sm font-medium truncate">
                  {currentProfile?.name || 'No profile selected'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Workspace
                </p>
              </>
            )}
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            const isNotifications = item.path === '/notifications'
            return (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-2 md:gap-3 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm transition-colors relative",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {isNotifications && unreadCount > 0 && (
                      <span className={cn(
                        "absolute right-2 top-1/2 -translate-y-1/2 min-w-[1.25rem] h-5 rounded-full flex items-center justify-center text-xs",
                        isActive 
                          ? "bg-primary-foreground text-primary" 
                          : "bg-primary text-primary-foreground"
                      )}>
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>View {item.label}</p>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </nav>

        <div className="shrink-0 p-2 sm:p-3 md:p-4 border-t">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-muted-foreground hover:text-destructive text-xs sm:text-sm"
                onClick={() => setShowSignOutDialog(true)}
              >
                <LogOut className="mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">Sign Out</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Sign out of your account</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      <Dialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sign Out</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out? You'll need to select your profile again to continue.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowSignOutDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSignOut}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  )
} 