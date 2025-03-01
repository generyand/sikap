import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { useTheme } from '../providers/ThemeProvider'
import { useQuery } from '@tanstack/react-query'
import { useProfile } from '../providers/ProfileProvider'
import { fetchTasks } from '../services/taskService'
import type { Task } from '@prisma/client'
import { TaskStatus } from '@/types'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import './calendar.css'
import { cn } from '../lib/utils'

// Types
type CalendarEvent = {
  id: string
  title: string
  start: Date
  end: Date
  description?: string
  task?: Task // Original task data
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

  // Fetch tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', profileId],
    queryFn: () => fetchTasks(profileId),
  })

  // Convert tasks to calendar events
  const events: CalendarEvent[] = tasks.map(task => ({
    id: task.id,
    title: task.title,
    start: task.startDate || task.dueDate || task.createdAt,
    end: task.dueDate || task.startDate || task.createdAt,
    description: task.description || undefined,
    task, // Keep reference to original task
    status: task.status
  }))

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

  return (
    <div className={cn(
      "h-screen p-6 rounded-lg shadow-sm",
      isDark ? "bg-gray-800" : "bg-transparent"
    )}>
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 'calc(100vh - 8rem)' }}
        selectable
        views={['month', 'week', 'day', 'agenda']}
        defaultView="month"
        popup
        components={{
          event: EventComponent
        }}
        messages={{
          today: 'Today',
          previous: 'Back',
          next: 'Next',
          month: 'Month',
          week: 'Week',
          day: 'Day',
          agenda: 'Agenda',
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
        className={isDark ? 'calendar-dark' : 'calendar-light'}
        eventPropGetter={eventStyleGetter}
      />
    </div>
  )
}

export default Calendar