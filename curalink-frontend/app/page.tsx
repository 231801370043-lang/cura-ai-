'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Sparkles, Heart, Users, Brain } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const floatingVariants = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 animated-gradient opacity-20"></div>
      
      {/* Floating Orbs */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full blur-3xl opacity-30"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-secondary-400 to-accent-400 rounded-full blur-3xl opacity-30"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto text-center"
        >
          {/* Logo */}
          <motion.div variants={itemVariants} className="mb-8">
            <motion.div
              className="inline-flex items-center gap-3 mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative">
                <Heart className="w-16 h-16 text-primary-500" fill="currentColor" />
                <Sparkles className="w-6 h-6 text-accent-500 absolute -top-2 -right-2 animate-pulse" />
              </div>
              <h1 className="text-6xl sm:text-7xl font-bold gradient-text">
                CuraLink
              </h1>
            </motion.div>
          </motion.div>

          {/* Tagline */}
          <motion.h2
            variants={itemVariants}
            className="text-3xl sm:text-5xl font-bold text-white mb-6 leading-tight drop-shadow-2xl"
          >
            Connecting Patients and Researchers
            <br />
            <span className="gradient-text drop-shadow-lg">Through AI-Powered Discovery</span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-xl sm:text-2xl text-white mb-12 max-w-3xl mx-auto font-medium drop-shadow-lg"
          >
            Discover clinical trials, medical publications, and connect with health experts
            in real-time. Your journey to hope starts here.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
          >
            <motion.button
              onClick={() => router.push('/onboarding/patient')}
              className="group relative px-10 py-5 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 text-white text-lg font-semibold rounded-2xl shadow-2xl overflow-hidden"
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(102, 126, 234, 0.4)' }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center gap-3">
                <Heart className="w-6 h-6" />
                I am a Patient or Caregiver
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-accent-500 via-secondary-500 to-primary-500"
                initial={{ x: '100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>

            <motion.button
              onClick={() => router.push('/onboarding/researcher')}
              className="group relative px-10 py-5 bg-gradient-to-r from-secondary-500 via-primary-500 to-accent-500 text-white text-lg font-semibold rounded-2xl shadow-2xl overflow-hidden"
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(168, 85, 247, 0.4)' }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center gap-3">
                <Brain className="w-6 h-6" />
                I am a Researcher
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-accent-500 via-primary-500 to-secondary-500"
                initial={{ x: '100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          </motion.div>

          {/* Features */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {[
              {
                icon: <Sparkles className="w-10 h-10" />,
                title: 'AI-Powered Matching',
                description: 'Intelligent algorithms connect you with relevant trials and experts',
                gradient: 'from-primary-400 to-primary-600',
              },
              {
                icon: <Users className="w-10 h-10" />,
                title: 'Real-Time Collaboration',
                description: 'Connect instantly with researchers and healthcare professionals',
                gradient: 'from-secondary-400 to-secondary-600',
              },
              {
                icon: <Brain className="w-10 h-10" />,
                title: 'Smart Insights',
                description: 'AI-generated summaries make complex research accessible',
                gradient: 'from-accent-400 to-accent-600',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="glass rounded-3xl p-8 hover-glow cursor-pointer"
                whileHover={{ y: -10 }}
              >
                <motion.div
                  className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white mb-4`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-3 drop-shadow-lg">
                  {feature.title}
                </h3>
                <p className="text-white font-medium drop-shadow-md">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="relative z-10 py-8 text-center text-white"
      >
        <p className="text-sm font-medium drop-shadow-lg">
          © 2025 CuraLink. Empowering healthcare through technology.
        </p>
      </motion.footer>
    </div>
  );
}
