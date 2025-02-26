import React from 'react'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message
}) => {
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm
                flex items-center justify-center z-50 
                animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div 
        className="absolute inset-0"
        onClick={onClose}
        role="button"
        tabIndex={-1}
        aria-label="Close dialog"
      />
      
      <div 
        className="w-full max-w-sm mx-4 relative
                  animate-in slide-in-from-bottom-4 duration-300"
      >
        <div className="bg-white rounded-2xl shadow-2xl 
                      border border-gray-100 overflow-hidden p-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-error-50 
                          flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-error-500" />
            </div>
            <div className="flex-1">
              <h3 
                id="dialog-title"
                className="text-lg font-semibold text-gray-900"
              >
                {title}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {message}
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center
                       px-4 py-2 text-sm font-medium text-gray-700 
                       bg-white border border-gray-300 rounded-lg
                       hover:bg-gray-50 
                       focus:outline-none focus:ring-2 focus:ring-primary-500/20
                       transition duration-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex items-center justify-center
                       px-4 py-2 text-sm font-medium text-white 
                       bg-error-600 rounded-lg
                       hover:bg-error-700 
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error-500
                       transition duration-200"
            >
              Remove Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 