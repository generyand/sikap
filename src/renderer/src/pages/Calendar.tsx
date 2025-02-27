import { useState } from 'react'
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { useTheme } from '../providers/ThemeProvider' // Update the import path
import 'react-big-calendar/lib/css/react-big-calendar.css'
import './calendar.css'

// Types
type Event = {
  id: string
  title: string
  start: Date
  end: Date
  type: 'meeting' | 'task' | 'reminder'
  description?: string
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
  // Check both theme setting and system preference
  const isDark = theme === 'dark' || 
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Sample Meeting',
      start: new Date(2024, 2, 20, 10, 0),
      end: new Date(2024, 2, 20, 11, 0),
      type: 'meeting',
      description: 'Team sync meeting'
    }
  ])

  const handleSelect = ({ start, end }: { start: Date; end: Date }) => {
    const title = window.prompt('New Event name')
    if (title) {
      setEvents([
        ...events,
        {
          id: String(events.length + 1),
          title,
          start,
          end,
          type: 'meeting' // Default type, you might want to add a type selector in a proper form
        },
      ])
    }
  }

  // Custom event styling with theme awareness
  const eventStyleGetter = (event: Event) => {
    const baseStyle = {
      borderRadius: '4px',
      opacity: 0.8,
      border: '0',
      display: 'block'
    }

    const colors = {
      meeting: {
        light: { bg: '#93c5fd', text: '#1e40af' },
        dark: { bg: '#1e40af', text: '#93c5fd' }
      },
      task: {
        light: { bg: '#86efac', text: '#166534' },
        dark: { bg: '#166534', text: '#86efac' }
      },
      reminder: {
        light: { bg: '#fde047', text: '#854d0e' },
        dark: { bg: '#854d0e', text: '#fde047' }
      }
    }

    const themeColors = colors[event.type][isDark ? 'dark' : 'light']

    return {
      style: {
        ...baseStyle,
        backgroundColor: themeColors.bg,
        color: themeColors.text
      }
    }
  }

  return (
    <div className={`h-screen p-6 rounded-lg shadow-sm ${isDark ? 'bg-gray-800' : 'bg-transparent'}`}>
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 'calc(100vh - 8rem)' }}
        selectable
        onSelectSlot={handleSelect}
        eventPropGetter={eventStyleGetter}
        views={['month', 'week', 'day', 'agenda']}
        defaultView="month"
        popup
        tooltipAccessor={event => event.description || ''}
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
            `${format(start, 'MMMM dd')} - ${format(end, 'MMMM dd, yyyy')}`
        }}
        className={isDark ? 'calendar-dark' : 'calendar-light'}
      />
    </div>
  )
}

export default Calendar