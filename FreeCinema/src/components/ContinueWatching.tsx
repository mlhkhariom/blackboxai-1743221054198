
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface WatchHistoryItem {
  id: number;
  title: string;
  posterPath: string;
  type: 'movie' | 'tv';
  progress: number;
  timestamp: number;
  episode?: {
    season: number;
    episode: number;
    name: string;
  };
}

const ContinueWatching = () => {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);

  useEffect(() => {
    // Fetch watch history from localStorage
    const storedHistory = localStorage.getItem('watchHistory');
    if (storedHistory) {
      try {
        const parsedHistory = JSON.parse(storedHistory);
        // Sort by most recently watched
        const sortedHistory = parsedHistory.sort((a: WatchHistoryItem, b: WatchHistoryItem) => 
          b.timestamp - a.timestamp
        );
        setHistory(sortedHistory.slice(0, 10)); // Limit to 10 recent items
      } catch (error) {
        console.error('Error parsing watch history:', error);
        // Reset history if corrupted
        localStorage.removeItem('watchHistory');
      }
    }
  }, []);

  const removeFromHistory = (e: React.MouseEvent, itemId: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Remove item from localStorage
    const storedHistory = localStorage.getItem('watchHistory');
    if (storedHistory) {
      try {
        const parsedHistory = JSON.parse(storedHistory);
        const updatedHistory = parsedHistory.filter(
          (item: WatchHistoryItem) => item.id !== itemId
        );
        localStorage.setItem('watchHistory', JSON.stringify(updatedHistory));
        setHistory(updatedHistory);
      } catch (error) {
        console.error('Error updating watch history:', error);
      }
    }
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="w-full px-4">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Continue Watching</h2>
        <Link to="/history" className="flex items-center gap-1 text-sm font-medium text-moviemate-primary hover:underline">
          View All
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {history.map((item) => (
            <CarouselItem key={item.id} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
              <Link 
                to={`/${item.type}/${item.id}`} 
                className="block"
              >
                <div className="relative overflow-hidden rounded-lg bg-moviemate-card/60 backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-xl">
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={`https://image.tmdb.org/t/p/w500${item.posterPath}`}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="absolute right-2 top-2 h-7 w-7 rounded-full bg-black/50 text-white hover:bg-black/70"
                      onClick={(e) => removeFromHistory(e, item.id)}
                    >
                      <X size={14} />
                    </Button>
                    
                    <div className="absolute bottom-0 left-0 right-0">
                      <Progress 
                        value={item.progress} 
                        className="h-1 rounded-none bg-gray-800" 
                        indicatorClassName="bg-moviemate-primary" 
                      />
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <h3 className="mb-1 truncate text-sm font-medium text-white">{item.title}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock size={12} />
                        {item.episode ? (
                          <span>S{item.episode.season} E{item.episode.episode}</span>
                        ) : (
                          <span>{Math.round(item.progress)}% completed</span>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        className="h-7 w-7 rounded-full bg-moviemate-primary p-0 text-white hover:bg-moviemate-primary/90"
                      >
                        <Play size={12} />
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0 bg-moviemate-primary text-white hover:bg-moviemate-primary/90" />
        <CarouselNext className="right-0 bg-moviemate-primary text-white hover:bg-moviemate-primary/90" />
      </Carousel>
    </div>
  );
};

export default ContinueWatching;
