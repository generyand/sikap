import React, { useState, useEffect, useRef } from 'react'
import { X, Upload, Loader2, Image as ImageIcon } from 'lucide-react'
import { useKeyboardTrap } from '../hooks/useKeyboardTrap'

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
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const modalRef = useRef<HTMLDivElement>(null)
  const initialFocusRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useKeyboardTrap(modalRef, isOpen)

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscapeKey)
    return () => document.removeEventListener('keydown', handleEscapeKey)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      initialFocusRef.current?.focus()
      const previousActiveElement = document.activeElement as HTMLElement
      return () => {
        previousActiveElement?.focus()
      }
    }
  }, [isOpen])

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB')
      return
    }

    try {
      // Clean up previous preview URL if it exists
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview)
      }

      // Read file as Data URL
      const reader = new FileReader()
      
      const previewPromise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result)
          } else {
            reject(new Error('Failed to read file'))
          }
        }
        reader.onerror = () => reject(reader.error)
      })

      reader.readAsDataURL(file)
      
      const dataUrl = await previewPromise

      setAvatarFile(file)
      setAvatarPreview(dataUrl)
      setError('')
    } catch (error) {
      console.error('Error loading image:', error)
      setError('Failed to load image. Please try another file.')
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview)
      }
      setAvatarFile(null)
      setAvatarPreview('')
    }
  }

  // Cleanup preview URL when component unmounts or modal closes
  useEffect(() => {
    if (!isOpen && avatarPreview) {
      URL.revokeObjectURL(avatarPreview)
      setAvatarPreview('')
      setAvatarFile(null)
    }
  }, [isOpen, avatarPreview])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await window.electron.ipcRenderer.invoke('create-profile', {
        name,
        avatar: avatarPreview, // Use the preview URL directly since it's already a Data URL
        theme: 'light' // default theme
      })
      
      setName('')
      setAvatarFile(null)
      setAvatarPreview('')
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
    <div 
      className="fixed inset-0 bg-gray-950/60 backdrop-blur-md
                flex items-center justify-center z-50 
                animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="absolute inset-0"
        onClick={onClose}
        role="button"
        tabIndex={-1}
        aria-label="Close modal"
      />
      
      <div 
        ref={modalRef}
        className="w-full max-w-md mx-4 relative
                  animate-in slide-in-from-bottom-4 duration-300"
      >
        <div className="bg-white rounded-2xl shadow-2xl 
                      border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-0">
            <div className="flex items-center justify-between mb-1">
              <h2 
                id="modal-title"
                className="text-2xl font-semibold text-gray-900"
              >
                Create Profile
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 
                         transition-colors duration-200
                         rounded-full p-2 hover:bg-gray-100"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-500 text-sm mb-6">
              Add your details to create a new profile
            </p>
          </div>

          {/* Form */}
          <form 
            onSubmit={handleSubmit} 
            className="px-8 pb-8"
            aria-label="Create profile form"
          >
            <div className="space-y-6">
              {/* Avatar Upload Section */}
              <div className="flex flex-col items-center justify-center pt-4 pb-6">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-32 h-32 rounded-full border-4 border-gray-100 
                                overflow-hidden flex items-center justify-center
                                bg-gray-50 shadow-inner
                                group-hover:border-primary-100 group-hover:bg-gray-100
                                transition-all duration-200">
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Profile preview" 
                        className="w-full h-full object-cover"
                        onError={() => {
                          setError('Failed to load image preview')
                          setAvatarPreview('')
                          setAvatarFile(null)
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-400
                                    group-hover:text-primary-500 transition-colors">
                        <ImageIcon className="w-8 h-8" />
                        <span className="text-xs font-medium">Add photo</span>
                      </div>
                    )}
                  </div>
                  
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 
                             bg-primary-600 rounded-full p-2.5
                             hover:bg-primary-700 
                             focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                             transition-all duration-200 ease-in-out
                             shadow-lg"
                    aria-label="Choose profile picture"
                  >
                    <Upload className="h-4 w-4 text-white" aria-hidden="true" />
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  id="avatar"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  aria-label="Choose profile picture"
                />
                
                {avatarFile ? (
                  <p className="mt-4 text-sm text-gray-500 flex items-center gap-2">
                    <span className="font-medium text-gray-900 max-w-[200px] truncate" title={avatarFile.name}>
                      {avatarFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAvatarFile(null);
                        setAvatarPreview('');
                      }}
                      className="text-gray-400 hover:text-error-500 transition-colors"
                      aria-label="Remove selected image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </p>
                ) : (
                  <p className="mt-4 text-sm text-gray-500">
                    Click to upload your profile picture
                  </p>
                )}
              </div>

              {/* Name Input */}
              <div className="space-y-2">
                <label 
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Profile Name
                </label>
                <input
                  ref={initialFocusRef}
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2.5 rounded-xl
                           border border-gray-300
                           focus:outline-none focus:ring-2 focus:ring-primary-500/20 
                           focus:border-primary-500
                           placeholder:text-gray-400
                           transition-all duration-200"
                  required
                  aria-required="true"
                  aria-invalid={error ? 'true' : 'false'}
                  aria-describedby={error ? 'error-message' : undefined}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div 
                  id="error-message"
                  role="alert"
                  className="text-error-500 text-sm rounded-xl
                            bg-error-50 border border-error-100
                            p-4 flex items-start gap-3"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="h-5 w-5 text-error-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" />
                    </svg>
                  </div>
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 
                           bg-white border border-gray-300 rounded-xl
                           hover:bg-gray-50 
                           focus:outline-none focus:ring-2 focus:ring-primary-500/20
                           transition duration-200 ease-[var(--ease-productive)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !name.trim()}
                  className="px-5 py-2.5 text-sm font-medium text-white 
                           bg-primary-600 rounded-xl
                           hover:bg-primary-700 
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                           disabled:opacity-50 disabled:cursor-not-allowed
                           shadow-sm
                           transition duration-200 ease-[var(--ease-productive)]
                           flex items-center gap-2"
                  aria-busy={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Creating...
                    </>
                  ) : (
                    'Create Profile'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 