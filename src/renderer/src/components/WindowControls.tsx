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
    <div className="flex items-center gap-1.5">
      <button
        onClick={handleMinimize}
        className="h-6 w-6 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <svg width="10" height="1" viewBox="0 0 10 1">
          <rect width="10" height="1" fill="currentColor" />
        </svg>
      </button>
      <button
        onClick={handleMaximize}
        className="h-6 w-6 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <svg width="10" height="10" viewBox="0 0 10 10">
          <rect width="10" height="10" fill="none" stroke="currentColor" />
        </svg>
      </button>
      <button
        onClick={handleClose}
        className="h-6 w-6 flex items-center justify-center rounded hover:bg-red-500 hover:text-white"
      >
        <svg width="10" height="10" viewBox="0 0 10 10">
          <path d="M1,1 L9,9 M1,9 L9,1" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      </button>
    </div>
  )
} 