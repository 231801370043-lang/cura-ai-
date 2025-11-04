"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { chatAPI } from "@/lib/api";
import { motion } from "framer-motion";
import { ArrowLeft, Send } from "lucide-react";

interface MessageItem {
  id?: number;
  sender_id?: number;
  receiver_id?: number;
  message: string;
  created_at?: string;
}

export default function ChatPage() {
  const params = useParams<{ userId: string }>();
  const router = useRouter();
  const otherUserId = params.userId;
  const [otherUserName, setOtherUserName] = useState<string>("Conversation");
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const pollRef = useRef<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    // Try to read name from query/localStorage user cache if available
    try {
      const cached = sessionStorage.getItem(`chat_user_${otherUserId}`);
      if (cached) setOtherUserName(cached);
    } catch {}
  }, [otherUserId]);

  useEffect(() => {
    if (!otherUserId) return;

    const load = async () => {
      try {
        console.log('Loading messages for user:', otherUserId);
        const res = await chatAPI.getMessages(otherUserId);
        console.log('Chat page messages loaded:', res.data);
        setMessages(res.data || []);
        setTimeout(scrollToBottom, 100);
      } catch (e) {
        console.error('Failed to load messages in chat page:', e);
      }
    };

    load();
    pollRef.current = window.setInterval(load, 2500);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [otherUserId]);

  const send = async () => {
    if (!input.trim() || !otherUserId) return;
    setLoading(true);
    try {
      console.log('Sending message to:', otherUserId, 'Message:', input.trim());
      await chatAPI.sendMessage({ receiver_id: otherUserId, message: input.trim() });
      setInput("");
      console.log('Message sent, reloading messages...');
      const res = await chatAPI.getMessages(otherUserId);
      setMessages(res.data || []);
      setTimeout(scrollToBottom, 100);
    } catch (e) {
      console.error('Failed to send message in chat page:', e);
    } finally {
      setLoading(false);
    }
  };

  // current user id
  const getMe = (): number | null => {
    try {
      const uStr = localStorage.getItem("user");
      if (!uStr) return null;
      const u = JSON.parse(uStr);
      return Number(u?.id ?? u?.user?.id ?? null);
    } catch {
      return null;
    }
  };
  const me = getMe();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Chat with {otherUserName}</h1>
            <p className="text-xs text-gray-500">Private conversation</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto h-[calc(100vh-140px)] flex flex-col px-4">
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {messages.map((m, i) => {
            const fromMe = me !== null && me === m.sender_id;
            return (
              <div key={i} className={`flex ${fromMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] px-4 py-2 rounded-2xl shadow ${fromMe ? "bg-gradient-to-r from-primary-500 to-secondary-500 text-white" : "bg-white text-gray-800"}`}>
                  <p className="text-sm whitespace-pre-line">{m.message}</p>
                  {m.created_at && (
                    <p className={`text-[10px] mt-1 ${fromMe ? "text-white/70" : "text-gray-500"}`}>
                      {new Date(m.created_at).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="py-3">
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 text-gray-900 placeholder-gray-400"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading || !input.trim()}
              onClick={send}
              className="px-4 py-3 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </motion.button>
          </div>
        </div>
      </main>
    </div>
  );
}
