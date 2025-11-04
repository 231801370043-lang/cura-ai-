"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function MeetingVideoPage() {
  const params = useParams<{ meetingId: string }>();
  const meetingId = params.meetingId;
  const router = useRouter();
  const [room, setRoom] = useState<string>("");

  useEffect(() => {
    setRoom(`curalink-meeting-${meetingId}`);
  }, [meetingId]);

  const jitsiUrl = `https://meet.jit.si/${encodeURIComponent(room)}#config.prejoinPageEnabled=true&interfaceConfig.TOOLBAR_BUTTONS=%5B'microphone','camera','desktop','chat','raisehand','tileview','hangup'%5D`;

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <header className="bg-black/70 text-white border-b border-white/10 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-sm font-semibold">Video Meeting</h1>
          <p className="text-[11px] text-white/70">Room: {room}</p>
        </div>
      </header>

      <main className="flex-1">
        {room && (
          <iframe
            title="Jitsi Meeting"
            src={jitsiUrl}
            allow="camera; microphone; fullscreen; display-capture"
            className="w-full h-[calc(100vh-56px)]"
          />
        )}
      </main>
    </div>
  );
}
