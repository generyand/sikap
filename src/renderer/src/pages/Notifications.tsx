import { useState } from 'react';
import { Bell, Check, CheckCircle2, Filter } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { Header } from '@/components/layout/Header';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Notifications = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const navigate = useNavigate();
  
  const filteredNotifications = notifications.filter(notification => 
    filter === 'all' || !notification.read
  );

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
  
  const getTypeIcon = (_type: string) => {
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
            {filteredNotifications.length === 0 ? (
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
                {filter === 'unread' && notifications.length > 0 && (
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
                {filteredNotifications.map((notification) => (
                  <li 
                    key={notification.id} 
                    className={cn(
                      "p-4 transition-colors cursor-pointer",
                      notification.read 
                        ? "hover:bg-accent/50" 
                        : "bg-accent/30 hover:bg-accent/40"
                    )}
                    onClick={() => {
                      if (notification.task) {
                        markAsRead(notification.id);
                        navigate(`/tasks?taskId=${notification.task.id}`);
                      }
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {getTypeIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className={cn(
                            "text-sm",
                            notification.read ? "font-medium" : "font-semibold"
                          )}>
                            {notification.title}
                            {!notification.read && (
                              <span className="ml-2 inline-block px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded-full">
                                New
                              </span>
                            )}
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(notification.scheduledFor)}
                          </span>
                        </div>
                        <p className={cn(
                          "mt-1 text-sm",
                          notification.read ? "text-muted-foreground" : "text-foreground"
                        )}>
                          {notification.message}
                        </p>
                        
                        {notification.task && (
                          <Button 
                            variant="link" 
                            className="mt-2 h-auto p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                              navigate(`/tasks?taskId=${notification.task?.id}`);
                            }}
                          >
                            View task
                          </Button>
                        )}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "flex-shrink-0",
                          notification.read && "text-muted-foreground"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!notification.read) {
                            markAsRead(notification.id);
                          }
                        }}
                      >
                        {notification.read ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
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