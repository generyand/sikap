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
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header'
import { profileAPI } from '../../../preload/api/profile.api'

type ThemeType = 'light' | 'dark' | 'system';

// Profile Details Component
const ProfileDetails = ({
  profile,
  isUpdatingProfile,
  isUploadingPicture,
  onProfileUpdate,
  onPictureChange,
}: {
  profile: { name: string; avatar: string };
  isUpdatingProfile: boolean;
  isUploadingPicture: boolean;
  onProfileUpdate: (name: string) => void;
  onPictureChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(profile.name);

  useEffect(() => {
    setName(profile.name);
  }, [profile.name]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProfileUpdate(name);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Profile Picture */}
      <div className="flex flex-col items-center">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 ring-4 ring-white dark:ring-gray-800 shadow-lg">
            {isUploadingPicture ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : profile.avatar ? (
              <img 
                key={profile.avatar}
                src={profile.avatar} 
                alt="Profile" 
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                onError={(e) => {
                  console.error('Failed to load image:', profile.avatar);
                  e.currentTarget.onerror = null; // Prevent infinite loop
                  e.currentTarget.src = ''; // Clear the source
                  // Show fallback user icon
                  e.currentTarget.parentElement?.classList.add('fallback-active');
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-16 h-16 text-gray-400 dark:text-gray-500" />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingPicture}
            className="absolute bottom-0 right-0 p-2 bg-blue-600 dark:bg-blue-500 rounded-full text-white hover:bg-blue-700 dark:hover:bg-blue-600 shadow-lg transform transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onPictureChange}
            className="hidden"
          />
        </div>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Click the camera icon to update your profile picture
        </p>
      </div>

      {/* Name Field */}
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
          Display Name
        </label>
        <div className="relative">
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
            placeholder="Enter your display name"
          />
        </div>
        <button
          type="submit"
          disabled={isUpdatingProfile || !name.trim() || name === profile.name}
          className="mt-4 w-full flex items-center justify-center px-4 py-2.5 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdatingProfile ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Profile'
          )}
        </button>
      </div>
    </form>
  );
};

// Password Management Component
const PasswordManagement = ({
  isChangingPassword,
  onPasswordChange,
  passwordErrors,
}: {
  isChangingPassword: boolean;
  onPasswordChange: (currentPassword: string, newPassword: string, confirmPassword: string) => void;
  passwordErrors: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
}) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Manage password data internally
  const [localPasswordData, setLocalPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Refs for input elements
  const currentPasswordRef = useRef<HTMLInputElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPasswordChange(
      localPasswordData.currentPassword,
      localPasswordData.newPassword,
      localPasswordData.confirmPassword
    );
  };

  // Update input with focus preservation
  const updatePasswordData = (field: keyof typeof localPasswordData, value: string) => {
    setLocalPasswordData(prev => ({ ...prev, [field]: value }));
  };

  // Reset form after successful password change
  useEffect(() => {
    if (!isChangingPassword) {
      setLocalPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [isChangingPassword]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Change Password</h3>
      </div>
      
      {/* Current Password */}
      <div className="space-y-2">
        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Current Password
        </label>
        <div className="relative">
          <input
            ref={currentPasswordRef}
            id="currentPassword"
            type={showCurrentPassword ? "text" : "password"}
            value={localPasswordData.currentPassword}
            onChange={(e) => updatePasswordData('currentPassword', e.target.value)}
            className={`block w-full rounded-lg border ${
              passwordErrors.currentPassword 
                ? 'border-red-300 dark:border-red-500 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
            } bg-white dark:bg-gray-700 shadow-sm px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 dark:focus:ring-offset-gray-900 transition-colors pr-10`}
            placeholder="Enter your current password"
          />
          <button
            type="button"
            onClick={() => {
              setShowCurrentPassword(!showCurrentPassword);
              currentPasswordRef.current?.focus();
            }}
            className="absolute inset-y-0 right-0 px-3 flex items-center"
          >
            {showCurrentPassword ? (
              <EyeOff className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            ) : (
              <Eye className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            )}
          </button>
        </div>
        {passwordErrors.currentPassword && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{passwordErrors.currentPassword}</p>
        )}
      </div>

      {/* New Password */}
      <div className="space-y-2">
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          New Password
        </label>
        <div className="relative">
          <input
            ref={newPasswordRef}
            id="newPassword"
            type={showNewPassword ? "text" : "password"}
            value={localPasswordData.newPassword}
            onChange={(e) => updatePasswordData('newPassword', e.target.value)}
            className={`block w-full rounded-lg border ${
              passwordErrors.newPassword 
                ? 'border-red-300 dark:border-red-500 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
            } bg-white dark:bg-gray-700 shadow-sm px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 dark:focus:ring-offset-gray-900 transition-colors pr-10`}
            placeholder="Enter your new password"
          />
          <button
            type="button"
            onClick={() => {
              setShowNewPassword(!showNewPassword);
              newPasswordRef.current?.focus();
            }}
            className="absolute inset-y-0 right-0 px-3 flex items-center"
          >
            {showNewPassword ? (
              <EyeOff className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            ) : (
              <Eye className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            )}
          </button>
        </div>
        {passwordErrors.newPassword && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{passwordErrors.newPassword}</p>
        )}
      </div>

      {/* Confirm New Password */}
      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Confirm New Password
        </label>
        <div className="relative">
          <input
            ref={confirmPasswordRef}
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={localPasswordData.confirmPassword}
            onChange={(e) => updatePasswordData('confirmPassword', e.target.value)}
            className={`block w-full rounded-lg border ${
              passwordErrors.confirmPassword 
                ? 'border-red-300 dark:border-red-500 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
            } bg-white dark:bg-gray-700 shadow-sm px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 dark:focus:ring-offset-gray-900 transition-colors pr-10`}
            placeholder="Confirm your new password"
          />
          <button
            type="button"
            onClick={() => {
              setShowConfirmPassword(!showConfirmPassword);
              confirmPasswordRef.current?.focus();
            }}
            className="absolute inset-y-0 right-0 px-3 flex items-center"
          >
            {showConfirmPassword ? (
              <EyeOff className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            ) : (
              <Eye className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            )}
          </button>
        </div>
        {passwordErrors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{passwordErrors.confirmPassword}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isChangingPassword || !localPasswordData.currentPassword || !localPasswordData.newPassword || !localPasswordData.confirmPassword}
        className="w-full flex items-center justify-center px-4 py-2.5 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isChangingPassword ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Changing Password...
          </>
        ) : (
          'Change Password'
        )}
      </button>
    </form>
  );
};

