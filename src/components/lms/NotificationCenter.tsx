'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Bell, 
  BellRing, 
  X, 
  Check,
  CheckCheck,
  Clock,
  BookOpen,
  MessageSquare,
  Award,
  DollarSign,
  AlertCircle,
  Calendar,
  Users,
  Mail,
  Settings,
  Filter,
  MoreVertical
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useUser } from '@clerk/nextjs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

// Types
interface Notification {
  id: string;
  type: 'COURSE_UPDATE' | 'ASSIGNMENT_DUE' | 'QUIZ_GRADED' | 'NEW_MESSAGE' | 'ENROLLMENT' | 'CERTIFICATE' | 'ANNOUNCEMENT' | 'REMINDER';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: {
    courseId?: string;
    courseName?: string;
    instructorName?: string;
    dueDate?: string;
    score?: number;
    [key: string]: any;
  };
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category: 'ACADEMIC' | 'SYSTEM' | 'SOCIAL' | 'ADMINISTRATIVE';
}

interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

interface NotificationCenterProps {
  trigger?: React.ReactNode;
  maxHeight?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  trigger,
  maxHeight = '400px'
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'academic' | 'system'>('all');
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();

  // Load notifications
  const loadNotifications = useCallback(async () => {
    try {
      if (!user) return;

      const [notificationsResponse, statsResponse] = await Promise.all([
        fetch('/api/lms/notifications'),
        fetch('/api/lms/notifications/stats')
      ]);

      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json();
        setNotifications(notificationsData.notifications);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }

    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/lms/notifications/${notificationId}/read`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to mark as read');

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );

      setStats(prev => prev ? {
        ...prev,
        unread: prev.unread - 1
      } : null);

    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/lms/notifications/mark-all-read', {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to mark all as read');

      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      );

      setStats(prev => prev ? {
        ...prev,
        unread: 0
      } : null);

      toast.success('All notifications marked as read');

    } catch (error) {
      toast.error('Failed to mark all notifications as read');
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/lms/notifications/${notificationId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete notification');

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      setStats(prev => prev ? {
        ...prev,
        total: prev.total - 1,
        unread: prev.unread - (notifications.find(n => n.id === notificationId)?.isRead ? 0 : 1)
      } : null);

      toast.success('Notification deleted');

    } catch (error) {
      toast.error('Failed to delete notification');
    }
  }, [notifications]);

  // Get notification icon
  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = `h-5 w-5 ${
      priority === 'URGENT' ? 'text-red-600' :
      priority === 'HIGH' ? 'text-orange-600' :
      priority === 'MEDIUM' ? 'text-blue-600' : 'text-gray-600'
    }`;

    switch (type) {
      case 'COURSE_UPDATE': return <BookOpen className={iconClass} />;
      case 'ASSIGNMENT_DUE': return <Clock className={iconClass} />;
      case 'QUIZ_GRADED': return <Award className={iconClass} />;
      case 'NEW_MESSAGE': return <MessageSquare className={iconClass} />;
      case 'ENROLLMENT': return <Users className={iconClass} />;
      case 'CERTIFICATE': return <Award className={iconClass} />;
      case 'ANNOUNCEMENT': return <Bell className={iconClass} />;
      case 'REMINDER': return <AlertCircle className={iconClass} />;
      default: return <Bell className={iconClass} />;
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    switch (activeTab) {
      case 'unread': return !notification.isRead;
      case 'academic': return notification.category === 'ACADEMIC';
      case 'system': return notification.category === 'SYSTEM';
      default: return true;
    }
  });

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank');
    }
  };

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="relative">
      <Bell className="h-5 w-5" />
      {stats && stats.unread > 0 && (
        <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-600">
          {stats.unread > 99 ? '99+' : stats.unread}
        </Badge>
      )}
    </Button>
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {trigger || defaultTrigger}
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BellRing className="h-5 w-5 text-gray-700" />
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {stats && stats.unread > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {stats.unread} new
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {stats && stats.unread > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Mark all read
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Notification Settings</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Mail className="h-4 w-4 mr-2" />
                    Email Preferences
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell className="h-4 w-4 mr-2" />
                    Push Notifications
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Filter className="h-4 w-4 mr-2" />
                    Filter Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full">
          <div className="border-b border-gray-200">
            <TabsList className="grid w-full grid-cols-4 h-auto p-0 bg-transparent">
              <TabsTrigger value="all" className="text-xs py-2">All</TabsTrigger>
              <TabsTrigger value="unread" className="text-xs py-2">
                Unread
                {stats && stats.unread > 0 && (
                  <span className="ml-1 bg-blue-600 text-white rounded-full px-1.5 py-0.5 text-xs">
                    {stats.unread}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="academic" className="text-xs py-2">Academic</TabsTrigger>
              <TabsTrigger value="system" className="text-xs py-2">System</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea style={{ height: maxHeight }}>
            <TabsContent value={activeTab} className="mt-0">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-600">Loading...</span>
                </div>
              ) : filteredNotifications.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type, notification.priority)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${
                                !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              {notification.metadata?.courseName && (
                                <p className="text-xs text-blue-600 mt-1">
                                  {notification.metadata.courseName}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 ml-2">
                              <span className="text-xs text-gray-500">
                                {formatTimeAgo(notification.createdAt)}
                              </span>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-6 w-6 p-0 hover:bg-gray-200"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {!notification.isRead && (
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notification.id);
                                    }}>
                                      <Check className="h-4 w-4 mr-2" />
                                      Mark as read
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteNotification(notification.id);
                                    }}
                                    className="text-red-600"
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          
                          {notification.metadata?.score && (
                            <div className="mt-2 flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                Score: {notification.metadata.score}%
                              </Badge>
                            </div>
                          )}
                          
                          {notification.metadata?.dueDate && (
                            <div className="mt-2 flex items-center space-x-1 text-xs text-orange-600">
                              <Calendar className="h-3 w-3" />
                              <span>Due: {new Date(notification.metadata.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-sm font-medium text-gray-900 mb-2">No notifications</h3>
                  <p className="text-sm text-gray-600">
                    {activeTab === 'unread' 
                      ? "You're all caught up!" 
                      : "We'll notify you when something important happens."
                    }
                  </p>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {stats && filteredNotifications.length > 0 && (
          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>{filteredNotifications.length} notifications</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-auto p-1"
                onClick={() => window.open('/notifications', '_blank')}
              >
                View all →
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;