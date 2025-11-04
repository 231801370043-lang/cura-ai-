'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, MapPin, Calendar, Users, FileText, Heart } from 'lucide-react';
import { useState } from 'react';
import { favoritesAPI } from '@/lib/api';

interface TrialDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trial: any;
}

export default function TrialDetailsModal({ isOpen, onClose, trial }: TrialDetailsModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (!trial) return null;

  const handleSaveFavorite = async () => {
    setIsSaving(true);
    try {
      await favoritesAPI.add({
        item_type: 'trial',
        item_id: trial.nct_id,
        item_data: trial.title,
        metadata: {
          phase: trial.phase,
          status: trial.status,
          summary: trial.ai_summary || trial.summary
        }
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      console.error('Error saving favorite:', error);
    } finally {
      setIsSaving(false);
    }
  };

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 bg-white rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20">
                      {trial.phase || 'Phase N/A'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      trial.status === 'RECRUITING' ? 'bg-green-500/20' :
                      trial.status === 'ACTIVE' ? 'bg-blue-500/20' :
                      'bg-gray-500/20'
                    }`}>
                      {trial.status || 'Status Unknown'}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold leading-tight">{trial.title}</h2>
                  <p className="text-sm text-white/80 mt-2">NCT ID: {trial.nct_id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveFavorite}
                    disabled={isSaving}
                    className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    <Heart className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} />
                  </motion.button>
                  <button
                    onClick={onClose}
                    className="p-3 rounded-full hover:bg-white/20 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* AI Summary */}
              {(trial.ai_summary || trial.summary) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-6 border border-primary-100"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-primary-600" />
                    <h3 className="text-lg font-bold text-gray-900">Summary</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {trial.ai_summary || trial.summary}
                  </p>
                </motion.div>
              )}

              {/* Key Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trial.location && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Location</p>
                        <p className="text-sm font-semibold text-gray-900">{trial.location}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {trial.start_date && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-secondary-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Start Date</p>
                        <p className="text-sm font-semibold text-gray-900">{trial.start_date}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {trial.enrollment && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center">
                        <Users className="w-5 h-5 text-accent-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Enrollment</p>
                        <p className="text-sm font-semibold text-gray-900">{trial.enrollment} participants</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Detailed Description */}
              {trial.detailed_description && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-2xl p-6 border border-gray-200"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Detailed Description</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {trial.detailed_description}
                  </p>
                </motion.div>
              )}

              {/* Eligibility */}
              {trial.eligibility && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white rounded-2xl p-6 border border-gray-200"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Eligibility Criteria</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {trial.eligibility}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <motion.a
                  href={`https://clinicaltrials.gov/study/${trial.nct_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold shadow-lg flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  View on ClinicalTrials.gov
                </motion.a>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
                >
                  Close
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
