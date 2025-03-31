
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Trash2, Play } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

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

const History = () => {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate loading
    setIsLoading(true);
    
    // Fetch watch history from localStorage
    setTimeout(() => {
      const storedHistory = localStorage.getItem('watchHistory');
      if (storedHistory) {
        try {
          const parsedHistory = JSON.parse(storedHistory);
          // Sort by most recently watched
          const sortedHistory = parsedHistory.sort((a: WatchHistoryItem, b: WatchHistoryItem) => 
            b.timestamp - a.timestamp
          );
          setHistory(sortedHistory);
        } catch (error) {
          console.error('Error parsing watch history:', error);
          toast({
            title: "Error loading history",
            description: "There was a problem loading your watch history.",
            variant: "destructive"
          });
          // Reset history if corrupted
          localStorage.removeItem('watchHistory');
        }
      }
      setIsLoading(false);
    }, 800);
  }, [toast]);

  const removeFromHistory = (itemId: number) => {
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
        
        toast({
          title: "Item removed",
          description: "The item has been removed from your watch history.",
        });
      } catch (error) {
        console.error('Error updating watch history:', error);
        toast({
          title: "Error removing item",
          description: "There was a problem removing this item from your history.",
          variant: "destructive"
        });
      }
    }
  };

  const clearAllHistory = () => {
    localStorage.removeItem('watchHistory');
    setHistory([]);
    toast({
      title: "History cleared",
      description: "Your watch history has been cleared.",
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-moviemate-background to-purple-900/20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-24">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Watch History</h1>
          
          {history.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearAllHistory}
              className="text-red-500 hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex animate-pulse gap-4 rounded-lg bg-moviemate-card/60 p-4">
                <div className="h-24 w-40 rounded bg-gray-700"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/2 rounded bg-gray-700"></div>
                  <div className="h-3 w-1/4 rounded bg-gray-700"></div>
                  <div className="h-2 w-full rounded bg-gray-700"></div>
                </div>
              </div>
            ))}
          </div>
        ) : history.length > 0 ? (
          <motion.div 
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {history.map((item) => (
              <motion.div 
                key={item.id}
                variants={itemVariants}
                className="group overflow-hidden rounded-lg bg-moviemate-card/60 backdrop-blur-sm transition-all hover:bg-moviemate-card/80"
              >
                <Link 
                  to={`/${item.type}/${item.id}`}
                  className="flex flex-col gap-4 sm:flex-row"
                >
                  <div className="relative aspect-video w-full sm:aspect-[16/9] sm:w-64">
                    <img
                      src={`https://image.tmdb.org/t/p/w500${item.posterPath}`}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 hidden items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 sm:flex">
                      <Play size={40} className="text-white" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0">
                      <Progress 
                        value={item.progress} 
                        className="h-1 rounded-none bg-gray-800" 
                        indicatorClassName="bg-moviemate-primary" 
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-1 flex-col p-4">
                    <div className="mb-1 flex items-start justify-between">
                      <h3 className="text-lg font-medium text-white">{item.title}</h3>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-400"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeFromHistory(item.id);
                        }}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                    
                    <div className="mb-2 flex items-center gap-2 text-sm text-gray-400">
                      <span className="rounded bg-moviemate-primary/20 px-2 py-0.5 text-xs font-medium text-moviemate-primary">
                        {item.type === 'movie' ? 'Movie' : 'TV Show'}
                      </span>
                      
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>
                          {new Date(item.timestamp).toLocaleDateString()} 
                          {' • '}
                          {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>
                    
                    {item.episode && (
                      <div className="mb-2 text-sm text-white">
                        Season {item.episode.season}, Episode {item.episode.episode}: {item.episode.name}
                      </div>
                    )}
                    
                    <div className="mt-auto flex items-center justify-between">
                      <div className="text-sm text-gray-400">
                        {Math.round(item.progress)}% completed
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-moviemate-primary hover:bg-moviemate-primary/90"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Resume
                      </Button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl bg-moviemate-card/50 p-12 text-center backdrop-blur-sm">
            <Clock size={64} className="mb-4 text-gray-500" />
            <h3 className="mb-2 text-xl font-semibold text-white">No watch history found</h3>
            <p className="mb-6 text-gray-400">Start watching movies and TV shows to build your history</p>
            <Link to="/">
              <Button className="bg-moviemate-primary hover:bg-moviemate-primary/90">
                Browse Content
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
