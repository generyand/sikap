import { ipcMain } from 'electron';
import { NotificationService } from '../services/notification.service';

export function setupNotificationHandlers() {
  const notificationService = NotificationService.getInstance();

  // Start the notification checker when the app starts
  notificationService.startNotificationChecker();

  // Get all unread notifications
  ipcMain.handle('get-unread-notifications', async () => {
    try {
      const notifications = await notificationService.getUnreadNotifications();
      return notifications;
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      throw error;
    }
  });

  // Mark notification as read
  ipcMain.handle('mark-notification-read', async (_, notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  });
} 