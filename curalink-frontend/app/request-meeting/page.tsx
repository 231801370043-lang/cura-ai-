'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, Video, MessageCircle, ArrowLeft, Loader, CheckCircle } from 'lucide-react';
import { meetingsAPI } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';

export default function RequestMeetingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const expertId = searchParams.get('expertId');
  
  const [expert, setExpert] = useState<{ id: string; full_name: string; specialization?: string; institution?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    message: '',
    preferred_date: '',
    meeting_type: 'video' as 'video' | 'chat'
  });

  useEffect(() => {
    if (!expertId) {
      router.push('/dashboard/patient');
      return;
    }
    loadExpert();
  }, [expertId]);

  const loadExpert = async () => {
    try {
      // For now, we'll use mock data since we don't have a direct expert API
      // In a real app, you'd fetch the expert details
      if (expertId) {
        setExpert({
          id: expertId,
          full_name: 'Dr. HONGKONG',
          specialization: 'Oncology',
          institution: 'Stanford University'
        });
      }
    } catch (error) {
      setError('Failed to load expert information');
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await meetingsAPI.create({
        expert_id: expertId!,
        message: formatMessage()
      });
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/patient');
      }, 2000);
    } catch (error: any) {
      let errorMessage = 'Failed to send meeting request. Please try again.';
      
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map((e: any) => e.msg || e.message || e).join(', ');
        } else {
          errorMessage = JSON.stringify(error.response.data.detail);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl text-center max-w-md w-full"
        >
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Request Sent!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Your meeting request has been sent successfully. The researcher will review and respond within 24-48 hours.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Redirecting to dashboard...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-slate-800/50 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Request Meeting</h1>
            <p className="text-gray-600 dark:text-gray-400">Connect with a healthcare expert</p>
          </div>
        </div>

        {/* Expert Card */}
        {expert && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg mb-8 border border-gray-100 dark:border-slate-700"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary-400 to-accent-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {expert.full_name?.charAt(0) || 'E'}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{expert.full_name}</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{expert.specialization || 'Researcher'}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{expert.institution}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700"
        >
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                rows={5}
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
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormData({ ...formData, meeting_type: 'video' })}
                  className={`px-6 py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-3 ${
                    formData.meeting_type === 'video'
                      ? 'bg-gradient-to-r from-secondary-500 to-accent-500 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
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
                  className={`px-6 py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-3 ${
                    formData.meeting_type === 'chat'
                      ? 'bg-gradient-to-r from-secondary-500 to-accent-500 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
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
            <div className="flex items-center gap-4 pt-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={submitting}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-secondary-500 to-accent-500 text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
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
        </motion.div>
      </div>
    </div>
  );
}
