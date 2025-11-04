'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Brain, Users, MessageCircle, FileText, LogOut, Menu, Home, BookOpen, Plus, Sun, Moon
} from 'lucide-react';
import { forumsAPI, meetingsAPI, notificationsAPI } from '@/lib/api';
import CreateForumModal from '@/components/CreateForumModal';
import ConversationChatModal from '@/components/ConversationChatModal';
import VideoCallModal from '@/components/VideoCallModal';
import NotificationDropdown from '@/components/NotificationDropdown';
import NotificationBanner from '@/components/NotificationBanner';
import { useNotifications } from '@/contexts/NotificationContext';
import { useTheme } from '@/contexts/ThemeContext';
import ChatModal from '@/components/ChatModal';

interface User {
  id: string;
  full_name: string;
  specialization?: string;
}

interface Forum {
  id: string;
  title: string;
  description: string;
  created_at: string;
  author: { full_name: string };
  category?: string;
}

interface Meeting {
  id: string;
  _id?: string;
  status: string;
  message: string;
  description?: string;
  organizer_id: string;
  organizer?: { id: string; full_name: string };
  requester?: { id: string; full_name: string };
  scheduled_time?: string;
  populated_participants?: { id: string; full_name: string }[];
}


export default function ResearcherDashboard() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { 
    notifications, 
    unreadCount, 
    activeBanner, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    dismissBanner 
  } = useNotifications();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [forums, setForums] = useState<Forum[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForum, setShowCreateForum] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatUser] = useState<{ id: number; full_name: string } | null>(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoRoom, setVideoRoom] = useState<string>('');

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

  // Lightweight polling to refresh meetings every 30s for near real-time updates
  useEffect(() => {
    const id = window.setInterval(() => {
      loadData();
    }, 30000);
    return () => window.clearInterval(id);
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [forumsRes, meetingsRes] = await Promise.all([
        forumsAPI.getAll().catch(() => ({ data: [] })),
        meetingsAPI.getAll().catch(() => ({ data: [] }))
      ]);
      
      setForums(forumsRes.data || []);
      setMeetings(meetingsRes.data || []);
    } catch (error: unknown) {
      console.error('Error loading data:', error);
      setError((error as { message?: string })?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Parse preferred date-time embedded in the meeting.message
  const parsePreferredDate = (msg: string): Date | null => {
    // Expect line: "Preferred Date & Time: <human readable>"
    try {
      const m = msg.split('\n').find((line) => line.toLowerCase().startsWith('preferred date & time'));
      if (!m) return null;
      const parts = m.split(':');
      const text = parts.slice(1).join(':').trim();
      const d = new Date(text);
      return isNaN(d.getTime()) ? null : d;
    } catch {
      return null;
    }
  };

  // Local reminders for accepted meetings within next 10 minutes
  useEffect(() => {
    if (!meetings?.length) return;
    const interval = window.setInterval(() => {
      const now = new Date().getTime();
      meetings
        .filter((m: Meeting) => m.status === 'accepted')
        .forEach((m: Meeting) => {
          const d = parsePreferredDate(m.message);
          if (!d) return;
          const diff = d.getTime() - now;
          if (diff > 0 && diff < 10 * 60 * 1000) {
            // Show an in-app alert once; mark as notified in sessionStorage
            const key = `meeting_notified_${m.id}`;
            if (!sessionStorage.getItem(key)) {
              alert(`Reminder: Meeting with ${m.requester?.full_name} at ${d.toLocaleString()}`);
              sessionStorage.setItem(key, '1');
            }
          }
        });
    }, 60 * 1000);
    return () => window.clearInterval(interval);
  }, [meetings]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 transition-colors duration-300">
      <motion.aside
        animate={{ x: sidebarOpen ? 0 : -300 }}
        className="fixed left-0 top-0 h-full w-72 bg-white dark:bg-slate-800 shadow-2xl border-r border-gray-200 dark:border-slate-700 z-50 p-6 transition-colors duration-300"
      >
        <div className="flex items-center gap-3 mb-8">
          <Brain className="w-10 h-10 text-secondary-500" />
          <h1 className="text-2xl font-bold gradient-text">CuraLink</h1>
        </div>

        <nav className="space-y-2">
          {[
            { id: 'dashboard', icon: Home, label: 'Dashboard' },
            { id: 'collaborators', icon: Users, label: 'Collaborators' },
            { id: 'forums', icon: MessageCircle, label: 'Forums' },
            { id: 'trials', icon: FileText, label: 'My Trials' },
            { id: 'meetings', icon: BookOpen, label: 'Meetings' },
          ].map((item) => (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-secondary-500 to-accent-500 text-white shadow-lg'
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

      <div className={`transition-all ${sidebarOpen ? 'ml-72' : 'ml-0'}`}>
        <header className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg border-b border-gray-200 dark:border-slate-700 px-8 py-4 sticky top-0 z-40 shadow-sm transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-900 dark:text-white transition-colors">
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, Dr. {user?.full_name?.split(' ')[0]}!</h2>
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
                  const notification = notifications.find(n => n.id === notificationId);
                  console.log('Notification action:', action, 'ID:', notificationId);
                  
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
                        loadData();
                        return;
                      }
                      
                      // Handle meeting request
                      if (notification?.meeting_id) {
                        console.log('Updating meeting status:', notification.meeting_id, action === 'accept' ? 'accepted' : 'rejected');
                        await meetingsAPI.updateStatus(notification.meeting_id, action === 'accept' ? 'accepted' : 'rejected');
                        markAsRead(notificationId);
                        loadData(); 
                        alert(`Meeting ${action === 'accept' ? 'accepted' : 'declined'} successfully!`);
                      } else {
                        console.error('No meeting_id found in notification');
                        alert('Error: Could not find meeting ID');
                      }
                    } catch {
                      console.error('Failed to update meeting status');
                      alert('Failed to update meeting status');
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
                          organizer_id: notification.sender_id,
                          organizer: {
                            id: notification.sender_id,
                            full_name: notification.message.split(' from ')[1] || 'Patient'
                          }
                        });
                        setShowChat(true);
                        markAsRead(notificationId);
                      }
                    } catch (error) {
                      console.error('Failed to open chat:', error);
                    }
                  }
                }}
              />
            </div>
          </div>
        </header>

        <main className="p-8 bg-gradient-to-br from-blue-50 via-indigo-50 via-purple-50 to-cyan-50 dark:from-slate-900 dark:via-blue-900/20 dark:via-indigo-900/20 dark:to-cyan-900/20 min-h-screen relative overflow-hidden">
          {/* Premium background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
            <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-gradient-to-br from-indigo-400/15 to-blue-400/15 rounded-full blur-3xl"></div>
          </div>
          <div className="relative z-10">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-blue-500 border-r-purple-500"></div>
                <div className="absolute inset-0 animate-pulse rounded-full h-16 w-16 border-4 border-transparent border-b-pink-500 border-l-cyan-500"></div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6">
              <p className="font-semibold">Error loading data:</p>
              <p>{error}</p>
              <button onClick={loadData} className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Retry
              </button>
            </div>
          )}
          
          {!loading && !error && activeTab === 'dashboard' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {[
                  { 
                    label: 'Active Collaborations', 
                    value: 12, 
                    icon: Users, 
                    gradient: 'from-blue-600 via-indigo-600 to-purple-600',
                    bgGradient: 'from-blue-50/90 via-indigo-50/90 to-purple-50/90 dark:from-blue-900/40 dark:via-indigo-900/40 dark:to-purple-900/40',
                    glowColor: 'shadow-blue-500/30',
                    textGradient: 'from-blue-700 via-indigo-700 to-purple-700'
                  },
                  { 
                    label: 'Forum Posts', 
                    value: forums.length, 
                    icon: MessageCircle, 
                    gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
                    bgGradient: 'from-emerald-50/90 via-teal-50/90 to-cyan-50/90 dark:from-emerald-900/40 dark:via-teal-900/40 dark:to-cyan-900/40',
                    glowColor: 'shadow-emerald-500/30',
                    textGradient: 'from-emerald-700 via-teal-700 to-cyan-700'
                  },
                  { 
                    label: 'Meeting Requests', 
                    value: meetings.length, 
                    icon: BookOpen, 
                    gradient: 'from-orange-600 via-amber-600 to-yellow-600',
                    bgGradient: 'from-orange-50/90 via-amber-50/90 to-yellow-50/90 dark:from-orange-900/40 dark:via-amber-900/40 dark:to-yellow-900/40',
                    glowColor: 'shadow-orange-500/30',
                    textGradient: 'from-orange-700 via-amber-700 to-yellow-700'
                  },
                ].map((stat, index) => (
                  <motion.div 
                    key={stat.label} 
                    className={`bg-gradient-to-br ${stat.bgGradient} backdrop-blur-2xl rounded-[2.5rem] p-10 shadow-2xl hover:shadow-4xl ${stat.glowColor} transition-all duration-700 border border-white/40 dark:border-white/20 relative overflow-hidden group`} 
                    whileHover={{ y: -15, scale: 1.05, rotateY: 8, rotateX: 2 }}
                    initial={{ opacity: 0, y: 50, rotateX: 15 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ delay: index * 0.25, type: "spring", stiffness: 80, damping: 15 }}
                  >
                    {/* Premium animated background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                    
                    {/* Floating particles with different sizes */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute top-6 right-6 w-3 h-3 bg-white/50 rounded-full animate-pulse"></div>
                      <div className="absolute bottom-10 left-8 w-2 h-2 bg-white/40 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
                      <div className="absolute top-1/3 right-10 w-1 h-1 bg-white/30 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
                      <div className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 bg-white/25 rounded-full animate-ping" style={{animationDelay: '2.5s'}}></div>
                    </div>
                    
                    {/* Gradient border effect */}
                    <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-r from-white/20 via-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-10">
                        <div className={`p-7 rounded-[2rem] bg-gradient-to-br ${stat.gradient} text-white shadow-2xl transform group-hover:scale-130 group-hover:rotate-12 transition-all duration-700 relative overflow-hidden`}>
                          <div className="absolute inset-0 bg-white/30 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <stat.icon className="w-14 h-14 relative z-10 drop-shadow-lg" />
                        </div>
                      </div>
                      <div>
                        <h3 className={`text-8xl font-black mb-5 bg-gradient-to-r ${stat.textGradient} bg-clip-text text-transparent drop-shadow-lg filter`}>
                          {stat.value}
                        </h3>
                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-wide leading-tight">{stat.label}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Forum Activity</h3>
                  <motion.button
                    onClick={() => setShowCreateForum(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-secondary-500 to-accent-500 text-white font-medium flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-5 h-5" />
                    Create Forum
                  </motion.button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {forums.slice(0, 4).map((forum) => (
                    <motion.div key={forum.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-slate-700" whileHover={{ y: -5 }}>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{forum.title}</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{forum.description}</p>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-secondary-100 to-secondary-200 text-secondary-700">
                        {forum.category}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Pending Meeting Requests ({meetings.filter((m: Meeting) => m.status === 'pending').length})</h3>
                <div className="space-y-4">
                  {meetings.filter((m: Meeting) => m.status === 'pending').length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center shadow-lg border border-gray-100 dark:border-slate-700">
                      <p className="text-gray-500 dark:text-gray-400">No pending meeting requests</p>
                    </div>
                  ) : (
                    meetings.filter((m: Meeting) => m.status === 'pending').slice(0, 5).map((meeting: Meeting) => (
                    <motion.div key={meeting.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 flex items-center justify-between shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-slate-700" whileHover={{ x: 5 }}>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-1 text-lg">{meeting.requester?.full_name}</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{meeting.message}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={async () => {
                            try {
                              await meetingsAPI.updateStatus(meeting.id, 'accepted');
                              alert(`Meeting request from ${meeting.requester?.full_name} accepted! You can now schedule the meeting.`);
                              loadData();
                            } catch (error) {
                              alert('Failed to accept meeting request');
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 hover:shadow-lg transition-all"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={async () => {
                            try {
                              await meetingsAPI.updateStatus(meeting.id, 'declined');
                              alert('Meeting request declined');
                              loadData();
                            } catch (error) {
                              alert('Failed to decline meeting request');
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 hover:shadow-lg transition-all"
                        >
                          Decline
                        </button>
                      </div>
                    </motion.div>
                  )))}
                </div>
              </div>


              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Accepted Meetings ({meetings.filter((m: Meeting) => m.status === 'accepted' || m.status === 'scheduled').length})</h3>
                <div className="space-y-4">
                  {meetings.filter((m: Meeting) => m.status === 'accepted' || m.status === 'scheduled').length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center shadow-lg border border-gray-100 dark:border-slate-700">
                      <p className="text-gray-500 dark:text-gray-400">No accepted meetings yet</p>
                    </div>
                  ) : (
                    meetings.filter((m: Meeting) => m.status === 'accepted' || m.status === 'scheduled').slice(0, 5).map((meeting: Meeting) => (
                    <motion.div key={meeting.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 flex items-center justify-between shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-slate-700" whileHover={{ x: 5 }}>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-1 text-lg">{meeting.organizer?.full_name || 'Patient'}</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{meeting.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Scheduled: {meeting.scheduled_time ? new Date(meeting.scheduled_time).toLocaleString() : 'Not scheduled'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={async () => {
                            try {
                              const roomName = `curalink-meeting-${meeting.id}`;
                              
                              // Send video call notification to patient (organizer)
                              await notificationsAPI.sendVideoCall({
                                receiver_id: meeting.organizer_id,
                                room_name: roomName
                              });
                              
                              // Show success message
                              const patientName = meeting.organizer?.full_name || 'Patient';
                              alert(`Video call invitation sent to ${patientName}. Waiting for response...`);
                            } catch (error) {
                              console.error('Failed to send video call invitation:', error);
                              alert('Failed to send video call invitation. Please try again.');
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 hover:shadow-lg transition-all"
                        >
                          Start Meeting
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedMeeting(meeting);
                            setShowChat(true);
                          }}
                          className="px-4 py-2 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 hover:shadow-lg transition-all"
                        >
                          Chat
                        </button>
                        <button 
                          onClick={async () => {
                            if (confirm('Are you sure you want to delete this meeting?')) {
                              try {
                                const meetingId = meeting._id || meeting.id;
                                console.log('Deleting meeting with ID:', meetingId);
                                await meetingsAPI.cancel(meetingId);
                                loadData(); // Reload data
                              } catch {
                                console.error('Failed to delete meeting');
                                alert('Failed to delete meeting');
                              }
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 hover:shadow-lg transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  )))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'collaborators' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Research Collaborators</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Sample collaborators - in real app, this would come from API */}
                {[
                  { id: 1, name: "Dr. Sarah Johnson", specialty: "Oncology", institution: "Stanford Medical Center", projects: 5, status: "active" },
                  { id: 2, name: "Dr. Michael Chen", specialty: "Cardiology", institution: "Mayo Clinic", projects: 3, status: "active" },
                  { id: 3, name: "Dr. Emily Rodriguez", specialty: "Neurology", institution: "Johns Hopkins", projects: 7, status: "pending" },
                  { id: 4, name: "Dr. James Wilson", specialty: "Immunology", institution: "Harvard Medical", projects: 2, status: "active" },
                ].map((collaborator) => (
                  <motion.div key={collaborator.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 text-center shadow-lg hover:shadow-2xl transition-all border border-gray-100 dark:border-slate-700" whileHover={{ y: -5 }}>
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary-400 to-accent-400 mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                      {collaborator.name.charAt(0)}
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{collaborator.name}</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">{collaborator.specialty}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{collaborator.institution}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">{collaborator.projects} projects</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        collaborator.status === 'active' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {collaborator.status}
                      </span>
                    </div>
                    <button className="w-full mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-secondary-500 to-accent-500 text-white font-semibold hover:shadow-lg transition-all">
                      View Profile
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'trials' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">My Clinical Trials</h2>
              <div className="space-y-6">
                {/* Sample trials - in real app, this would come from API */}
                {[
                  { 
                    id: 1, 
                    title: "Phase II Study of Novel Immunotherapy in Advanced Melanoma", 
                    phase: "Phase II", 
                    status: "Recruiting", 
                    participants: 45, 
                    target: 100,
                    startDate: "2024-01-15",
                    location: "Multiple Centers"
                  },
                  { 
                    id: 2, 
                    title: "Biomarker-Driven Precision Medicine Approach for Lung Cancer", 
                    phase: "Phase I", 
                    status: "Active", 
                    participants: 23, 
                    target: 50,
                    startDate: "2024-03-01",
                    location: "Stanford Medical Center"
                  },
                  { 
                    id: 3, 
                    title: "Combination Therapy for Treatment-Resistant Breast Cancer", 
                    phase: "Phase III", 
                    status: "Completed", 
                    participants: 200, 
                    target: 200,
                    startDate: "2023-06-01",
                    location: "Multi-site International"
                  }
                ].map((trial) => (
                  <motion.div key={trial.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-slate-700" whileHover={{ x: 5 }}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 dark:from-primary-900/30 dark:to-primary-800/30 dark:text-primary-300">
                            {trial.phase}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            trial.status === 'Recruiting' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                            trial.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                          }`}>
                            {trial.status}
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{trial.title}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Participants:</span>
                            <p className="font-semibold text-gray-900 dark:text-white">{trial.participants}/{trial.target}</p>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Started:</span>
                            <p className="font-semibold text-gray-900 dark:text-white">{new Date(trial.startDate).toLocaleDateString()}</p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-600 dark:text-gray-400">Location:</span>
                            <p className="font-semibold text-gray-900 dark:text-white">{trial.location}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button className="px-4 py-2 rounded-xl bg-secondary-500 text-white font-semibold hover:bg-secondary-600 transition-all">
                          Manage
                        </button>
                        <button className="px-4 py-2 rounded-xl bg-gray-500 text-white font-semibold hover:bg-gray-600 transition-all">
                          View Data
                        </button>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-secondary-500 to-accent-500 h-2 rounded-full transition-all"
                        style={{ width: `${(trial.participants / trial.target) * 100}%` }}
                      ></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'forums' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Discussion Forums</h2>
                <motion.button
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-secondary-500 to-accent-500 text-white font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-5 h-5" />
                  Create New Forum
                </motion.button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {forums.map((forum) => (
                  <motion.div key={forum.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-gray-100 dark:border-slate-700" whileHover={{ y: -5 }}>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{forum.title}</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{forum.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-secondary-100 to-secondary-200 text-secondary-700">
                        {forum.category}
                      </span>
                      <button className="text-secondary-500 hover:text-secondary-600 font-semibold">
                        View Posts →
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
            console.log('Banner action:', action, 'ID:', notificationId);
            
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
                  loadData();
                  return;
                }
                
                // Handle meeting request
                if (notification?.meeting_id) {
                  console.log('Banner updating meeting:', notification.meeting_id);
                  await meetingsAPI.updateStatus(notification.meeting_id, action === 'accept' ? 'accepted' : 'rejected');
                  markAsRead(notificationId);
                  dismissBanner();
                  loadData(); // Reload data to show updated meetings
                  alert(`Meeting ${action === 'accept' ? 'accepted' : 'declined'} successfully!`);
                }
              } catch (error) {
                console.error('Failed to update meeting status:', error);
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
                    organizer_id: notification.sender_id,
                    organizer: {
                      id: notification.sender_id,
                      full_name: notification.message.split(' from ')[1] || 'Patient'
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
      <CreateForumModal
        isOpen={showCreateForum}
        onClose={() => setShowCreateForum(false)}
        onSuccess={() => {
          loadData();
        }}
      />

      <ConversationChatModal
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        otherUser={chatUser}
      />

      <VideoCallModal
        isOpen={videoOpen}
        onClose={() => setVideoOpen(false)}
        roomName={videoRoom}
      />

      {/* Meeting Video Call Modal */}
      <VideoCallModal
        isOpen={showVideoCall}
        onClose={() => setShowVideoCall(false)}
        roomName={videoRoom}
      />

      {/* Meeting Chat Modal */}
      <ChatModal
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        otherUser={{
          id: selectedMeeting?.organizer_id || '',
          name: selectedMeeting?.organizer?.full_name || 'Patient'
        }}
      />
    </div>
  );
}
