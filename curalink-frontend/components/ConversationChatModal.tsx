'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageSquare } from 'lucide-react';
import { chatAPI } from '@/lib/api';

interface ConversationChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  otherUser: { id: number; full_name: string } | null;
}

interface MessageItem {
  id?: number;
  sender_id?: number;
  receiver_id?: number;
  message: string;
  created_at?: string;
}

export default function ConversationChatModal({ isOpen, onClose, otherUser }: ConversationChatModalProps) {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  // In the browser, setInterval returns a number
  const pollRef = useRef<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    if (!isOpen || !otherUser) return;

    const loadMessages = async () => {
      try {
        const res = await chatAPI.getMessages(otherUser.id);
        setMessages(res.data || []);
        setTimeout(scrollToBottom, 100);
      } catch (e) {}
    };

    loadMessages();
    pollRef.current = window.setInterval(loadMessages, 2500);

    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [isOpen, otherUser?.id]);

  const send = async () => {
    if (!input.trim() || !otherUser) return;
    setLoading(true);
    try {
      await chatAPI.sendMessage({ receiver_id: otherUser.id, message: input.trim() });
      setInput('');
      const res = await chatAPI.getMessages(otherUser.id);
      setMessages(res.data || []);
      setTimeout(scrollToBottom, 100);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && otherUser && (
        <>
          <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose} />
          <motion.div
            className="fixed top-24 left-1/2 -translate-x-1/2 w-[95%] md:w-[720px] h-[75vh] bg-white rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
            initial={{ opacity: 0, scale: .95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: .95 }}
          >
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><MessageSquare className="w-5 h-5"/></div>
                <div>
                  <h3 className="text-lg font-bold">Chat with {otherUser.full_name}</h3>
                  <p className="text-xs text-white/80">Private conversation</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full"><X className="w-6 h-6"/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-gray-50">
              {messages.map((m, idx) => {
                let currentUserId: number | null = null;
                if (typeof window !== 'undefined') {
                  try {
                    const userStr = localStorage.getItem('user');
                    if (userStr) {
                      const u = JSON.parse(userStr);
                      currentUserId = Number(u?.id ?? u?.user?.id ?? null);
                    }
                  } catch {}
                }
                const fromMe = currentUserId !== null && currentUserId === m.sender_id;
                return (
                <div key={idx} className={`flex ${fromMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-4 py-2 rounded-2xl shadow ${fromMe ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white' : 'bg-white text-gray-800'}`}>
                    <p className="text-sm leading-relaxed whitespace-pre-line">{m.message}</p>
                    {m.created_at && <p className={`text-[10px] mt-1 ${fromMe ? 'text-white/70' : 'text-gray-500'}`}>{new Date(m.created_at).toLocaleTimeString()}</p>}
                  </div>
                </div>
              );})}
              <div ref={bottomRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center gap-2">
                <input autoFocus value={input} onChange={e=>setInput(e.target.value)} onKeyDown={(e)=> e.key==='Enter' && send()} placeholder="Type your message..." className="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 text-gray-900 placeholder-gray-400"/>
                <motion.button whileHover={{scale:1.05}} whileTap={{scale:.95}} disabled={loading || !input.trim()} onClick={send} className="p-3 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white disabled:opacity-50"><Send className="w-5 h-5"/></motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
