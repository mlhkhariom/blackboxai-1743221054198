
import { useEffect, useRef, useState } from 'react';
import { Script } from '@/components/ui/script';
import { useToast } from '@/components/ui/use-toast';

interface PlayerVideoProps {
  streamUrl: string;
  posterImage?: string;
  autoPlay?: boolean;
  muted?: boolean;
  volume?: number;
  onPlaying?: () => void;
  onPaused?: () => void;
  onError?: (error: string) => void;
  onReady?: () => void;
}

const PlayerVideo = ({
  streamUrl,
  posterImage,
  autoPlay = true,
  muted = false,
  volume = 0.8,
  onPlaying,
  onPaused,
  onError,
  onReady
}: PlayerVideoProps) => {
  const [jwPlayerReady, setJwPlayerReady] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const jwPlayerRef = useRef<any>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Set up JW Player when ready and we have the stream URL
    if (jwPlayerReady && streamUrl && playerContainerRef.current) {
      try {
        // Clean up previous player instance if it exists
        if (jwPlayerRef.current) {
          try {
            jwPlayerRef.current.remove();
          } catch (e) {
            console.error("Error removing previous player:", e);
          }
        }
        
        // Initialize new player instance
        jwPlayerRef.current = window.jwplayer(playerContainerRef.current.id);
        
        // Configure and setup player
        jwPlayerRef.current.setup({
          file: streamUrl,
          image: posterImage,
          width: '100%',
          aspectratio: '16:9',
          mute: muted,
          volume: volume * 100,
          autostart: autoPlay,
          primary: 'html5',
          hlshtml: true,
          cast: {},
          playbackRateControls: true,
          stretching: 'uniform',
          skin: {
            name: "netflix"
          }
        });

        // Player event listeners
        jwPlayerRef.current.on('ready', () => {
          console.log('JW Player is ready');
          onReady?.();
        });

        jwPlayerRef.current.on('error', (e: any) => {
          console.error("JW Player error:", e);
          onError?.(e.message || 'Error playing video');
        });

        jwPlayerRef.current.on('play', () => {
          console.log('JW Player started playing');
          onPlaying?.();
        });

        jwPlayerRef.current.on('pause', () => {
          console.log('JW Player paused');
          onPaused?.();
        });
        
      } catch (error) {
        console.error('JW Player initialization error:', error);
        onError?.('Failed to initialize player');
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (jwPlayerRef.current) {
        try {
          jwPlayerRef.current.remove();
        } catch (err) {
          console.error("Error cleaning up JW Player:", err);
        }
      }
    };
  }, [jwPlayerReady, streamUrl, posterImage, autoPlay, muted, volume, onPlaying, onPaused, onError, onReady]);
  
  return (
    <div className="relative w-full h-full">
      <Script 
        src="https://cdn.jwplayer.com/libraries/IDzF9Zmk.js" 
        async 
        defer
        onLoad={() => setJwPlayerReady(true)}
        onError={() => onError?.("Failed to load player. Please refresh the page and try again.")}
      />
      
      <div 
        id="player-video-container" 
        ref={playerContainerRef} 
        className="h-full w-full"
      />
    </div>
  );
};

export default PlayerVideo;
