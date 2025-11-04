'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, MapPin, User, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { authAPI, usersAPI } from '@/lib/api';

export default function PatientOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    medicalCondition: '',
    location: '',
    age: '',
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Register user
      const response = await authAPI.register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        full_name: formData.fullName,
        role: 'patient',
      });

      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Update profile
      await usersAPI.updatePatientProfile({
        medical_condition: formData.medicalCondition,
        location: formData.location,
        age: parseInt(formData.age),
      });

      router.push('/dashboard/patient');
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
      {/* Animated Background */}
      <div className="absolute inset-0 animated-gradient opacity-20"></div>
      
      {/* Floating Orbs */}
      <motion.div
        className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full blur-3xl opacity-30"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
      />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Heart className="w-10 h-10 text-primary-500" fill="currentColor" />
            <h1 className="text-4xl font-bold gradient-text">Patient Onboarding</h1>
          </div>
          <p className="text-white text-lg font-medium drop-shadow-lg">
            Let&apos;s get you started on your journey to discovery
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full mx-1 transition-all duration-500 ${
                  s <= step
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500'
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

        {/* Form Card */}
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
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-white">
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
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                      placeholder="John Doe"
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
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                      placeholder="johndoe123"
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
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                      placeholder="john@example.com"
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
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
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
                  <div className="p-3 rounded-xl bg-gradient-to-br from-secondary-400 to-secondary-600 text-white">
                    <Heart className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                    Tell Us About Yourself
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-white mb-2 drop-shadow-lg">
                      Medical Condition
                    </label>
                    <textarea
                      value={formData.medicalCondition}
                      onChange={(e) => setFormData({ ...formData, medicalCondition: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-secondary-500 focus:ring-2 focus:ring-secondary-200 transition-all outline-none resize-none"
                      placeholder="Describe your condition naturally (e.g., &apos;I have lung cancer&apos;)"
                      rows={4}
                    />
                    <p className="text-sm text-white font-medium mt-2 drop-shadow-md">
                      Our AI will extract relevant information to match you with trials and experts
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-2 drop-shadow-lg">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-secondary-500 focus:ring-2 focus:ring-secondary-200 transition-all outline-none"
                        placeholder="City, Country"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-2 drop-shadow-lg">
                      Age (Optional)
                    </label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-secondary-500 focus:ring-2 focus:ring-secondary-200 transition-all outline-none"
                      placeholder="35"
                    />
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
                  className="inline-flex p-6 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 text-white mb-6"
                >
                  <Sparkles className="w-12 h-12" />
                </motion.div>

                <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
                  You&apos;re All Set!
                </h2>
                <p className="text-lg text-white font-medium mb-6 drop-shadow-md">
                  Ready to discover clinical trials, publications, and connect with experts?
                </p>

                <div className="glass rounded-2xl p-6 text-left space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary-500 mt-2"></div>
                    <p className="text-white font-medium drop-shadow-md">
                      AI-powered personalized feed based on your condition
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-secondary-500 mt-2"></div>
                    <p className="text-white font-medium drop-shadow-md">
                      Access to latest clinical trials and research publications
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent-500 mt-2"></div>
                    <p className="text-white font-medium drop-shadow-md">
                      Connect with verified health experts and researchers
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
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
              className="px-8 py-3 rounded-xl font-semibold bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 text-white shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
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

        {/* Login Link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6 text-white font-medium drop-shadow-lg"
        >
          Already have an account?{' '}
          <button
            onClick={() => router.push('/login')}
            className="text-primary-300 hover:text-primary-200 font-bold underline"
          >
            Sign In
          </button>
        </motion.p>
      </div>
    </div>
  );
}
