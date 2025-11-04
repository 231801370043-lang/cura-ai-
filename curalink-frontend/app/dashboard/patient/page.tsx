'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Heart, BookOpen, Users, Star, LogOut, Sparkles, Menu, Home, FileText, X, Sun, Moon
} from 'lucide-react';
import { trialsAPI, publicationsAPI, expertsAPI, favoritesAPI, usersAPI, meetingsAPI, notificationsAPI } from '@/lib/api';
import CuraAIChat from '@/components/CuraAIChat';
import TrialDetailsModal from '@/components/TrialDetailsModal';
import RequestMeetingModal from '@/components/RequestMeetingModal';
import PublicationDetailsModal from '@/components/PublicationDetailsModal';
import NotificationDropdown from '@/components/NotificationDropdown';
import NotificationBanner from '@/components/NotificationBanner';
import ChatModal from '@/components/ChatModal';
import VideoCallModal from '@/components/VideoCallModal';
import { useNotifications } from '@/contexts/NotificationContext';
import { useTheme } from '@/contexts/ThemeContext';

interface User {
  id: string;
  full_name: string;
  medical_condition?: string;
}

interface Trial {
  nct_id: string;
  title: string;
  phase?: string;
  ai_summary?: string;
  summary?: string;
}

interface Publication {
  pmid: string;
  title: string;
  ai_summary?: string;
  abstract?: string;
  authors: string;
  journal: string;
}

interface Expert {
  id: string;
  name: string;
  full_name?: string;
  specialization?: string;
  institution?: string;
}

interface Favorite {
  id: string;
  item_type: string;
  item_id: string;
  item_data: string;
  created_at: string;
}

interface Meeting {
  id: string;
  status: string;
  message: string;
  description?: string;
  organizer_id: string;
  populated_participants?: { id: string; full_name: string }[];
  expert?: { id: string; full_name: string };
}


