'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Check, Calendar, User, Clock, Video, MessageCircle, Phone, PhoneOff } from 'lucide-react';

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

interface NotificationBannerProps {
  notification: Notification;
  onClose: () => void;
  onAction?: (action: 'accept' | 'decline' | 'reply', notificationId: string) => void;
}

export default function NotificationBanner({ notification, onClose, onAction }: NotificationBannerProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300);
  };

  const isMeetingRequest = notification.message.includes('meeting request') || notification.title.includes('Meeting Request');
  const isMeetingAccepted = notification.message.includes('accepted') && notification.message.includes('meeting');
  const isMeetingDeclined = notification.message.includes('rejected') && notification.message.includes('meeting');
  const isVideoCall = notification.type === 'video_call';
  const isMessage = notification.type === 'message';

  const getIcon = () => {
    if (isVideoCall) return <Video className="w-6 h-6" />;
    if (isMessage) return <MessageCircle className="w-6 h-6" />;
    if (isMeetingRequest) return <Calendar className="w-6 h-6" />;
    if (isMeetingAccepted) return <Check className="w-6 h-6" />;
    if (isMeetingDeclined) return <X className="w-6 h-6" />;
    return <Bell className="w-6 h-6" />;
  };

  const getBackgroundColor = () => {
    if (isVideoCall) return 'from-blue-600 to-indigo-700';
    if (isMessage) return 'from-purple-500 to-pink-600';
    if (isMeetingRequest) return 'from-blue-500 to-purple-600';
    if (isMeetingAccepted) return 'from-green-500 to-emerald-600';
    if (isMeetingDeclined) return 'from-red-500 to-pink-600';
    return 'from-primary-500 to-secondary-600';
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-50 p-4"
        >
          <div className={`mx-auto max-w-4xl bg-gradient-to-r ${getBackgroundColor()} rounded-2xl shadow-2xl border border-white/20 backdrop-blur-sm`}>
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white">
                      {getIcon()}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {notification.title}
                    </h3>
                    <p className="text-white/90 text-base mb-2">
                      {notification.message}
                    </p>
                    {isMessage && notification.message_content && (
                      <div className="bg-white/10 rounded-lg p-3 mb-2">
                        <p className="text-white/80 text-sm italic">
                          &quot;{notification.message_content}&quot;
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4 text-white/80 text-sm">
                      {notification.from_user && (
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>From: {notification.from_user}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(notification.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Video Call Actions */}
                  {isVideoCall && onAction && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onAction('accept', notification.id)}
                        className="px-4 py-2 bg-green-500/80 hover:bg-green-500 text-white rounded-lg font-medium transition-all flex items-center space-x-2"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Accept</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onAction('decline', notification.id)}
                        className="px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg font-medium transition-all flex items-center space-x-2"
                      >
                        <PhoneOff className="w-4 h-4" />
                        <span>Decline</span>
                      </motion.button>
                    </>
                  )}
                  
                  {/* Message Actions */}
                  {isMessage && onAction && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onAction('reply', notification.id)}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-all flex items-center space-x-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Tap to Reply</span>
                    </motion.button>
                  )}
                  
                  {/* Meeting Request Actions */}
                  {isMeetingRequest && onAction && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onAction('accept', notification.id)}
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-all"
                      >
                        Accept
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onAction('decline', notification.id)}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all"
                      >
                        Decline
                      </motion.button>
                    </>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleClose}
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
