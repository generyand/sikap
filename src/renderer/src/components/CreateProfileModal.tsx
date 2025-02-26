import React, { useState } from 'react'
import { X, Upload, Loader2 } from 'lucide-react'

interface CreateProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const CreateProfileModal: React.FC<CreateProfileModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await window.electron.ipcRenderer.invoke('create-profile', {
        name,
        avatar,
        theme: 'light' // default theme
      })
      setName('')
      setAvatar('')
      onSuccess()
      onClose()
    } catch (error) {
      setError('Failed to create profile. Please try again.')
      console.error('Create profile error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-950/50 backdrop-blur-sm 
                    flex items-center justify-center z-50 
                    animate-in fade-in duration-200">
      <div className="w-full max-w-lg mx-4 
                      animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-white rounded-[var(--radius-lg)] shadow-xl 
                      border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Create New Profile</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 
                       transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Name Input */}
            <div className="space-y-2">
              <label 
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Profile Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter profile name"
                className="w-full px-4 py-2 rounded-[var(--radius-md)]
                         border border-gray-300
                         focus:outline-none focus:ring-2 focus:ring-primary-500/20 
                         focus:border-primary-500
                         placeholder:text-gray-400"
                required
              />
            </div>

            {/* Avatar Input */}
            <div className="space-y-2">
              <label 
                htmlFor="avatar"
                className="block text-sm font-medium text-gray-700"
              >
                Avatar URL (Optional)
              </label>
              <input
                type="url"
                id="avatar"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="Enter avatar URL"
                className="w-full px-4 py-2 rounded-[var(--radius-md)]
                         border border-gray-300
                         focus:outline-none focus:ring-2 focus:ring-primary-500/20 
                         focus:border-primary-500
                         placeholder:text-gray-400"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-error-500 text-sm rounded-[var(--radius-md)] 
                            bg-error-500/10 p-3">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 
                         bg-white border border-gray-300 rounded-[var(--radius-md)]
                         hover:bg-gray-50 
                         focus:outline-none focus:ring-2 focus:ring-primary-500/20
                         transition duration-200 ease-[var(--ease-productive)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !name.trim()}
                className="px-4 py-2 text-sm font-medium text-white 
                         bg-primary-600 rounded-[var(--radius-md)]
                         hover:bg-primary-700 
                         focus:outline-none focus:ring-2 focus:ring-primary-500/20
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition duration-200 ease-[var(--ease-productive)]
                         flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Create Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 