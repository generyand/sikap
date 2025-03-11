import React, { ReactNode } from 'react'
import { Clock3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface HeaderProps {
  title: string
  icon?: ReactNode
  showDateTime?: boolean
  actions?: ReactNode
  description?: string
}

const LiveDateTime = () => {
  const [date, setDate] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex flex-col">
      <span className="text-sm font-medium text-foreground">
        {date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit',
          hour12: true 
        })}
      </span>
      <span className="text-xs text-muted-foreground">
        {date.toLocaleDateString('en-US', { 
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </span>
    </div>
  )
}

export const Header = ({ 
  title, 
  icon, 
  showDateTime = false,
  actions,
  description
}: HeaderProps) => {
  return (
    <header className="h-16 bg-card border-b border-border sticky top-0 z-10">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 rounded-lg blur opacity-70" />
                <div className="relative bg-primary/10 p-2 rounded-lg shadow-sm">
                  {icon}
                </div>
              </div>
            )}
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {title}
              </h1>
              {description && (
                <p className="text-sm text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
          </div>
          {showDateTime && (
            <>
              <div className="h-6 w-px bg-border/20" />
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/10 rounded-lg blur opacity-70" />
                  <div className="relative bg-primary/10 p-2 rounded-lg shadow-sm">
                    <Clock3 className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <LiveDateTime />
              </div>
            </>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-6">
            {actions}
          </div>
        )}
      </div>
    </header>
  )
} 