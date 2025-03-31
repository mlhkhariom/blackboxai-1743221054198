
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CloudStreamContent } from '@/services/cloudstream';
import { useState } from 'react';

interface CloudStreamContentCardProps {
  content: CloudStreamContent;
  onClick: (content: CloudStreamContent) => void;
}

const CloudStreamContentCard = ({ content, onClick }: CloudStreamContentCardProps) => {
  const [imageError, setImageError] = useState(false);
  
  return (
    <motion.div 
      className="group relative overflow-hidden rounded-lg bg-moviemate-card transition-all hover:scale-105"
      whileHover={{ y: -5 }}
      onClick={() => onClick(content)}
    >
      <div 
        className="aspect-[2/3] bg-cover bg-center"
        style={{ 
          backgroundImage: imageError 
            ? 'linear-gradient(to bottom, #9b87f5, #6E59A5)' 
            : `url(${content.poster})` 
        }}
      >
        {!imageError && (
          <img 
            src={content.poster} 
            alt={content.title}
            className="hidden"
            onError={() => setImageError(true)} 
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-70"></div>
      </div>
      <div className="absolute bottom-0 w-full p-3">
        <h3 className="text-sm font-bold text-white line-clamp-2">{content.title}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-300">{content.year}</span>
          <span className="text-xs font-medium text-moviemate-primary">{content.source}</span>
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 transition-opacity group-hover:opacity-100">
        <Button variant="outline" size="sm" className="gap-2">
          <ExternalLink className="h-4 w-4" />
          View Details
        </Button>
      </div>
    </motion.div>
  );
};

export default CloudStreamContentCard;
