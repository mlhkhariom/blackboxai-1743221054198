
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Star, Clock, Calendar, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { getCloudStreamContentDetails, CloudStreamContent, subscribeToCloudStreamUpdates } from '../services/cloudstream';
import Navbar from '../components/Navbar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const CloudStreamDetails = () => {
  const { sourceId, contentId } = useParams<{ sourceId: string; contentId: string }>();
  const [content, setContent] = useState<CloudStreamContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      if (!sourceId || !contentId) {
        setError('Invalid source or content ID');
        setIsLoading(false);
        return;
      }
      
      try {
        const details = await getCloudStreamContentDetails(contentId, sourceId);
        if (details) {
          setContent(details);
        } else {
          setError('Content not found');
        }
      } catch (err) {
        console.error('Error fetching content details:', err);
        setError('Failed to load content details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDetails();
    
    // Set up real-time subscription
    const unsubscribe = subscribeToCloudStreamUpdates(() => {
      fetchDetails();
    });
    
    return () => {
      unsubscribe();
    };
  }, [sourceId, contentId]);
  
  const handlePlayClick = () => {
    toast({
      title: "Starting Playback",
      description: `Now playing ${content?.title}`,
    });
    // In a real app, this would navigate to a player page or start the player
  };
  
  const handleBackClick = () => {
    navigate('/cloudstream');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-moviemate-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24">
          <div className="flex flex-col md:flex-row gap-8">
            <Skeleton className="h-[450px] w-[300px] rounded-lg" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-32 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !content) {
    return (
      <div className="min-h-screen bg-moviemate-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-bold">Error</h1>
          <p className="mt-4 text-gray-400">{error || 'Content not found'}</p>
          <Button onClick={handleBackClick} className="mt-8">
            Back to Search
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-moviemate-background">
      <Navbar />
      
      <div className="relative">
        {/* Backdrop Image */}
        <div className="absolute inset-0 h-[50vh] overflow-hidden z-0">
          <div 
            className="h-full w-full bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${content.backdrop})` 
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-moviemate-background/70 via-moviemate-background/90 to-moviemate-background"></div>
          </div>
        </div>
        
        {/* Content */}
        <div className="container relative z-10 mx-auto px-4 py-24">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-6"
            onClick={handleBackClick}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to CloudStream
          </Button>
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster */}
            <motion.div 
              className="w-full md:w-[300px] overflow-hidden rounded-lg shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <img 
                src={content.poster} 
                alt={content.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x450?text=No+Image";
                }}
              />
            </motion.div>
            
            {/* Details */}
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h1 className="text-3xl font-bold text-white">{content.title}</h1>
                
                <div className="mt-2 flex flex-wrap items-center gap-4 text-gray-300">
                  {content.year && (
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-4 w-4 text-moviemate-primary" />
                      <span>{content.year}</span>
                    </div>
                  )}
                  
                  {content.rating && (
                    <div className="flex items-center">
                      <Star className="mr-1 h-4 w-4 text-yellow-500" />
                      <span>{content.rating}/10</span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <Tag className="mr-1 h-4 w-4 text-moviemate-primary" />
                    <span>{content.type === 'movie' ? 'Movie' : 'Series'}</span>
                  </div>
                  
                  <div className="rounded-md bg-moviemate-primary/20 px-2 py-1 text-xs font-medium text-moviemate-primary">
                    {content.source}
                  </div>
                </div>
                
                <p className="mt-6 text-gray-300">
                  {content.plot || 'No description available.'}
                </p>
                
                <div className="mt-8 space-y-4">
                  <Button 
                    size="lg" 
                    className="bg-moviemate-primary hover:bg-moviemate-primary/90"
                    onClick={handlePlayClick}
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Play Now
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudStreamDetails;
