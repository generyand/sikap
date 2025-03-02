import { Calendar as BigCalendar, dateFnsLocalizer, View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, addMonths, addDays } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { useTheme } from '../providers/ThemeProvider'
import { useQuery } from '@tanstack/react-query'
import { useProfile } from '../providers/ProfileProvider'
import { fetchTasks } from '../services/taskService'
import { Task, TaskStatus } from '@/types'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import './calendar.css'
import { cn } from '../lib/utils'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Types
type CalendarEvent = {
  id: string
  title: string
  start: Date
  end: Date
  description?: string
  task?: Task
  status: TaskStatus
}

const locales = {
  'en-US': enUS
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

const Calendar = () => {
  const { theme } = useTheme()
  const { profileId } = useProfile()
  const isDark = theme === 'dark' || 
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentView, setCurrentView] = useState<View>('month')
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

  // Update window size on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Automatically switch to more appropriate views on smaller screens
  useEffect(() => {
    if (windowSize.width < 640 && currentView === 'month') {
      setCurrentView('agenda')
    }
  }, [windowSize, currentView])

  // Fetch tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', profileId],
    queryFn: () => fetchTasks(profileId),
  })

  // Convert tasks to calendar events
  const events: CalendarEvent[] = tasks.map(task => ({
    id: task.id,
    title: task.title,
    start: task.startDate || task.dueDate || task.createdAt || new Date(),
    end: task.dueDate || task.startDate || task.createdAt || new Date(),
    description: task.description || undefined,
    task,
    status: task.status
  }))

  // Navigate to the previous period
  const handlePrevious = () => {
    if (currentView === 'month') {
      setCurrentDate(addMonths(currentDate, -1))
    } else if (currentView === 'week') {
      setCurrentDate(addDays(currentDate, -7))
    } else if (currentView === 'day') {
      setCurrentDate(addDays(currentDate, -1))
    }
  }

  // Navigate to the next period
  const handleNext = () => {
    if (currentView === 'month') {
      setCurrentDate(addMonths(currentDate, 1))
    } else if (currentView === 'week') {
      setCurrentDate(addDays(currentDate, 7))
    } else if (currentView === 'day') {
      setCurrentDate(addDays(currentDate, 1))
    }
  }

  // Navigate to today
  const handleToday = () => {
    setCurrentDate(new Date())
  }

  // Custom event styling with theme awareness
  const eventStyleGetter = (event: CalendarEvent) => {
    const baseStyle = {
      borderRadius: '4px',
      opacity: 0.8,
      border: '0',
      display: 'block'
    }

    const statusColors = {
      [TaskStatus.TODO]: {
        light: { bg: '#fef9c3', text: '#854d0e' },  // Yellow
        dark: { bg: '#854d0e', text: '#fef9c3' }
      },
      [TaskStatus.IN_PROGRESS]: {
        light: { bg: '#93c5fd', text: '#1e40af' },  // Blue
        dark: { bg: '#1e40af', text: '#93c5fd' }
      },
      [TaskStatus.COMPLETED]: {
        light: { bg: '#86efac', text: '#166534' },  // Green
        dark: { bg: '#166534', text: '#86efac' }
      },
      [TaskStatus.ARCHIVED]: {
        light: { bg: '#e5e7eb', text: '#374151' },  // Gray
        dark: { bg: '#374151', text: '#e5e7eb' }
      }
    }

    const themeColors = statusColors[event.status][isDark ? 'dark' : 'light']

    return {
      style: {
        ...baseStyle,
        backgroundColor: themeColors.bg,
        color: themeColors.text
      }
    }
  }

  // Custom event component
  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    return (
      <div className="p-1 w-full h-full">
        <div className="font-medium text-xs truncate">{event.title}</div>
        {event.task?.category && (
          <div className="text-xs opacity-80 truncate">
            {event.task.category.toLowerCase()}
          </div>
        )}
      </div>
    )
  }

  // Fix the views array to use View type
  const availableViews: View[] = windowSize.width < 640 
    ? ['agenda', 'day'] as View[]
    : ['month', 'week', 'day', 'agenda'] as View[]

  // Determine calendar height based on window size
  const calendarHeight = windowSize.height < 600 
    ? 500  // Fixed height for very small screens, will scroll
    : 'calc(100vh - 10rem)'  // Dynamic height for larger screens

  // Add this function to format the date based on current view
  const getFormattedDateRange = () => {
    if (currentView === 'month') {
      return format(currentDate, 'MMMM yyyy')
    } else if (currentView === 'week') {
      const start = startOfWeek(currentDate)
      const end = addDays(start, 6)
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
    } else if (currentView === 'day') {
      return format(currentDate, 'EEEE, MMMM d, yyyy')
    } else {
      return format(currentDate, 'MMMM yyyy')
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
        <div className="flex items-center justify-between h-full px-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Calendar</h1>
            
            {/* View switcher - Add this section */}
            <div className="hidden md:flex items-center border rounded-md ml-4 overflow-hidden">
              {(availableViews as View[]).map((view, index) => (
                <Button
                  key={view}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 px-3",
                    // Active state styling
                    currentView === view 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground border-0",
                    // First button - only round left corners
                    index === 0 ? "rounded-r-none rounded-l-md" : "",
                    // Last button - only round right corners
                    index === availableViews.length - 1 ? "rounded-l-none rounded-r-md" : "",
                    // Middle buttons - no rounded corners
                    index > 0 && index < availableViews.length - 1 ? "rounded-none" : ""
                  )}
                  onClick={() => setCurrentView(view)}
                >
                  {view === 'month' ? 'Month' : 
                   view === 'week' ? 'Week' : 
                   view === 'day' ? 'Day' : 'List'}
                </Button>
              ))}
            </div>
            
            {/* Dropdown for smaller screens */}
            <select 
              className="md:hidden ml-2 text-sm rounded border bg-background py-1"
              value={currentView}
              onChange={(e) => setCurrentView(e.target.value as View)}
            >
              {(availableViews as View[]).map((view) => (
                <option key={view} value={view}>
                  {view === 'month' ? 'Month' : 
                   view === 'week' ? 'Week' : 
                   view === 'day' ? 'Day' : 'List'}
                </option>
              ))}
            </select>
          </div>
          
          {/* Add this section - Current date display */}
          <div className="hidden sm:block text-center font-medium">
            <span className="text-lg">{getFormattedDateRange()}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handlePrevious}
              className="hidden sm:flex"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleToday}
            >
              Today
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleNext}
              className="hidden sm:flex"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main content - Scrollable */}
      <div className="flex-1 p-4 overflow-auto custom-scrollbar">
        <div className={cn(
          "rounded-lg shadow-sm min-h-[500px]",
          isDark ? "calendar-dark" : "calendar-light"
        )}>
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: calendarHeight }}
            selectable
            views={availableViews}
            view={currentView}
            onView={setCurrentView}
            date={currentDate}
            onNavigate={setCurrentDate}
            popup
            components={{
              event: EventComponent
            }}
            toolbar={false}
            messages={{
              today: 'Today',
              previous: 'Back',
              next: 'Next',
              month: 'Month',
              week: 'Week',
              day: 'Day',
              agenda: 'List',
              date: 'Date',
              time: 'Time',
              event: 'Event',
              showMore: total => `+${total} more`
            }}
            formats={{
              monthHeaderFormat: 'MMMM yyyy',
              agendaDateFormat: 'MMMM dd',
              dayHeaderFormat: 'MMMM dd, yyyy',
              dayRangeHeaderFormat: ({ start, end }) =>
                `${format(start, 'MMMM dd')} - ${format(end, 'MMMM dd, yyyy')}`,
              eventTimeRangeFormat: () => ''
            }}
            eventPropGetter={eventStyleGetter}
          />
        </div>
      </div>
    </div>
  )
}

export default Calendar