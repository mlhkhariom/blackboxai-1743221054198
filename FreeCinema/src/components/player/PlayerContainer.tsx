
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause } from "lucide-react";
import VideoPlayer from '../VideoPlayer';
import PlayerControls from './PlayerControls';
import PlayerLoading from './PlayerLoading';

interface PlayerContainerProps {
  isMovie: boolean;
  contentId: number;
  imdbId?: string;
  selectedSeason?: number;
  selectedEpisode?: number;
  title?: string;
  episodeTitle?: string;
  isLoading: boolean;
  playerError: string | null;
  setPlayerError: (error: string | null) => void;
}

const PlayerContainer = ({
  isMovie,
  contentId,
  imdbId,
  selectedSeason,
  selectedEpisode,
  title,
  episodeTitle,
  isLoading,
  playerError,
  setPlayerError
}: PlayerContainerProps) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const playerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (showControls) {
      timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    
    return () => {
      clearTimeout(timer);
    };
  }, [showControls]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPlaying(true);
    }, 2500);
    
    return () => clearTimeout(timer);
  }, [isLoading]);
  
  const handlePlayerError = (error: string) => {
    setPlayerError(error);
  };
  
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };
  
  const handleMouseMove = () => {
    setShowControls(true);
  };
  
  return (
    <div 
      ref={playerRef}
      className="relative overflow-hidden rounded-xl shadow-2xl"
      onMouseMove={handleMouseMove}
    >
      <div className="freecinema-player relative aspect-video w-full bg-black">
        <VideoPlayer
          tmdbId={contentId}
          imdbId={imdbId}
          type={isMovie ? 'movie' : 'tv'}
          season={!isMovie ? selectedSeason : undefined}
          episode={!isMovie ? selectedEpisode : undefined}
          onError={handlePlayerError}
        />
        
        <AnimatePresence>
          <PlayerLoading 
            isLoading={isLoading}
            isMovie={isMovie}
            title={title}
            episodeTitle={episodeTitle}
            selectedEpisode={selectedEpisode}
          />
        </AnimatePresence>
        
        <AnimatePresence>
          {!isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 z-10 flex items-center justify-center"
              onClick={togglePlay}
            >
              {!isPlaying && (
                <motion.div 
                  className="rounded-full bg-moviemate-primary/80 p-5 backdrop-blur-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Play size={40} className="text-white" />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        <PlayerControls 
          isLoading={isLoading}
          isPlaying={isPlaying}
          isMuted={isMuted}
          progress={progress}
          volume={volume}
          showControls={showControls}
          togglePlay={togglePlay}
          toggleMute={toggleMute}
          toggleFullscreen={toggleFullscreen}
          handleVolumeChange={handleVolumeChange}
          setProgress={setProgress}
        />
      </div>
      
      <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-moviemate-primary/10 blur-3xl"></div>
      <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-purple-700/10 blur-3xl"></div>
    </div>
  );
};

export default PlayerContainer;
