
import { motion } from 'framer-motion';
import { Loader, Film, Tv, Clock } from "lucide-react";

interface PlayerLoadingProps {
  isLoading: boolean;
  title?: string;
  episodeTitle?: string;
  isMovie: boolean;
  selectedEpisode?: number;
}

const PlayerLoading = ({ 
  isLoading, 
  title, 
  episodeTitle, 
  isMovie, 
  selectedEpisode 
}: PlayerLoadingProps) => {
  if (!isLoading) return null;

  // Calculate a random loading time between 15-120 seconds for display purposes
  const randomLoadingTime = Math.floor(Math.random() * (120 - 15 + 1)) + 15;

  return (
    <motion.div 
      className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-md text-center">
        <motion.div 
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-moviemate-primary/30 to-purple-600/20 backdrop-blur-lg"
          initial={{ scale: 0.8 }}
          animate={{ 
            scale: [0.8, 1.05, 0.9, 1],
            rotate: [0, 0, 0, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          <Loader size={36} className="animate-spin text-moviemate-primary" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div>
            <h3 className="text-xl font-medium text-white">
              Loading {isMovie ? 'Movie' : (
                episodeTitle ? `"${episodeTitle}"` : `Episode ${selectedEpisode}`
              )}...
            </h3>
            {title && (
              <p className="mt-1 text-sm text-gray-400">
                {title}
              </p>
            )}
          </div>
          
          <div className="mx-auto flex max-w-xs items-center gap-3 rounded-lg bg-white/5 px-4 py-2 text-sm backdrop-blur-sm">
            <div className="flex items-center gap-1.5 text-gray-300">
              <Clock size={14} className="text-moviemate-primary" />
              <span>Estimated: {randomLoadingTime}s</span>
            </div>
            
            <div className="h-4 w-px bg-gray-700"></div>
            
            <div className="flex items-center gap-1.5 text-gray-300">
              {isMovie ? (
                <Film size={14} className="text-moviemate-primary" />
              ) : (
                <Tv size={14} className="text-moviemate-primary" />
              )}
              <span>{isMovie ? 'Movie' : 'TV'}</span>
            </div>
          </div>
          
          <div className="mx-auto mt-4 h-1 max-w-xs overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-moviemate-primary to-purple-500"
              initial={{ width: "5%" }}
              animate={{ width: "95%" }}
              transition={{ duration: 3, ease: "easeInOut" }}
            />
          </div>
          
          <p className="mt-2 text-sm text-gray-500">FreeCinema Premium Stream</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PlayerLoading;
