'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Brain, Building, BookOpen, ArrowRight, Sparkles, Loader2, User } from 'lucide-react';
import { authAPI, usersAPI } from '@/lib/api';

export default function ResearcherOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    specialty: '',
    researchInterests: '',
    institution: '',
    orcidId: '',
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await authAPI.register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        full_name: formData.fullName,
        role: 'researcher',
      });

      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      await usersAPI.updateResearcherProfile({
        specialty: formData.specialty,
        research_interests: formData.researchInterests,
        institution: formData.institution,
        orcid_id: formData.orcidId,
        available_for_meetings: true,
      });

      router.push('/dashboard/researcher');
    } catch (error: unknown) {
      console.error('Registration error:', error);
      const errorMessage = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Registration failed';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
    else handleSubmit();
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const pageVariants = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 animated-gradient opacity-20"></div>
      
      <motion.div
        className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-secondary-400 to-accent-400 rounded-full blur-3xl opacity-30"
        animate={{
          scale: [1, 1.2, 1],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
      />

      <div className="relative z-10 w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Brain className="w-10 h-10 text-secondary-500" />
            <h1 className="text-4xl font-bold gradient-text">Researcher Onboarding</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Join our community of healthcare innovators
          </p>
        </motion.div>

        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full mx-1 transition-all duration-500 ${
                  s <= step
                    ? 'bg-gradient-to-r from-secondary-500 to-accent-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Account</span>
            <span>Profile</span>
            <span>Complete</span>
          </div>
        </div>

        <motion.div
          className="glass rounded-3xl p-8 shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-secondary-400 to-secondary-600 text-white">
                    <User className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                    Create Your Account
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-white mb-2 drop-shadow-lg">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-secondary-500 focus:ring-2 focus:ring-secondary-200 transition-all outline-none"
                      placeholder="Dr. Jane Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-2 drop-shadow-lg">
                      Username
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-secondary-500 focus:ring-2 focus:ring-secondary-200 transition-all outline-none"
                      placeholder="drjanesmith"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-2 drop-shadow-lg">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-secondary-500 focus:ring-2 focus:ring-secondary-200 transition-all outline-none"
                      placeholder="jane.smith@university.edu"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-2 drop-shadow-lg">
                      Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-secondary-500 focus:ring-2 focus:ring-secondary-200 transition-all outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 text-white">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                    Research Profile
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-white mb-2 drop-shadow-lg">
                      Specialty
                    </label>
                    <input
                      type="text"
                      value={formData.specialty}
                      onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-200 transition-all outline-none"
                      placeholder="Oncology, Neurology, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-2 drop-shadow-lg">
                      Research Interests
                    </label>
                    <textarea
                      value={formData.researchInterests}
                      onChange={(e) => setFormData({ ...formData, researchInterests: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-200 transition-all outline-none resize-none"
                      placeholder="Describe your research focus areas..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-2 drop-shadow-lg">
                      Institution
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.institution}
                        onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-accent-500 focus:ring-2 focus:ring-accent-200 transition-all outline-none"
                        placeholder="University or Research Center"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-2 drop-shadow-lg">
                      ORCID iD (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.orcidId}
                      onChange={(e) => setFormData({ ...formData, orcidId: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-200 transition-all outline-none"
                      placeholder="0000-0000-0000-0000"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Get verified badge by adding your ORCID iD
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="inline-flex p-6 rounded-full bg-gradient-to-br from-secondary-400 to-accent-600 text-white mb-6"
                >
                  <Sparkles className="w-12 h-12" />
                </motion.div>

                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                  Welcome to CuraLink!
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  Start collaborating with patients and fellow researchers
                </p>

                <div className="glass rounded-2xl p-6 text-left space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-secondary-500 mt-2"></div>
                    <p className="text-gray-700 dark:text-gray-300">
                      Connect with patients seeking clinical trials
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent-500 mt-2"></div>
                    <p className="text-gray-700 dark:text-gray-300">
                      Collaborate with researchers worldwide
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary-500 mt-2"></div>
                    <p className="text-gray-700 dark:text-gray-300">
                      Manage trials and engage in forums
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-8">
            <motion.button
              onClick={prevStep}
              disabled={step === 1}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                step === 1
                  ? 'opacity-50 cursor-not-allowed bg-gray-200 dark:bg-gray-700 text-gray-500'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
              whileHover={step > 1 ? { scale: 1.05 } : {}}
              whileTap={step > 1 ? { scale: 0.95 } : {}}
            >
              Back
            </motion.button>

            <motion.button
              onClick={nextStep}
              disabled={loading}
              className="px-8 py-3 rounded-xl font-semibold bg-gradient-to-r from-secondary-500 via-accent-500 to-primary-500 text-white shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  {step === 3 ? 'Get Started' : 'Continue'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6 text-gray-600 dark:text-gray-400"
        >
          Already have an account?{' '}
          <button
            onClick={() => router.push('/login')}
            className="text-secondary-500 hover:text-secondary-600 font-semibold"
          >
            Sign In
          </button>
        </motion.p>
      </div>
    </div>
  );
}
