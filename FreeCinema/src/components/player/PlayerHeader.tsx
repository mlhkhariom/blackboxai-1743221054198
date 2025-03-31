
import { Film, PlayCircle } from "lucide-react";
import { motion } from 'framer-motion';

interface PlayerHeaderProps {
  isMovie: boolean;
  selectedSeason?: number;
  selectedEpisode?: number;
  episodeTitle?: string;
  title?: string;
  playerError: string | null;
  resetError: () => void;
}

const PlayerHeader = ({ 
  isMovie, 
  selectedSeason, 
  selectedEpisode, 
  episodeTitle, 
  title,
  playerError,
  resetError
}: PlayerHeaderProps) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-moviemate-primary">
            <Film size={16} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            {isMovie ? 'Now Playing' : (
              episodeTitle ? 
                `${episodeTitle} (S${selectedSeason}:E${selectedEpisode})` : 
                `Season ${selectedSeason}, Episode ${selectedEpisode}`
            )}
          </h2>
        </div>
        
        {playerError && (
          <motion.button 
            onClick={resetError}
            className="flex items-center gap-1 rounded-full bg-moviemate-primary px-4 py-1 text-xs font-medium text-white transition-colors hover:bg-opacity-90"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PlayCircle size={14} />
            Try Again
          </motion.button>
        )}
      </div>
      
      <div className="mt-2 flex items-center">
        <div className="h-0.5 w-16 rounded-full bg-gradient-to-r from-moviemate-primary to-transparent"></div>
        <p className="ml-2 text-xs text-gray-400">
          {title && `${title} | `}
          FreeCinema Premium
        </p>
      </div>
    </div>
  );
};

export default PlayerHeader;
