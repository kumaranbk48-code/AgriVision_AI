import React, { useRef, useState, useEffect } from 'react';

interface StartupVideoProps {
  onComplete: () => void;
}

export function StartupVideo({ onComplete }: StartupVideoProps) {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Autoplay requires mute in most browsers initially
    if (videoRef.current) {
      videoRef.current.play().catch(e => {
        console.warn("Video autoplay failed", e);
      });
    }
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <video
        ref={videoRef}
        src="/startup_video.mp4"
        className="w-full h-full object-cover"
        autoPlay
        muted={isMuted}
        onEnded={onComplete}
        playsInline
      />
      
      <button
        onClick={onComplete}
        className="absolute top-4 left-4 z-50 bg-white/20 hover:bg-white/40 text-white px-4 py-2 rounded-md backdrop-blur-sm transition-all"
      >
        Skip Video
      </button>

      <button
        onClick={toggleMute}
        className="absolute top-4 right-4 z-50 bg-white/20 hover:bg-white/40 text-white px-4 py-2 rounded-md backdrop-blur-sm transition-all"
      >
        {isMuted ? 'Unmute' : 'Mute'}
      </button>
    </div>
  );
}