export default function PatientDashboard() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { 
    notifications, 
    unreadCount, 
    activeBanner, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    dismissBanner,
  } = useNotifications();
  const [activeTab, setActiveTab] = useState('feed');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCuraAI, setShowCuraAI] = useState(false);
  const [selectedTrial, setSelectedTrial] = useState<Trial | null>(null);
  const [showTrialDetails, setShowTrialDetails] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [showRequestMeeting, setShowRequestMeeting] = useState(false);
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [showPublicationDetails, setShowPublicationDetails] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [videoRoom, setVideoRoom] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    loadData();
  }, []);

  // Handle auto-opening video modal for accepted calls
  useEffect(() => {
    // Check for "Call Accepted" notifications and auto-open video modal
    const callAcceptedNotification = notifications.find(n => 
      n.title === 'Call Accepted' && 
      n.type === 'video_call' && 
      !n.read && 
      n.call_room
    );
    
    if (callAcceptedNotification && callAcceptedNotification.call_room) {
      console.log('Call accepted! Auto-opening video modal with room:', callAcceptedNotification.call_room);
      setVideoRoom(callAcceptedNotification.call_room);
      setShowVideoCall(true);
      // Mark as read
      markAsRead(callAcceptedNotification.id);
    }
  }, [notifications, markAsRead]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load profile first to get condition
      await usersAPI.getPatientProfile();
      
      // Load critical data first (favorites and meetings)
      const [favsRes, meetingsRes] = await Promise.all([
        favoritesAPI.getAll().catch((err) => {
          console.warn('Failed to load favorites:', err);
          return { data: [] };
        }),
        meetingsAPI.getAll().catch((err) => {
          console.warn('Failed to load meetings:', err);
          return { data: [] };
        })
      ]);
      
      setFavorites(favsRes.data || []);
      setMeetings(meetingsRes.data || []);
      
      // Load search data with reduced results for faster loading
      const [trialsRes, pubsRes, expertsRes] = await Promise.all([
        trialsAPI.getAll().catch((err) => {
          console.warn('Failed to load trials:', err);
          return { data: [] };
        }),
        publicationsAPI.getAll().catch((err) => {
          console.warn('Failed to load publications:', err);
          return { data: [] };
        }),
        expertsAPI.getAll().catch((err) => {
          console.warn('Failed to load experts:', err);
          return { data: [] };
        })
      ]);
      
      setTrials(trialsRes.data || []);
      setPublications(pubsRes.data || []);
      setExperts(expertsRes.data || []);
    } catch (error: any) {
      console.error('Error loading data:', error);
      
      // Check if it's a 403 error (wrong role)
      if (error.response?.status === 403) {
        setError('You are not registered as a patient. Redirecting to researcher dashboard...');
        setTimeout(() => {
          router.push('/dashboard/researcher');
        }, 2000);
      } else {
        // Extract error message properly
        let errorMessage = 'Failed to load data';
        
        if (error.response?.data?.detail) {
          if (typeof error.response.data.detail === 'string') {
            errorMessage = error.response.data.detail;
          } else if (Array.isArray(error.response.data.detail)) {
            errorMessage = error.response.data.detail.map((e: { msg: string }) => e.msg).join(', ');
          } else {
            errorMessage = JSON.stringify(error.response.data.detail);
          }
        } else if ((error as { message?: string }).message) {
          errorMessage = (error as { message?: string }).message || 'Unknown error';
        }
        
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Polling for meetings to keep in sync with researcher actions
  useEffect(() => {
    const id = window.setInterval(() => {
      meetingsAPI.getAll().then((res) => setMeetings(res.data || [])).catch(() => {});
    }, 30000);
    return () => window.clearInterval(id);
  }, []);

  // Reminder for upcoming accepted meetings (patient side)
  const parsePreferredDate = (msg: string): Date | null => {
    try {
      const line = msg.split('\n').find(l => l.toLowerCase().startsWith('preferred date & time'));
      if (!line) return null;
      const text = line.split(':').slice(1).join(':').trim();
      const d = new Date(text);
      return isNaN(d.getTime()) ? null : d;
    } catch { return null; }
  };

  useEffect(() => {
    if (!meetings?.length) return;
    const interval = window.setInterval(() => {
      const now = Date.now();
      meetings.filter((m: Meeting)=> m.status==='accepted').forEach((m: Meeting)=>{
        const d = parsePreferredDate(m.message);
        if (!d) return;
        const diff = d.getTime() - now;
        if (diff > 0 && diff < 10*60*1000) {
          const key = `patient_meeting_notified_${m.id}`;
          if (!sessionStorage.getItem(key)) {
            const expertName = m.populated_participants?.find(p => p.id !== m.organizer_id)?.full_name || 'researcher';
            alert(`Reminder: Meeting with ${expertName} at ${d.toLocaleString()}`);
            sessionStorage.setItem(key,'1');
          }
        }
      });
    }, 60*1000);
    return () => window.clearInterval(interval);
  }, [meetings]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 transition-colors duration-300">
      {/* Sidebar */}
      <motion.aside
        animate={{ x: sidebarOpen ? 0 : -300 }}
        className="fixed left-0 top-0 h-full w-72 bg-white dark:bg-slate-800 shadow-2xl border-r border-gray-200 dark:border-slate-700 z-50 p-6 transition-colors duration-300"
      >
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-10 h-10 text-primary-500" fill="currentColor" />
          <h1 className="text-2xl font-bold gradient-text">CuraLink</h1>
        </div>

        <nav className="space-y-2">
          {[
            { id: 'feed', icon: Home, label: 'My Feed' },
            { id: 'trials', icon: FileText, label: 'Clinical Trials' },
            { id: 'publications', icon: BookOpen, label: 'Publications' },
            { id: 'experts', icon: Users, label: 'Experts' },
            { id: 'favorites', icon: Star, label: 'Favorites' },
          ].map((item) => (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
              whileHover={{ x: 5 }}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </motion.button>
          ))}
        </nav>

        <motion.button
          onClick={() => {
            localStorage.clear();
            router.push('/');
          }}
          className="absolute bottom-6 left-6 right-6 flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          whileHover={{ x: 5 }}
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </motion.button>
      </motion.aside>

      {/* Main Content */}
      <div className={`transition-all ${sidebarOpen ? 'ml-72' : 'ml-0'}`}>
        <header className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg border-b border-gray-200 dark:border-slate-700 px-8 py-4 sticky top-0 z-40 shadow-sm transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-900 dark:text-white transition-colors">
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.full_name?.split(' ')[0]}!</h2>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </button>
              <NotificationDropdown
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onDelete={deleteNotification}
                onAction={async (action, notificationId) => {
                  // Handle meeting request actions
                  if (action === 'accept' || action === 'decline') {
                    try {
                      const notification = notifications.find(n => n.id === notificationId);
                      if (notification?.meeting_id) {
                        await meetingsAPI.updateStatus(notification.meeting_id, action === 'accept' ? 'accepted' : 'rejected');
                        markAsRead(notificationId);
                      }
                    } catch (error) {
                      console.error('Failed to update meeting status:', error);
                    }
                  }
                }}
              />
              <motion.button
                onClick={() => setShowCuraAI(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium shadow-lg flex items-center gap-2 hover:shadow-xl transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="w-5 h-5" />
                Cura AI
              </motion.button>
            </div>
          </div>
        </header>

        <main className="p-8 bg-gradient-to-br from-indigo-50 via-purple-50 via-pink-50 to-rose-50 dark:from-slate-900 dark:via-indigo-900/20 dark:via-purple-900/20 dark:to-rose-900/20 min-h-screen relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
          </div>
          <div className="relative z-10">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-transparent border-t-purple-500 border-r-pink-500"></div>
                <div className="absolute inset-0 animate-pulse rounded-full h-20 w-20 border-4 border-transparent border-b-cyan-500 border-l-blue-500"></div>
                <div className="absolute inset-2 animate-spin rounded-full h-16 w-16 border-2 border-transparent border-t-emerald-400 border-r-yellow-400" style={{animationDelay: '150ms'}}></div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6">
              <p className="font-semibold">Error loading data:</p>
              <p>{typeof error === 'string' ? error : JSON.stringify(error)}</p>
              <button onClick={loadData} className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Retry
              </button>
            </div>
          )}
          
          {!loading && !error && activeTab === 'trials' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Clinical Trials</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {trials.length === 0 ? (
                  <div className="col-span-full bg-white dark:bg-slate-800 rounded-xl p-8 text-center shadow-lg border border-gray-100 dark:border-slate-700 transition-colors">
                    <p className="text-gray-500 dark:text-gray-400">No clinical trials found for your condition</p>
                  </div>
                ) : (
                  trials.map((trial) => (
                    <motion.div key={trial.nct_id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-gray-100 dark:border-slate-700" whileHover={{ y: -5 }}>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700">
                        {trial.phase || 'Phase N/A'}
                      </span>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mt-3 mb-2 line-clamp-2">{trial.title}</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">{trial.ai_summary || trial.summary}</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setSelectedTrial(trial);
                            setShowTrialDetails(true);
                          }}
                          className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold hover:shadow-lg transition-all"
                        >
                          View Details
                        </button>
                        <button 
                          onClick={async () => {
                            try {
                              await favoritesAPI.add({
                                item_type: 'trial',
                                item_id: trial.nct_id,
                                item_data: trial.title
                              });
                              // Refresh favorites list
                              const favsRes = await favoritesAPI.getAll();
                              setFavorites(favsRes.data || []);
                              alert('Added to favorites!');
                            } catch (error: any) {
                              console.error('Favorites error:', error);
                              if (error.response?.status === 400) {
                                alert('This item is already in your favorites!');
                              } else {
                                alert('Failed to add to favorites. Please try again.');
                              }
                            }
                          }}
                          className="px-4 py-3 rounded-xl bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition-all"
                        >
                          <Star className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {!loading && !error && activeTab === 'publications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Publications</h2>
              <div className="space-y-4">
                {publications.length === 0 ? (
                  <div className="bg-white rounded-xl p-8 text-center shadow-lg border border-gray-100">
                    <p className="text-gray-500">No publications found for your condition</p>
                  </div>
                ) : (
                  publications.map((pub) => (
                    <motion.div key={pub.pmid} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-slate-700 cursor-pointer" whileHover={{ x: 5 }} onClick={() => {
                      setSelectedPublication(pub);
                      setShowPublicationDetails(true);
                    }}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-lg hover:text-secondary-500 transition-colors">{pub.title}</h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-3">{pub.ai_summary || pub.abstract}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 font-medium">
                            <span>{pub.authors}</span>
                            <span>•</span>
                            <span>{pub.journal}</span>
                          </div>
                        </div>
                        <button 
                          onClick={async (e) => {
                            e.stopPropagation(); // Prevent triggering the publication details modal
                            try {
                              await favoritesAPI.add({
                                item_type: 'publication',
                                item_id: pub.pmid,
                                item_data: pub.title
                              });
                              // Refresh favorites list
                              const favsRes = await favoritesAPI.getAll();
                              setFavorites(favsRes.data || []);
                              alert('Added to favorites!');
                            } catch (error: any) {
                              console.error('Favorites error:', error);
                              if (error.response?.status === 400) {
                                alert('This item is already in your favorites!');
                              } else {
                                alert('Failed to add to favorites. Please try again.');
                              }
                            }
                          }}
                          className="ml-4 p-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition-all"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {!loading && !error && activeTab === 'favorites' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">My Favorites</h2>
              <div className="space-y-4">
                {favorites.length === 0 ? (
                  <div className="bg-white rounded-xl p-8 text-center shadow-lg border border-gray-100">
                    <p className="text-gray-500">No favorites yet. Add some trials or publications to your favorites!</p>
                  </div>
                ) : (
                  favorites.map((fav) => (
                    <motion.div key={fav.id} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 cursor-pointer" whileHover={{ x: 5 }} onClick={() => {
                      // Handle click based on item type
                      if (fav.item_type === 'trial') {
                        // Find the trial by ID and open modal
                        const trial = trials.find(t => t.nct_id === fav.item_id);
                        if (trial) {
                          setSelectedTrial(trial);
                          setShowTrialDetails(true);
                        }
                      } else if (fav.item_type === 'publication') {
                        // Find the publication by ID and open modal
                        const publication = publications.find(p => p.pmid === fav.item_id);
                        if (publication) {
                          setSelectedPublication(publication);
                          setShowPublicationDetails(true);
                        }
                      }
                    }}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700">
                            {fav.item_type}
                          </span>
                          <h4 className="font-bold text-gray-900 mb-2 text-lg mt-2 hover:text-primary-600 transition-colors">{fav.item_data}</h4>
                          <p className="text-sm text-gray-600">Added on {new Date(fav.created_at).toLocaleDateString()}</p>
                          <p className="text-xs text-primary-500 mt-1">Click to view details</p>
                        </div>
                        <button 
                          onClick={async (e) => {
                            e.stopPropagation(); // Prevent triggering the card click
                            try {
                              await favoritesAPI.remove(parseInt(fav.id));
                              setFavorites(favorites.filter(f => f.id !== fav.id));
                              alert('Removed from favorites!');
                            } catch {
                              alert('Failed to remove from favorites');
                            }
                          }}
                          className="ml-4 p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {!loading && !error && activeTab === 'feed' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { 
                    label: 'Clinical Trials', 
                    value: trials.length, 
                    icon: FileText, 
                    gradient: 'from-violet-600 via-purple-600 to-indigo-600',
                    bgGradient: 'from-violet-50/80 via-purple-50/80 to-indigo-50/80 dark:from-violet-900/30 dark:via-purple-900/30 dark:to-indigo-900/30',
                    glowColor: 'shadow-violet-500/25',
                    textGradient: 'from-violet-600 via-purple-600 to-indigo-600'
                  },
                  { 
                    label: 'Publications', 
                    value: publications.length, 
                    icon: BookOpen, 
                    gradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
                    bgGradient: 'from-rose-50/80 via-pink-50/80 to-fuchsia-50/80 dark:from-rose-900/30 dark:via-pink-900/30 dark:to-fuchsia-900/30',
                    glowColor: 'shadow-pink-500/25',
                    textGradient: 'from-rose-600 via-pink-600 to-fuchsia-600'
                  },
                  { 
                    label: 'Experts Found', 
                    value: experts.length, 
                    icon: Users, 
                    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
                    bgGradient: 'from-emerald-50/80 via-teal-50/80 to-cyan-50/80 dark:from-emerald-900/30 dark:via-teal-900/30 dark:to-cyan-900/30',
                    glowColor: 'shadow-emerald-500/25',
                    textGradient: 'from-emerald-600 via-teal-600 to-cyan-600'
                  },
                ].map((stat, index) => (
                  <motion.div 
                    key={stat.label} 
                    className={`bg-gradient-to-br ${stat.bgGradient} backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl hover:shadow-3xl ${stat.glowColor} transition-all duration-500 border border-white/30 dark:border-white/10 relative overflow-hidden group`} 
                    whileHover={{ y: -12, scale: 1.04, rotateY: 5 }}
                    initial={{ opacity: 0, y: 40, rotateX: 10 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ delay: index * 0.2, type: "spring", stiffness: 100 }}
                  >
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                    
                    {/* Floating particles effect */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute top-4 right-4 w-2 h-2 bg-white/40 rounded-full animate-pulse"></div>
                      <div className="absolute bottom-8 left-6 w-1 h-1 bg-white/30 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
                      <div className="absolute top-1/2 right-8 w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-8">
                        <div className={`p-6 rounded-[1.5rem] bg-gradient-to-br ${stat.gradient} text-white shadow-2xl transform group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 relative`}>
                          <div className="absolute inset-0 bg-white/20 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <stat.icon className="w-12 h-12 relative z-10" />
                        </div>
                      </div>
                      <div>
                        <h3 className={`text-7xl font-black mb-4 bg-gradient-to-r ${stat.textGradient} bg-clip-text text-transparent drop-shadow-sm`}>
                          {stat.value}
                        </h3>
                        <p className="text-2xl font-bold text-gray-700 dark:text-gray-200 tracking-wide">{stat.label}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4">Recommended Clinical Trials</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {trials.slice(0, 4).map((trial) => (
                    <motion.div key={trial.nct_id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-gray-100" whileHover={{ y: -5 }}>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700">
                        {trial.phase || 'Phase N/A'}
                      </span>
                      <h4 className="text-lg font-bold text-gray-900 mt-3 mb-2 line-clamp-2">{trial.title}</h4>
                      <p className="text-sm text-gray-700 mb-4 line-clamp-2">{trial.ai_summary || trial.summary}</p>
                      <button 
                        onClick={() => {
                          setSelectedTrial(trial);
                          setShowTrialDetails(true);
                        }}
                        className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold hover:shadow-lg transition-all"
                      >
                        View Details
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4">Recent Publications</h3>
                <div className="space-y-4">
                  {publications.slice(0, 3).map((pub) => (
                    <motion.div key={pub.pmid} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100" whileHover={{ x: 5 }}>
                      <h4 className="font-bold text-gray-900 mb-2 text-lg">{pub.title}</h4>
                      <p className="text-sm text-gray-700 mb-3 line-clamp-2">{pub.ai_summary || pub.abstract}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-600 font-medium">
                        <span>{pub.authors}</span>
                        <span>•</span>
                        <span>{pub.journal}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Meetings for patient */}
              <div>
                <h3 className="text-2xl font-bold mb-4">Accepted Meetings ({meetings.filter((m: Meeting)=> m.status==='accepted' || m.status==='scheduled').length})</h3>
                <div className="space-y-4">
                  {meetings.filter((m: Meeting)=> m.status==='accepted' || m.status==='scheduled').length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center shadow-lg border border-gray-100">
                      <p className="text-gray-500">No accepted meetings yet</p>
                    </div>
                  ) : (
                    meetings.filter((m: Meeting)=> m.status==='accepted' || m.status==='scheduled').slice(0,5).map((meeting: Meeting)=> (
                      <motion.div key={meeting.id} className="bg-white rounded-xl p-6 flex items-center justify-between shadow-lg hover:shadow-xl transition-all border border-gray-100" whileHover={{ x: 5 }}>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1 text-lg">
                            {meeting.populated_participants?.find((p: { id: string; full_name: string }) => p.id !== meeting.organizer_id)?.full_name || 'Expert'}
                          </h4>
                          <p className="text-sm text-gray-700">{meeting.description || meeting.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Status: {meeting.status === 'scheduled' ? 'Accepted' : meeting.status}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const expert = meeting.populated_participants?.find((p: { id: string; full_name: string }) => p.id !== meeting.organizer_id);
                              if (expert) {
                                setSelectedMeeting({
                                  ...meeting,
                                  expert: expert
                                });
                                setShowChat(true);
                              }
                            }}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold hover:shadow-lg transition-all"
                          >
                            Open Chat
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                const expert = meeting.populated_participants?.find((p: { id: string; full_name: string }) => p.id !== meeting.organizer_id);
                                if (expert) {
                                  const roomName = `curalink-meeting-${meeting.id}`;
                                  
                                  // Send video call notification to researcher
                                  await notificationsAPI.sendVideoCall({
                                    receiver_id: expert.id,
                                    room_name: roomName
                                  });
                                  
                                  // Show success message
                                  alert(`Video call invitation sent to ${expert.full_name}. Waiting for response...`);
                                } else {
                                  alert('Could not find researcher information');
                                }
                              } catch (error) {
                                console.error('Failed to send video call invitation:', error);
                                alert('Failed to send video call invitation. Please try again.');
                              }
                            }}
                            className="px-4 py-2 rounded-xl bg-black text-white font-semibold hover:bg-gray-800 transition-all"
                          >
                            Join Video
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm('Are you sure you want to delete this meeting?')) {
                                try {
                                  await meetingsAPI.cancel(meeting.id);
                                  setMeetings(meetings.filter(m => m.id !== meeting.id));
                                  alert('Meeting deleted successfully!');
                                } catch {
                                  alert('Failed to delete meeting');
                                }
                              }
                            }}
                            className="px-4 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'experts' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Health Experts & Researchers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {experts.map((expert) => (
                  <motion.div key={expert.id} className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-2xl transition-all border border-gray-100" whileHover={{ y: -5 }}>
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {expert.name?.charAt(0) || 'E'}
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1">{expert.name}</h4>
                    <p className="text-sm text-gray-700 font-medium mb-2">{expert.specialization || 'Researcher'}</p>
                    <p className="text-xs text-gray-600 mb-4">{expert.institution}</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setSelectedExpert(expert);
                          setShowRequestMeeting(true);
                        }}
                        className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-secondary-500 to-accent-500 text-white font-semibold hover:shadow-lg transition-all"
                      >
                        Quick Request
                      </button>
                      <button 
                        onClick={() => {
                          router.push(`/request-meeting?expertId=${expert.id}`);
                        }}
                        className="px-4 py-3 rounded-xl bg-gray-500 text-white font-semibold hover:bg-gray-600 transition-all"
                      >
                        Full Form
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
          </div>
        </main>
      </div>

      {/* Notification Banner */}
      {activeBanner && (
        <NotificationBanner
          notification={activeBanner}
          onClose={dismissBanner}
          onAction={async (action, notificationId) => {
            const notification = notifications.find(n => n.id === notificationId);
            
            if (action === 'accept' || action === 'decline') {
              try {
                // Handle video call response
                if (notification?.type === 'video_call') {
                  const response = await notificationsAPI.respondToVideoCall(notificationId, action);
                  if (action === 'accept' && response.data.room_name) {
                    setVideoRoom(response.data.room_name);
                    setShowVideoCall(true);
                  }
                  markAsRead(notificationId);
                  dismissBanner();
                  return;
                }
                
                // Handle meeting request
                if (notification?.meeting_id) {
                  await meetingsAPI.updateStatus(notification.meeting_id, action === 'accept' ? 'accepted' : 'rejected');
                  markAsRead(notificationId);
                  dismissBanner();
                }
              } catch (error) {
                console.error('Failed to handle notification action:', error);
                alert('Failed to process request. Please try again.');
              }
            }
            
            // Handle message reply
            if (action === 'reply') {
              try {
                if (notification?.sender_id) {
                  setSelectedMeeting({
                    id: '',
                    status: '',
                    message: '',
                    organizer_id: '',
                    expert: {
                      id: notification.sender_id,
                      full_name: notification.message.split(' from ')[1] || 'User'
                    }
                  });
                  setShowChat(true);
                  markAsRead(notificationId);
                  dismissBanner();
                }
              } catch (error) {
                console.error('Failed to open chat:', error);
              }
            }
          }}
        />
      )}

      {/* Modals */}
      <CuraAIChat 
        isOpen={showCuraAI} 
        onClose={() => setShowCuraAI(false)}
        userCondition={user?.medical_condition}
      />
      
      <TrialDetailsModal
        isOpen={showTrialDetails}
        onClose={() => setShowTrialDetails(false)}
        trial={selectedTrial}
      />
      
      <RequestMeetingModal
        isOpen={showRequestMeeting}
        onClose={() => setShowRequestMeeting(false)}
        expert={selectedExpert}
        onSuccess={() => {
          alert('Meeting request sent successfully! The researcher will review and respond soon.');
        }}
      />
      
      <PublicationDetailsModal
        isOpen={showPublicationDetails}
        onClose={() => setShowPublicationDetails(false)}
        publication={selectedPublication}
      />

      {/* Chat Modal */}
      <ChatModal
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        otherUser={{
          id: selectedMeeting?.expert?.id || '',
          name: selectedMeeting?.expert?.full_name || 'Researcher'
        }}
      />

      {/* Video Call Modal */}
      <VideoCallModal
        isOpen={showVideoCall}
        onClose={() => setShowVideoCall(false)}
        roomName={videoRoom}
      />
    </div>
  );
}
