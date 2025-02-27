import React from 'react'

export const WindowControls: React.FC = () => {
  const handleMinimize = async () => {
    try {
      await window.api.minimizeWindow()
    } catch (error) {
      console.error('Failed to minimize window:', error)
    }
  }

  const handleMaximize = async () => {
    try {
      await window.api.maximizeWindow()
    } catch (error) {
      console.error('Failed to maximize window:', error)
    }
  }

  const handleClose = async () => {
    try {
      await window.api.closeWindow()
    } catch (error) {
      console.error('Failed to close window:', error)
    }
  }

  return (
    <div className="window-controls flex gap-2">
      <button
        onClick={handleMinimize}
        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        type="button"
      >
        <svg width="12" height="12" viewBox="0 0 12 12">
          <rect width="10" height="1" x="1" y="5.5" fill="currentColor" />
        </svg>
      </button>
      <button
        onClick={handleMaximize}
        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        type="button"
      >
        <svg width="12" height="12" viewBox="0 0 12 12">
          <rect width="9" height="9" x="1.5" y="1.5" fill="none" stroke="currentColor" />
        </svg>
      </button>
      <button
        onClick={handleClose}
        className="p-2 hover:bg-red-500 hover:text-white rounded"
        type="button"
      >
        <svg width="12" height="12" viewBox="0 0 12 12">
          <path
            d="M 1,1 L 11,11 M 1,11 L 11,1"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      </button>
    </div>
  )
} 