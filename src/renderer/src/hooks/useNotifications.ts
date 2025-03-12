import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useProfile } from '@/providers/ProfileProvider';

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
  const { profileId } = useProfile();

  const { data: notifications = [], refetch } = useQuery<Notification[]>({
    queryKey: ['notifications', profileId],
    queryFn: () => window.electron.ipcRenderer.invoke('get-all-notifications', profileId),
    refetchInterval: 60000, // Refetch every minute
    enabled: !!profileId // Only fetch if we have a profileId
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useMutation({
    mutationFn: (notificationId: string) => 
      window.electron.ipcRenderer.invoke('mark-notification-read', notificationId),
    onSuccess: (_, notificationId) => {
      // Optimistically update the notifications list
      queryClient.setQueryData<Notification[]>(['notifications', profileId], 
        (old) => old?.map(n => n.id === notificationId ? { ...n, read: true } : n) ?? []
      );
    }
  });

  return {
    notifications,
    unreadCount,
    markAsRead: markAsRead.mutate,
    refetchNotifications: refetch
  };
} 