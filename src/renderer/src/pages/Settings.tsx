import { useState, useEffect, useRef } from 'react';
import { 
  Moon, 
  Sun, 
  Save, 
  User,
  Trash2,
  Camera,
  Eye,
  EyeOff,
  Settings as SettingsIcon,
} from 'lucide-react';
import { Header } from '@/components/layout/Header'

type ThemeType = 'light' | 'dark' | 'system';

const Settings = () => {
  // Profile settings
  const [profile, setProfile] = useState({
    name: '',
    picture: '',
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // UI states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Theme settings
  const [theme, setTheme] = useState<ThemeType>('system');

  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Load profile and theme data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const currentProfileId = await window.electron.ipcRenderer.invoke('get-current-profile');
        if (currentProfileId) {
          const profileData = await window.electron.ipcRenderer.invoke('get-profile', currentProfileId);
          const currentTheme = await window.electron.ipcRenderer.invoke('get-theme', currentProfileId);
          if (profileData) {
            setProfile({
              name: profileData.name || '',
              picture: profileData.picture || '',
            });
            setTheme(currentTheme || 'system');
            
            // Apply theme to document
            document.documentElement.classList.remove('light', 'dark');
            if (currentTheme === 'dark') {
              document.documentElement.classList.add('dark');
            } else if (currentTheme === 'light') {
              document.documentElement.classList.add('light');
            } else {
              // For system theme, check prefers-color-scheme
              if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.add('light');
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };

    loadProfile();
  }, []);

  // Handle profile picture change
  const handlePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const pictureData = await window.electron.ipcRenderer.invoke('upload-profile-picture', file.path);
        setProfile(prev => ({ ...prev, picture: pictureData }));
      } catch (error) {
        console.error('Failed to upload profile picture:', error);
      }
    }
  };

  // Handle profile update
  const handleProfileUpdate = async () => {
    try {
      const currentProfileId = await window.electron.ipcRenderer.invoke('get-current-profile');
      if (currentProfileId) {
        await window.electron.ipcRenderer.invoke('update-profile', currentProfileId, profile);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      // Handle password mismatch error
      return;
    }
    try {
      await window.electron.ipcRenderer.invoke('change-password', passwordData);
      // Clear password fields after successful change
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };

  // Handle data export
  const handleExportData = async () => {
    try {
      await window.electron.ipcRenderer.invoke('export-data');
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  // Handle data reset
  const handleResetData = async () => {
    try {
      await window.electron.ipcRenderer.invoke('reset-all-data');
      setShowConfirmDialog(false);
      // Optionally refresh the page or show success message
      window.location.reload();
    } catch (error) {
      console.error('Failed to reset data:', error);
    }
  };

  // Handle theme change
  const handleThemeChange = async (newTheme: ThemeType) => {
    try {
      const currentProfileId = await window.electron.ipcRenderer.invoke('get-current-profile');
      if (currentProfileId) {
        await window.electron.ipcRenderer.invoke('set-theme', currentProfileId, newTheme);
        setTheme(newTheme);

        // Apply theme to document
        document.documentElement.classList.remove('light', 'dark');
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (newTheme === 'light') {
          document.documentElement.classList.add('light');
        } else {
          // For system theme, check prefers-color-scheme
          if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.add('light');
          }
        }
      }
    } catch (error) {
      console.error('Failed to set theme:', error);
    }
  };

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
        <div className="p-2 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
          {icon}
        </div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h2>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow divide-y divide-gray-100 dark:divide-gray-700">
        {children}
      </div>
    </div>
  );

  // Confirmation Dialog Component
  const ConfirmDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Reset All Data
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Are you sure you want to reset all data? This action cannot be undone and will permanently delete all your tasks, profiles, and settings.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowConfirmDialog(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleResetData}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 rounded-md"
          >
            Reset All Data
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-w-0 h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        title="Settings"
        icon={<SettingsIcon className="h-5 w-5 text-primary dark:text-blue-400" />}
        showDateTime={false}
        description="Customize your Sikap experience"
      />
      
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-auto p-6 custom-scrollbar">
        <div className="container mx-auto max-w-3xl">
          {/* Profile Section */}
          <SettingsSection title="Profile" icon={<User className="w-5 h-5" />}>
            <div className="p-4 space-y-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                    {profile.picture ? (
                      <img 
                        src={profile.picture} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-1.5 bg-blue-600 dark:bg-blue-500 rounded-full text-white hover:bg-blue-700 dark:hover:bg-blue-600"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePictureChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>

              {/* Password Change Fields */}
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Change Password</h3>
                
                {/* Current Password */}
                <div className="relative">
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="relative">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="relative">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Save Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleProfileUpdate}
                    className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium transition-colors"
                  >
                    Save Profile
                  </button>
                  <button
                    onClick={handlePasswordChange}
                    className="flex-1 px-4 py-2 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-md hover:bg-blue-100 dark:hover:bg-blue-800 text-sm font-medium transition-colors"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </SettingsSection>

          {/* Appearance Section */}
          <SettingsSection title="Appearance" icon={<Sun className="w-5 h-5" />}>
            <div className="p-4">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">Theme</p>
              <div className="grid grid-cols-3 gap-3">
                {(['light', 'dark', 'system'] as const).map((themeOption) => (
                  <button
                    key={themeOption}
                    type="button"
                    onClick={() => handleThemeChange(themeOption)}
                    className={`flex items-center justify-center px-3 py-2 border rounded-md text-sm ${
                      theme === themeOption
                        ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900 dark:border-blue-800 dark:text-blue-200'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
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
          </SettingsSection>

          {/* Data Export Section */}
          <SettingsSection title="Data" icon={<Save className="w-5 h-5" />}>
            <div className="p-4 space-y-4">
              <div>
                <button
                  onClick={handleExportData}
                  className="w-full px-4 py-2 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-md hover:bg-blue-100 dark:hover:bg-blue-800 text-sm font-medium transition-colors"
                >
                  Export Data
                </button>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Export all your tasks and profile data
                </p>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowConfirmDialog(true)}
                  className="w-full px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Reset All Data
                </button>
                <p className="mt-2 text-xs text-red-500 dark:text-red-400">
                  Warning: This will permanently delete all your data
                </p>
              </div>
            </div>
          </SettingsSection>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && <ConfirmDialog />}
    </div>
  );
};

export default Settings;