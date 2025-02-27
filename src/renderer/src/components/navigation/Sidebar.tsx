import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  Bell,
  UserCircle2,
  LogOut,
  Settings,
} from 'lucide-react'
import { useProfile } from '@/providers/ProfileProvider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useState } from 'react'

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
  const { currentProfile, signOut } = useProfile()
  const [showSignOutDialog, setShowSignOutDialog] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    setShowSignOutDialog(false)
  }

  return (
    <aside className="flex flex-col min-h-0 w-[280px] border-r bg-card/50">
      <div className="shrink-0 flex items-center gap-3 border-b p-4">
        <Avatar className="h-10 w-10 overflow-hidden">
          <AvatarImage src={currentProfile?.avatar || ''} className="object-cover" />
          <AvatarFallback>
            <UserCircle2 className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-sm font-medium">
            {currentProfile?.name || 'Loading...'}
          </p>
          <p className="text-xs text-muted-foreground">
            Workspace
          </p>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="shrink-0 p-4 border-t">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={() => setShowSignOutDialog(true)}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>

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