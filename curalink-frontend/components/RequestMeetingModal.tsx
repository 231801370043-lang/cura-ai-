'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Loader, Video, MessageCircle } from 'lucide-react';
import { meetingsAPI } from '@/lib/api';

interface Expert {
  id: string;
  name: string;
  full_name?: string;
  specialization?: string;
  specialty?: string;
  institution?: string;
}

interface RequestMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  expert: Expert | null;
  onSuccess: () => void;
}

export default function RequestMeetingModal({ isOpen, onClose, expert, onSuccess }: RequestMeetingModalProps) {
  const [formData, setFormData] = useState({
    message: '',
    preferred_date: '',
    meeting_type: 'video' as 'video' | 'chat'
  });
  
  const formatMessage = () => {
    const dateStr = formData.preferred_date 
      ? new Date(formData.preferred_date).toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'Not specified';
    
    return `${formData.message}\n\nPreferred Date & Time: ${dateStr}\nMeeting Type: ${formData.meeting_type === 'video' ? 'Video Call' : 'Chat'}`;
  };
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!expert) return;
      await meetingsAPI.create({
        expert_id: expert.id,
        message: formatMessage()
      });
      
      setFormData({ message: '', preferred_date: '', meeting_type: 'video' });
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to send request';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!expert) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
          >
            <div className="w-full max-w-[550px] max-h-[90vh] bg-white dark:bg-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-secondary-500 to-accent-500 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Request Meeting</h2>
                    <p className="text-sm text-white/80">Connect with {expert.name || expert.full_name}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Expert Info */}
            <div className="p-6 border-b border-gray-200 dark:border-slate-600 bg-gradient-to-br from-secondary-50 to-accent-50 dark:from-secondary-900/20 dark:to-accent-900/20">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary-400 to-accent-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {(expert.name || expert.full_name)?.charAt(0) || 'E'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{expert.name || expert.full_name}</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{expert.specialization || expert.specialty || 'Researcher'}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{expert.institution}</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl"
                >
                  {error}
                </motion.div>
              )}

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Your Message *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Introduce yourself and explain why you'd like to meet..."
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:border-secondary-500 focus:ring-2 focus:ring-secondary-200 transition-all resize-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              {/* Preferred Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Preferred Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.preferred_date}
                  onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                  required
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:border-secondary-500 focus:ring-2 focus:ring-secondary-200 transition-all text-gray-900 dark:text-white"
                />
              </div>

              {/* Meeting Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Meeting Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData({ ...formData, meeting_type: 'video' })}
                    className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                      formData.meeting_type === 'video'
                        ? 'bg-gradient-to-r from-secondary-500 to-accent-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Video className="w-5 h-5" />
                    Video Call
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData({ ...formData, meeting_type: 'chat' })}
                    className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                      formData.meeting_type === 'chat'
                        ? 'bg-gradient-to-r from-secondary-500 to-accent-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <MessageCircle className="w-5 h-5" />
                    Chat
                  </motion.button>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Note:</strong> The recipient will review your request and respond within 24-48 hours. 
                  You'll be notified once they accept or suggest an alternative time.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 pt-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-secondary-500 to-accent-500 text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-5 h-5" />
                      Send Request
                    </>
                  )}
                </motion.button>
              </div>
            </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
