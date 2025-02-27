import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  Bell,
  Clock,
  Settings,
} from 'lucide-react'
import { ThemeToggle } from '../theme/ThemeToggle'
import { useProfile } from '../../providers/ProfileProvider'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { cn } from '@/lib/utils'

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
  {
    label: 'Timeline',
    icon: Clock,
    path: '/timeline'
  },
  {
    label: 'Notifications',
    icon: Bell,
    path: '/notifications'
  }
]

export const Sidebar = () => {
  const location = useLocation()
  const { profileId } = useProfile()

  return (
    <aside className="flex h-screen w-[280px] flex-col border-r bg-card/50">
      {/* Profile Section */}
      <div className="flex items-center gap-3 border-b p-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={`/avatars/${profileId}.png`} />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-sm font-medium">John Doe</p>
          <p className="text-xs text-muted-foreground">Premium Plan</p>
        </div>
        <Link 
          to="/settings" 
          className="rounded-lg p-2 hover:bg-accent"
        >
          <Settings className="h-5 w-5 text-muted-foreground" />
        </Link>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
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

      {/* Theme Toggle */}
      {/* <div className="border-t p-4">
        <ThemeToggle />
      </div> */}
    </aside>
  )
} 