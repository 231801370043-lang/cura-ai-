'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Calendar, Check, User, Clock, Trash2, Video, MessageCircle, Phone, PhoneOff } from 'lucide-react';

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

interface NotificationDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (notificationId: string) => void;
  onAction?: (action: 'accept' | 'decline' | 'reply', notificationId: string) => void;
}

export default function NotificationDropdown({ 
  notifications, 
  unreadCount, 
  onMarkAsRead, 
  onMarkAllAsRead, 
  onDelete,
  onAction 
}: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'video_call':
        return <Video className="w-5 h-5 text-blue-500" />;
      case 'message':
        return <MessageCircle className="w-5 h-5 text-purple-500" />;
      case 'meeting_request':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'meeting_accepted':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'meeting_declined':
        return <X className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-gray-200 dark:border-slate-600 hover:shadow-xl transition-all"
      >
        <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
          >
            <span className="text-xs font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </motion.div>
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-600 z-50 max-h-96 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-slate-600">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-slate-400 font-medium">
                    No notifications yet
                  </p>
                  <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
                    We&apos;ll notify you when something important happens
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all ${
                      !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`text-sm font-medium ${
                              !notification.read 
                                ? 'text-gray-900 dark:text-white' 
                                : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              Don&apos;t miss important updates
                            </p>
                            {notification.type === 'message' && notification.message_content && (
                              <div className="bg-gray-100 dark:bg-slate-700 rounded-lg p-2 mt-2">
                                <p className="text-xs text-gray-700 dark:text-gray-300 italic">
                                  &quot;{notification.message_content}&quot;
                                </p>
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                              {notification.from_user && (
                                <div className="flex items-center space-x-1">
                                  <User className="w-3 h-3" />
                                  &quot;Cura AI&quot; is here to help! Ask me anything about your condition.
                                </div>
                              )}
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{formatTime(notification.timestamp)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.read && (
                              <button
                                onClick={() => onMarkAsRead(notification.id)}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded"
                                title="Mark as read"
                              >
                                <Check className="w-4 h-4 text-green-500" />
                              </button>
                            )}
                            <button
                              onClick={() => onDelete(notification.id)}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>

                        {/* Action buttons for video calls */}
                        {notification.type === 'video_call' && onAction && (
                          <div className="flex space-x-2 mt-3">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => onAction('accept', notification.id)}
                              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg font-medium transition-all flex items-center space-x-1"
                            >
                              <Phone className="w-3 h-3" />
                              <span>Accept</span>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => onAction('decline', notification.id)}
                              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg font-medium transition-all flex items-center space-x-1"
                            >
                              <PhoneOff className="w-3 h-3" />
                              <span>Decline</span>
                            </motion.button>
                          </div>
                        )}

                        {/* Action buttons for messages */}
                        {notification.type === 'message' && onAction && (
                          <div className="flex space-x-2 mt-3">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => onAction('reply', notification.id)}
                              className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded-lg font-medium transition-all flex items-center space-x-1"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>Reply</span>
                            </motion.button>
                          </div>
                        )}

                        {/* Action buttons for meeting requests */}
                        {(notification.message.includes('meeting request') || notification.title.includes('Meeting Request')) && onAction && (
                          <div className="flex space-x-2 mt-3">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => onAction('accept', notification.id)}
                              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg font-medium transition-all"
                            >
                              Accept
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => onAction('decline', notification.id)}
                              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg font-medium transition-all"
                            >
                              Decline
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
