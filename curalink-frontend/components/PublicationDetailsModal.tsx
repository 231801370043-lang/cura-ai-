'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Calendar, Users, BookOpen } from 'lucide-react';

interface Publication {
  pmid: string;
  title: string;
  abstract?: string;
  ai_summary?: string;
  authors: string;
  journal: string;
  publication_date?: string;
  doi?: string;
  keywords?: string[] | string;
  url?: string;
}

interface PublicationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  publication: Publication | null;
}

export default function PublicationDetailsModal({ isOpen, onClose, publication }: PublicationDetailsModalProps) {
  if (!publication) return null;

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
            className="fixed inset-4 md:inset-8 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-secondary-500 to-accent-500 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-8 h-8" />
                  <h2 className="text-2xl font-bold">Publication Details</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Title */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {publication.title}
                </h3>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-secondary-500" />
                    <span className="font-semibold text-gray-900 dark:text-white">Authors</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {publication.authors || 'Not available'}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-5 h-5 text-secondary-500" />
                    <span className="font-semibold text-gray-900 dark:text-white">Journal</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {publication.journal || 'Not available'}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-secondary-500" />
                    <span className="font-semibold text-gray-900 dark:text-white">Published</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {publication.publication_date || 'Not available'}
                  </p>
                </div>
              </div>

              {/* AI Summary */}
              {publication.ai_summary && (
                <div className="bg-gradient-to-r from-secondary-50 to-accent-50 dark:from-secondary-900/20 dark:to-accent-900/20 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    AI Summary
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {publication.ai_summary}
                  </p>
                </div>
              )}

              {/* Abstract */}
              {publication.abstract && (
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    Abstract
                  </h4>
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-6">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {publication.abstract}
                    </p>
                  </div>
                </div>
              )}

              {/* Keywords */}
              {publication.keywords && (
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    Keywords
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(publication.keywords) 
                      ? publication.keywords 
                      : (publication.keywords as string)?.split(',') || []
                    ).map((keyword: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-300"
                      >
                        {keyword.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  PMID: {publication.pmid}
                </div>
                <div className="flex gap-3">
                  {publication.url && (
                    <a
                      href={publication.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-secondary-500 text-white font-semibold hover:bg-secondary-600 transition-all flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Original
                    </a>
                  )}
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-gray-500 text-white font-semibold hover:bg-gray-600 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
