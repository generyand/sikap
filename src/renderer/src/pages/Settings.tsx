import { useState } from 'react';
import { 
  Moon, 
  Sun, 
  Bell, 
  Calendar, 
  Save, 
  CheckSquare, 
  Eye, 
  Settings as SettingsIcon,
} from 'lucide-react';
import { Header } from '@/components/layout/Header'

type ThemeType = 'light' | 'dark' | 'system';
type WeekStartDay = 'monday' | 'sunday';
type PriorityDefault = 'none' | 'low' | 'medium' | 'high';

const Settings = () => {
  // Appearance settings
  const [theme, setTheme] = useState<ThemeType>('system');
  const [compactMode, setCompactMode] = useState(false);
  
  // Task settings
  const [defaultPriority, setDefaultPriority] = useState<PriorityDefault>('none');
  const [defaultDueTime, setDefaultDueTime] = useState('17:00');
  const [defaultTaskDuration, setDefaultTaskDuration] = useState(30);
  
  // Calendar settings
  const [weekStartDay, setWeekStartDay] = useState<WeekStartDay>('monday');
  const [workingHoursStart, setWorkingHoursStart] = useState('09:00');
  const [workingHoursEnd, setWorkingHoursEnd] = useState('17:00');
  
  // Notification settings
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState(15); // minutes before
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  
  // Data settings
  const [autoSave, setAutoSave] = useState(true);
  const [autoSaveInterval, setAutoSaveInterval] = useState(5);

  // Toggle switch component
  const ToggleSwitch = ({ 
    enabled, 
    onChange, 
    label, 
    description 
  }: { 
    enabled: boolean; 
    onChange: (value: boolean) => void; 
    label: string;
    description?: string;
  }) => (
    <div className="flex items-start justify-between py-3 px-4">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </div>
      <button 
        type="button"
        onClick={() => onChange(!enabled)}
        className={`${
          enabled ? 'bg-blue-600' : 'bg-gray-200'
        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
      >
        <span className="sr-only">{label}</span>
        <span
          className={`${
            enabled ? 'translate-x-5' : 'translate-x-0'
          } pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
      </button>
    </div>
  );

  // Section component
  const SettingsSection = ({ 
    title, 
    icon, 
    children 
  }: { 
    title: string; 
    icon: React.ReactNode; 
    children: React.ReactNode;
  }) => (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-full bg-blue-50 text-blue-600">
          {icon}
        </div>
        <h2 className="text-lg font-medium">{title}</h2>
      </div>
      <div className="bg-white rounded-lg shadow divide-y divide-gray-100">
        {children}
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-w-0 h-screen">
      <Header 
        title="Settings"
        icon={<SettingsIcon className="h-5 w-5 text-primary" />}
        showDateTime={true}
        description="Customize your Sikap experience"
      />
      
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-auto p-6 custom-scrollbar">
        <div className="container mx-auto max-w-3xl">
          {/* Appearance Section */}
          <SettingsSection title="Appearance" icon={<Eye className="w-5 h-5" />}>
            <div className="p-4">
              <p className="text-sm font-medium text-gray-900 mb-3">Theme</p>
              <div className="grid grid-cols-3 gap-3">
                {(['light', 'dark', 'system'] as const).map((themeOption) => (
                  <button
                    key={themeOption}
                    type="button"
                    onClick={() => setTheme(themeOption)}
                    className={`flex items-center justify-center px-3 py-2 border rounded-md text-sm ${
                      theme === themeOption
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {themeOption === 'light' && <Sun className="w-4 h-4 mr-2" />}
                    {themeOption === 'dark' && <Moon className="w-4 h-4 mr-2" />}
                    {themeOption === 'system' && (
                      <div className="flex mr-2">
                        <Sun className="w-4 h-4" />
                        <Moon className="w-4 h-4 -ml-1" />
                      </div>
                    )}
                    {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <ToggleSwitch
              enabled={compactMode}
              onChange={setCompactMode}
              label="Compact Mode"
              description="Reduce spacing to show more content on screen"
            />
          </SettingsSection>

          {/* Tasks Settings */}
          <SettingsSection title="Task Defaults" icon={<CheckSquare className="w-5 h-5" />}>
            <div className="p-4">
              <p className="text-sm font-medium text-gray-900 mb-2">Default Priority</p>
              <div className="grid grid-cols-4 gap-2 mt-1">
                {(['none', 'low', 'medium', 'high'] as const).map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => setDefaultPriority(priority)}
                    className={`px-3 py-2 border rounded-md text-sm ${
                      defaultPriority === priority
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4">
              <label htmlFor="default-due-time" className="block text-sm font-medium text-gray-900 mb-1">
                Default Due Time
              </label>
              <input
                id="default-due-time"
                type="time"
                value={defaultDueTime}
                onChange={(e) => setDefaultDueTime(e.target.value)}
                className="block w-full max-w-xs rounded-md border border-gray-300 shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Default time when setting a task due date
              </p>
            </div>

            <div className="p-4">
              <label htmlFor="default-task-duration" className="block text-sm font-medium text-gray-900 mb-1">
                Default Task Duration (minutes)
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="default-task-duration"
                  type="range"
                  min="5"
                  max="180"
                  step="5"
                  value={defaultTaskDuration}
                  onChange={(e) => setDefaultTaskDuration(parseInt(e.target.value))}
                  className="w-full max-w-xs h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-900 min-w-[2.5rem]">
                  {defaultTaskDuration}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Default duration when creating a new task
              </p>
            </div>
          </SettingsSection>

          {/* Calendar Section */}
          <SettingsSection title="Calendar" icon={<Calendar className="w-5 h-5" />}>
            <div className="p-4">
              <p className="text-sm font-medium text-gray-900 mb-2">Week Starts On</p>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setWeekStartDay('monday')}
                  className={`px-3 py-2 border rounded-md text-sm ${
                    weekStartDay === 'monday'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Monday
                </button>
                <button
                  type="button"
                  onClick={() => setWeekStartDay('sunday')}
                  className={`px-3 py-2 border rounded-md text-sm ${
                    weekStartDay === 'sunday'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Sunday
                </button>
              </div>
            </div>

            <div className="p-4">
              <p className="text-sm font-medium text-gray-900 mb-2">Working Hours</p>
              <div className="flex flex-wrap gap-4 mt-1">
                <div>
                  <label htmlFor="working-hours-start" className="block text-xs text-gray-500 mb-1">
                    Start Time
                  </label>
                  <input
                    id="working-hours-start"
                    type="time"
                    value={workingHoursStart}
                    onChange={(e) => setWorkingHoursStart(e.target.value)}
                    className="block rounded-md border border-gray-300 shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="working-hours-end" className="block text-xs text-gray-500 mb-1">
                    End Time
                  </label>
                  <input
                    id="working-hours-end"
                    type="time"
                    value={workingHoursEnd}
                    onChange={(e) => setWorkingHoursEnd(e.target.value)}
                    className="block rounded-md border border-gray-300 shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Working hours are highlighted in the calendar view
              </p>
            </div>
          </SettingsSection>

          {/* Notifications Section */}
          <SettingsSection title="Reminders & Notifications" icon={<Bell className="w-5 h-5" />}>
            <ToggleSwitch
              enabled={remindersEnabled}
              onChange={setRemindersEnabled}
              label="Enable Reminders"
              description="Receive notifications for upcoming tasks and events"
            />
            
            {remindersEnabled && (
              <div className="p-4">
                <label htmlFor="reminder-time" className="block text-sm font-medium text-gray-900 mb-1">
                  Default Reminder Time (minutes before)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="reminder-time"
                    type="range"
                    min="0"
                    max="120"
                    step="5"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(parseInt(e.target.value))}
                    className="w-full max-w-xs h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-900 min-w-[2.5rem]">
                    {reminderTime}
                  </span>
                </div>
              </div>
            )}
            
            <ToggleSwitch
              enabled={soundsEnabled}
              onChange={setSoundsEnabled}
              label="Notification Sounds"
              description="Play sounds for reminders and notifications"
            />
          </SettingsSection>

          {/* Data Section */}
          <SettingsSection title="Data & Backup" icon={<Save className="w-5 h-5" />}>
            <ToggleSwitch
              enabled={autoSave}
              onChange={setAutoSave}
              label="Auto-save changes"
              description="Automatically save your work as you make changes"
            />

            {autoSave && (
              <div className="p-4">
                <label htmlFor="auto-save-interval" className="block text-sm font-medium text-gray-900 mb-1">
                  Auto-save interval (minutes)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="auto-save-interval"
                    type="range"
                    min="1"
                    max="30"
                    value={autoSaveInterval}
                    onChange={(e) => setAutoSaveInterval(parseInt(e.target.value))}
                    className="w-full max-w-xs h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-900 min-w-[2.5rem]">
                    {autoSaveInterval}
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-col p-4 gap-3">
              <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 text-sm font-medium transition-colors">
                Export Data
              </button>
              <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 text-sm font-medium transition-colors">
                Import Data
              </button>
              <button className="mt-2 px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 text-sm font-medium transition-colors">
                Reset All Data
              </button>
              <p className="mt-1 text-xs text-gray-500">
                Warning: This will permanently delete all your tasks, events, and settings
              </p>
            </div>
          </SettingsSection>
        </div>
      </div>
    </div>
  );
};

export default Settings;