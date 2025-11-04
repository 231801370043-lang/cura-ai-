'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationsAPI } from '@/lib/api';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'video_call' | 'message';
  title: string;
  message: string;
  timestamp: string;
  from_user?: string;
  meeting_id?: string;
  sender_id?: string;
  call_room?: string;
  message_content?: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  activeBanner: Notification | null;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  dismissBanner: () => void;
  onCallAccepted?: (roomName: string) => void;
  fetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeBanner, setActiveBanner] = useState<Notification | null>(null);
  const [onCallAccepted, setOnCallAccepted] = useState<((roomName: string) => void) | undefined>();

  const unreadCount = notifications.filter(n => !n.read).length;

  // Fetch notifications from backend
  const fetchNotifications = useCallback(async () => {
    try {
      // Check if user is authenticated by checking for token
      const token = localStorage.getItem('token');
      if (!token) {
        // User not authenticated, don't fetch notifications
        setNotifications([]);
        return;
      }
      
      console.log('Fetching notifications with token:', token ? 'Present' : 'Missing');
      const response = await notificationsAPI.getAll();
      const notifications = response.data || [];
      
      console.log('Notifications fetched successfully:', notifications.length);
      
      // Debug: Check if notifications have proper IDs
      notifications.forEach((notif: any, index: number) => {
        if (!notif.id || notif.id === 'undefined') {
          console.warn(`Notification at index ${index} has invalid ID:`, notif);
        }
      });
      
      setNotifications(notifications);
    } catch (error: any) {
      // If 401 error, user is not authenticated
      if (error.response?.status === 401) {
        console.log('401 Unauthorized - clearing notifications and tokens');
        setNotifications([]);
        // Clear invalid tokens
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Show user-friendly message
        if (typeof window !== 'undefined') {
          alert('Your session has expired. Please log in again.');
          window.location.href = '/login';
        }
        return;
      }
      console.error('Failed to fetch notifications:', error);
    }
  }, []);

  // Add new notification (for real-time updates)
  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    
    // Handle special "Call Accepted" notifications - auto-open video modal
    if (notification.title === 'Call Accepted' && notification.type === 'video_call' && notification.call_room) {
      // Trigger video modal opening with room name
      if (onCallAccepted) {
        onCallAccepted(notification.call_room);
      }
      // Mark as read immediately since it's auto-handled
      markAsRead(notification.id);
      return;
    }
    
    // Show banner for important notifications
    if (notification.message.includes('meeting request') || 
        notification.message.includes('Meeting Request') ||
        notification.type === 'video_call' ||
        notification.type === 'message') {
      setActiveBanner(notification);
      
      // Auto-dismiss banner after 10 seconds
      setTimeout(() => {
        setActiveBanner(null);
      }, 10000);
    }
  }, [onCallAccepted]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!notificationId || notificationId === 'undefined') {
      console.error('Cannot mark notification as read: invalid ID', notificationId);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      await notificationsAPI.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error('Failed to mark notification as read:', error);
      }
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error('Failed to mark all notifications as read:', error);
      }
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!notificationId || notificationId === 'undefined') {
      console.error('Cannot delete notification: invalid ID', notificationId);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      await notificationsAPI.delete(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error('Failed to delete notification:', error);
      }
    }
  }, []);

  // Dismiss banner
  const dismissBanner = useCallback(() => {
    setActiveBanner(null);
  }, []);

  // Real-time polling for notifications
  useEffect(() => {
    // Only start polling if user has a token
    const token = localStorage.getItem('token');
    if (!token) {
      setNotifications([]);
      return;
    }
    
    fetchNotifications();
    const interval = setInterval(() => {
      // Check token before each fetch
      const currentToken = localStorage.getItem('token');
      if (currentToken) {
        fetchNotifications();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Listen for real-time updates (WebSocket simulation with polling)
  useEffect(() => {
    let lastNotificationCount = notifications.length;
    
    const checkForNewNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return; // Skip if not authenticated
        
        const response = await notificationsAPI.getAll();
        const newNotifications = response.data || [];
        
        if (newNotifications.length > lastNotificationCount) {
          // New notifications arrived
          const latestNotifications = newNotifications.slice(0, newNotifications.length - lastNotificationCount);
          latestNotifications.forEach((notification: Notification) => {
            if (!notifications.find(n => n.id === notification.id)) {
              addNotification(notification);
            }
          });
        }
        
        lastNotificationCount = newNotifications.length;
      } catch (error: any) {
        if (error.response?.status !== 401) {
          console.error('Failed to check for new notifications:', error);
        }
      }
    };

    // Check for new notifications every 3 seconds for real-time feel
    const realtimeInterval = setInterval(checkForNewNotifications, 3000);
    
    return () => clearInterval(realtimeInterval);
  }, [notifications.length, addNotification]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    activeBanner,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    dismissBanner,
    onCallAccepted,
    fetchNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
