'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X, Video } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string; // e.g., curalink-meeting-123
}

export default function VideoCallModal({ isOpen, onClose, roomName }: VideoCallModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Nothing required; using Jitsi IFrame API via public instance
  }, [roomName]);

  const jitsiUrl = `https://meet.jit.si/${encodeURIComponent(roomName)}#config.prejoinPageEnabled=true&interfaceConfig.TOOLBAR_BUTTONS=%5B'microphone','camera','desktop','chat','raisehand','tileview','hangup'%5D`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose} />
          <motion.div
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0, scale: .95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: .95 }}
          >
            <div className="w-full max-w-[95%] md:max-w-[960px] h-[80vh] bg-black rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-secondary-500 to-accent-500 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"><Video className="w-5 h-5"/></div>
                <div>
                  <h3 className="text-lg font-bold">Video Meeting</h3>
                  <p className="text-xs text-white/80">Room: {roomName}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full"><X className="w-6 h-6"/></button>
            </div>

            <iframe
              ref={iframeRef}
              title="Jitsi Meeting"
              src={jitsiUrl}
              allow="camera; microphone; fullscreen; display-capture"
              className="flex-1 w-full"
            />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
