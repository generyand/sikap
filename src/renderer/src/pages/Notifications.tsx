import { useState } from 'react';
import { Bell, Check, Trash, Filter } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';

// Sample notification data structure
interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  actionUrl?: string;
}

// Sample data - in a real app, this would come from an API or store
const sampleNotifications: Notification[] = [
  {
    id: '1',
    title: 'Task assigned to you',
    message: 'Alex assigned you to "Finalize Q3 report"',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: false,
    type: 'info',
    actionUrl: '/tasks/123'
  },
  {
    id: '2',
    title: 'Meeting reminder',
    message: 'Team standup in 15 minutes',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    type: 'warning',
    actionUrl: '/calendar'
  },
  {
    id: '3',
    title: 'Task completed',
    message: 'Your task "Update documentation" was marked as completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
    type: 'success'
  },
  {
    id: '4',
    title: 'New comment on your task',
    message: 'Sarah commented: "Looking good! Just one small suggestion..."',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    read: true,
    type: 'info',
    actionUrl: '/tasks/456'
  },
];

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };
  
  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  const formatTimestamp = (timestamp: Date) => {
    if (isToday(timestamp)) {
      return `Today, ${format(timestamp, 'h:mm a')}`;
    } else if (isYesterday(timestamp)) {
      return `Yesterday, ${format(timestamp, 'h:mm a')}`;
    } else {
      return format(timestamp, 'MMM d, yyyy h:mm a');
    }
  };
  
  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <div className="bg-green-100 text-green-600 p-2 rounded-full"><Check className="w-5 h-5" /></div>;
      case 'warning': return <div className="bg-yellow-100 text-yellow-600 p-2 rounded-full"><Bell className="w-5 h-5" /></div>;
      case 'error': return <div className="bg-red-100 text-red-600 p-2 rounded-full"><Bell className="w-5 h-5" /></div>;
      default: return <div className="bg-blue-100 text-blue-600 p-2 rounded-full"><Bell className="w-5 h-5" /></div>;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-gray-600">
            {unreadCount > 0 
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` 
              : 'You\'re all caught up!'}
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button 
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className={`px-4 py-2 rounded-md text-sm ${
              unreadCount === 0 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
          >
            Mark all as read
          </button>
          
          <div className="relative">
            <button className="px-4 py-2 rounded-md text-sm flex items-center gap-2 bg-gray-100 hover:bg-gray-200">
              <Filter className="w-4 h-4" />
              {filter === 'all' ? 'All' : filter === 'unread' ? 'Unread' : 'Read'}
            </button>
            <div className="absolute right-0 mt-1 bg-white rounded-md shadow-lg z-10 border border-gray-200 hidden group-hover:block">
              <div className="py-1">
                <button 
                  onClick={() => setFilter('all')} 
                  className={`block px-4 py-2 text-sm text-left w-full hover:bg-gray-100 ${filter === 'all' ? 'bg-gray-50' : ''}`}
                >
                  All
                </button>
                <button 
                  onClick={() => setFilter('unread')} 
                  className={`block px-4 py-2 text-sm text-left w-full hover:bg-gray-100 ${filter === 'unread' ? 'bg-gray-50' : ''}`}
                >
                  Unread
                </button>
                <button 
                  onClick={() => setFilter('read')} 
                  className={`block px-4 py-2 text-sm text-left w-full hover:bg-gray-100 ${filter === 'read' ? 'bg-gray-50' : ''}`}
                >
                  Read
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Notifications list */}
      <div className="bg-white rounded-lg shadow">
        {filteredNotifications.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {filteredNotifications.map(notification => (
              <li 
                key={notification.id} 
                className={`p-4 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {getTypeIcon(notification.type)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <h3 className={`text-sm font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                        {notification.title}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                      {notification.message}
                    </p>
                    
                    {notification.actionUrl && (
                      <a 
                        href={notification.actionUrl} 
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800 inline-block"
                      >
                        View details
                      </a>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex-shrink-0 flex space-x-2">
                    {!notification.read && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="text-gray-400 hover:text-blue-600 p-1"
                        title="Mark as read"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(notification.id)}
                      className="text-gray-400 hover:text-red-600 p-1"
                      title="Delete notification"
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="bg-gray-100 p-4 rounded-full inline-block mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications</h3>
            <p className="text-gray-500 max-w-md">
              {filter !== 'all' 
                ? `You don't have any ${filter} notifications at the moment.` 
                : "You're all caught up! No notifications to display."}
            </p>
            {filter !== 'all' && (
              <button 
                onClick={() => setFilter('all')}
                className="mt-4 text-sm text-blue-600 hover:text-blue-800"
              >
                View all notifications
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;