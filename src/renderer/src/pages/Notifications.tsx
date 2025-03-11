import { useState } from 'react';
import { Bell, Check, Filter } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { Header } from '@/components/layout/Header';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Notifications = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('unread');
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return `Today, ${format(date, 'h:mm a')}`;
    } else if (isYesterday(date)) {
      return `Yesterday, ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, yyyy h:mm a');
    }
  };
  
  const getTypeIcon = (type: string) => {
    return <div className="bg-primary/10 text-primary p-2 rounded-full"><Bell className="w-5 h-5" /></div>;
  };

  const headerActions = (
    <div className="flex items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            {filter === 'all' ? 'All' : 'Unread'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setFilter('all')}>
            All
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setFilter('unread')}>
            Unread
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        title="Notifications"
        icon={<Bell className="h-5 w-5 text-primary" />}
        actions={headerActions}
        description={unreadCount > 0 
          ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` 
          : 'You\'re all caught up!'}
      />

      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-lg border shadow-sm">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="bg-muted p-4 rounded-full inline-block mb-4">
                  <Bell className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-1">No notifications</h3>
                <p className="text-muted-foreground max-w-md">
                  {filter === 'unread' 
                    ? "You don't have any unread notifications at the moment." 
                    : "You're all caught up! No notifications to display."}
                </p>
                {filter === 'unread' && (
                  <Button 
                    variant="link" 
                    onClick={() => setFilter('all')}
                    className="mt-4"
                  >
                    View all notifications
                  </Button>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {notifications.map((notification) => (
                  <li 
                    key={notification.id} 
                    className="p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {getTypeIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <h3 className="text-sm font-medium">
                            {notification.title}
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(notification.scheduledFor)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        
                        {notification.task && (
                          <Button 
                            variant="link" 
                            className="mt-2 h-auto p-0"
                            onClick={() => {
                              markAsRead(notification.id);
                              // Navigate to task - implement this based on your routing
                            }}
                          >
                            View task
                          </Button>
                        )}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;