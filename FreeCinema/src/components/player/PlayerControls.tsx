
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward,
  Info,
  Film
} from "lucide-react";

interface PlayerControlsProps {
  isLoading: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  progress: number;
  volume: number;
  showControls: boolean;
  togglePlay: () => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  handleVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setProgress: (value: number) => void;
}

const PlayerControls = ({
  isLoading,
  isPlaying,
  isMuted,
  progress,
  volume,
  showControls,
  togglePlay,
  toggleMute,
  toggleFullscreen,
  handleVolumeChange,
  setProgress
}: PlayerControlsProps) => {
  if (isLoading || !showControls) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="freecinema-player-controls absolute inset-0 z-20 flex flex-col justify-between bg-gradient-to-t from-black/70 to-transparent p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-moviemate-primary">
              <Film size={12} className="text-white" />
            </div>
            <span className="text-sm font-medium text-white">FreeCinema</span>
          </div>
          
          <div>
            <button 
              className="freecinema-glass-button"
              onClick={() => {}}
            >
              <Info size={16} className="text-white" />
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          <div 
            className="freecinema-progress" 
            onClick={() => setProgress(Math.random() * 100)}
          >
            <div 
              className="freecinema-progress-bar" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button 
                className="freecinema-glass-button"
                onClick={togglePlay}
              >
                {isPlaying ? 
                  <Pause size={18} className="text-white" /> : 
                  <Play size={18} className="text-white" />
                }
              </button>
              
              <button className="freecinema-glass-button">
                <SkipBack size={18} className="text-white" />
              </button>
              
              <button className="freecinema-glass-button">
                <SkipForward size={18} className="text-white" />
              </button>
              
              <div className="group relative flex items-center">
                <button 
                  className="freecinema-glass-button"
                  onClick={toggleMute}
                >
                  {isMuted || volume === 0 ? 
                    <VolumeX size={18} className="text-white" /> : 
                    <Volume2 size={18} className="text-white" />
                  }
                </button>
                
                <div className="ml-2 hidden items-center group-hover:flex">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="freecinema-volume-slider"
                  />
                </div>
              </div>
              
              <span className="ml-2 text-xs text-white">
                {Math.floor(progress / 100 * 120)} / 120 min
              </span>
            </div>
            
            <div>
              <button 
                className="freecinema-glass-button"
                onClick={toggleFullscreen}
              >
                <Maximize size={18} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PlayerControls;
