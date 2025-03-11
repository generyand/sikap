import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  taskId: string;
  profileId: string;
  scheduledFor: string;
  task?: {
    id: string;
    title: string;
  };
}

export function useNotifications() {
  const queryClient = useQueryClient();

  const { data: notifications = [], refetch } = useQuery<Notification[]>({
    queryKey: ['notifications', 'unread'],
    queryFn: () => window.electron.ipcRenderer.invoke('get-unread-notifications'),
    refetchInterval: 60000, // Refetch every minute
  });

  const markAsRead = useMutation({
    mutationFn: (notificationId: string) => 
      window.electron.ipcRenderer.invoke('mark-notification-read', notificationId),
    onSuccess: (_, notificationId) => {
      // Optimistically update the notifications list
      queryClient.setQueryData<Notification[]>(['notifications', 'unread'], 
        (old) => old?.filter(n => n.id !== notificationId) ?? []
      );
    }
  });

  return {
    notifications,
    unreadCount: notifications.length,
    markAsRead: markAsRead.mutate,
    refetchNotifications: refetch
  };
} 