const Settings = () => {
  // Profile settings
  const [profile, setProfile] = useState({
    name: '',
    avatar: '',
  });

  // Loading states
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);

  // Error states
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Theme settings
  const [theme, setTheme] = useState<ThemeType>('system');

  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Load profile and theme data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const currentProfileId = await window.electron.ipcRenderer.invoke('get-current-profile');
        console.log('Current profile ID:', currentProfileId);
        
        if (currentProfileId) {
          const profileData = await window.electron.ipcRenderer.invoke('get-profile', currentProfileId);
          console.log('Profile data received:', profileData);
          
          const currentTheme = await window.electron.ipcRenderer.invoke('get-theme', currentProfileId);
          if (profileData) {
            const avatarUrl = profileData.avatar ? 
              (profileData.avatar.startsWith('file://') ? 
                profileData.avatar : 
                `file://${profileData.avatar.replace(/\\/g, '/')}`) : 
              '';
            console.log('Setting avatar URL:', avatarUrl);
            
            setProfile({
              name: profileData.name || '',
              avatar: avatarUrl ? `${avatarUrl}?t=${Date.now()}` : '',
            });
            setTheme(currentTheme || 'system');
            
            // Apply theme to document
            document.documentElement.classList.remove('light', 'dark');
            if (currentTheme === 'dark') {
              document.documentElement.classList.add('dark');
            } else if (currentTheme === 'light') {
              document.documentElement.classList.add('light');
            } else {
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
        toast.error('Failed to load profile');
      }
    };

    loadProfile();
  }, []);

  // Handle profile picture change
  const handlePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setIsUploadingPicture(true);
        
        // Read file as data URL
        const reader = new FileReader();
        const pictureData = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });
        
        // Upload the data URL
        const uploadedPath = await window.electron.ipcRenderer.invoke('upload-profile-picture', pictureData);
        // Convert local path to file:// URL if it's not already a file:// URL
        const avatarUrl = uploadedPath.startsWith('file://') ? uploadedPath : `file://${uploadedPath.replace(/\\/g, '/')}`;
        // Add cache-busting parameter
        const avatarUrlWithTimestamp = `${avatarUrl}?t=${Date.now()}`;
        setProfile(prev => ({ ...prev, avatar: avatarUrlWithTimestamp }));
        toast.success('Profile picture updated successfully');
      } catch (error) {
        toast.error('Failed to upload profile picture');
        console.error('Failed to upload profile picture:', error);
      } finally {
        setIsUploadingPicture(false);
      }
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (name: string) => {
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    try {
      setIsUpdatingProfile(true);
      const currentProfileId = await window.electron.ipcRenderer.invoke('get-current-profile');
      if (currentProfileId) {
        await window.electron.ipcRenderer.invoke('update-profile', currentProfileId, { name });
        setProfile(prev => ({ ...prev, name }));
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Failed to update profile:', error);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Validate password
  const validatePassword = (currentPassword: string, newPassword: string, confirmPassword: string) => {
    const errors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };

    if (!currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!newPassword) {
      errors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  // Handle password change
  const handlePasswordChange = async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    if (!validatePassword(currentPassword, newPassword, confirmPassword)) {
      return;
    }

    try {
      setIsChangingPassword(true);
      const toastId = toast.loading('Changing password...', {
        duration: Infinity, // Keep showing until we dismiss
      });
      
      const currentProfileId = await window.electron.ipcRenderer.invoke('get-current-profile');
      if (!currentProfileId) {
        toast.dismiss(toastId);
        toast.error('Failed to change password', {
          description: 'Could not find current profile.',
          duration: 4000,
        });
        return;
      }

      await profileAPI.changePassword({
        profileId: currentProfileId,
        currentPassword,
        newPassword,
      });
      
      toast.dismiss(toastId);
      toast.success('Password changed successfully', {
        description: 'Your new password has been set.',
        duration: 3000,
      });
      
      // Reset form after successful password change
      setIsChangingPassword(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Failed to change password:', errorMessage);
      
      // Make sure to dismiss any existing toasts before showing error
      toast.dismiss();
      
      if (errorMessage.includes('Current password is incorrect')) {
        toast.error('Failed to change password', {
          description: 'Your current password is incorrect. Please try again.',
          duration: 4000,
        });
        setPasswordErrors(prev => ({
          ...prev,
          currentPassword: 'Current password is incorrect',
        }));
      } else {
        toast.error('Failed to change password', {
          description: errorMessage || 'An unexpected error occurred. Please try again later.',
          duration: 4000,
        });
      }
    } finally {
      setIsChangingPassword(false);
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
      const currentProfileId = await window.electron.ipcRenderer.invoke('get-current-profile');
      if (!currentProfileId) {
        toast.error('No active profile found');
        return;
      }

      await window.electron.ipcRenderer.invoke('reset-profile-tasks', currentProfileId);
      setShowConfirmDialog(false);
      toast.success('Tasks have been reset successfully');
      // Optionally refresh the page or update the UI
      window.location.reload();
    } catch (error) {
      console.error('Failed to reset tasks:', error);
      toast.error('Failed to reset tasks');
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
          Reset Tasks
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Are you sure you want to reset all your tasks? This action cannot be undone and will permanently delete all your tasks. Your profile and settings will remain unchanged.
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
            Reset Tasks
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
            <div className="p-6 space-y-8">
              <ProfileDetails
                profile={profile}
                isUpdatingProfile={isUpdatingProfile}
                isUploadingPicture={isUploadingPicture}
                onProfileUpdate={handleProfileUpdate}
                onPictureChange={handlePictureChange}
              />
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <PasswordManagement
                  isChangingPassword={isChangingPassword}
                  onPasswordChange={handlePasswordChange}
                  passwordErrors={passwordErrors}
                />
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
                  Reset Tasks
                </button>
                <p className="mt-2 text-xs text-red-500 dark:text-red-400">
                  Warning: This will permanently delete all your tasks
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