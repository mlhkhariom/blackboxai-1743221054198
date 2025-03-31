
import { motion } from 'framer-motion';
import { Film, Tv, Sparkles, Shield, Award, Zap } from 'lucide-react';
import { useState } from 'react';

interface PlayerFooterProps {
  isMovie: boolean;
}

const PlayerFooter = ({ isMovie }: PlayerFooterProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const badges = [
    {
      label: "HD 1080p",
      icon: <Sparkles size={12} />,
      tooltip: "Watch in high definition quality"
    },
    {
      label: "Premium Stream",
      icon: <Award size={12} />,
      tooltip: "Enjoy our premium streaming service"
    },
    {
      label: "Ad Free",
      icon: <Shield size={12} />,
      tooltip: "No interruptions or advertisements"
    },
    {
      label: isMovie ? "Movie" : "TV Show",
      icon: isMovie ? <Film size={12} /> : <Tv size={12} />,
      tooltip: isMovie ? "Full-length feature film" : "Series content"
    },
    {
      label: "Fast Loading",
      icon: <Zap size={12} />,
      tooltip: "Optimized for quick playback"
    }
  ];
  
  return (
    <motion.div 
      className="mt-4 flex flex-wrap gap-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      {badges.map((badge, index) => (
        <motion.div
          key={badge.label}
          className="relative"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center gap-1.5 rounded-full bg-moviemate-card px-3 py-1.5 text-xs font-medium text-gray-300">
            {badge.icon}
            <span>{badge.label}</span>
          </div>
          
          {hoveredIndex === index && (
            <motion.div
              className="absolute -top-8 left-1/2 w-max -translate-x-1/2 rounded-md bg-black px-2 py-1 text-xs text-white shadow-lg"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
            >
              {badge.tooltip}
              <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-black"></div>
            </motion.div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default PlayerFooter;
