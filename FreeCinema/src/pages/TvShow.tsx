import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { TvShow, Episode } from '../types';
import { getTvShowDetails, getTvExternalIds, getSeasonDetails, getRelatedTvShows } from '../services/tmdb';
import Navbar from '../components/Navbar';
import ContentDetails from '../components/ContentDetails';
import { Card } from '@/components/ui/card';
import ContentHeader from '../components/content/ContentHeader';
import PlayerSection from '../components/content/PlayerSection';
import SeasonEpisodeSelector from '../components/content/SeasonEpisodeSelector';
import { useToast } from "@/components/ui/use-toast";
import { handleAPIError } from '../services/error-handler';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import MovieCard from '../components/MovieCard';
import SeasonCarousel from '../components/content/SeasonCarousel';

const TvShowPage = () => {
  const { id } = useParams<{ id: string }>();
  const [tvShow, setTvShow] = useState<TvShow | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [relatedShows, setRelatedShows] = useState<TvShow[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastShowElementRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const handleEpisodeChange = (episodeNumber: number) => {
    setSelectedEpisode(episodeNumber);
  };
  
  const handleSeasonChange = (seasonNumber: number) => {
    setSelectedSeason(seasonNumber);
    setSelectedEpisode(1);
    
    document.querySelector('.episode-selector')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };
  
  useEffect(() => {
    const fetchEpisodeDetails = async () => {
      if (!id || !selectedSeason || !selectedEpisode) return;
      
      try {
        const tvId = parseInt(id);
        const episodeData = await getSeasonDetails(tvId, selectedSeason);
        const foundEpisode = episodeData.episodes?.find(
          (ep) => ep.episode_number === selectedEpisode
        );
        
        if (foundEpisode) {
          setCurrentEpisode(foundEpisode);
        }
      } catch (error) {
        console.error('Error fetching episode details:', error);
      }
    };
    
    fetchEpisodeDetails();
  }, [id, selectedSeason, selectedEpisode]);
  
  useEffect(() => {
    const fetchTvShowDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        setShowPlayer(false);
        
        const tvId = parseInt(id);
        const tvData = await getTvShowDetails(tvId);
        
        try {
          const externalIds = await getTvExternalIds(tvId);
          tvData.imdb_id = externalIds.imdb_id;
        } catch (error) {
          console.error('Error fetching external IDs:', error);
        }
        
        setTvShow(tvData);
        
        try {
          const related = await getRelatedTvShows(tvId);
          setRelatedShows(related.results.slice(0, 8));
        } catch (error) {
          console.error('Error fetching related shows:', error);
        }
        
        if (tvData.seasons && tvData.seasons.length > 0) {
          const firstRegularSeason = tvData.seasons.find(s => s.season_number > 0);
          if (firstRegularSeason) {
            setSelectedSeason(firstRegularSeason.season_number);
            setSelectedEpisode(1);
          }
        }
      } catch (error) {
        const apiError = handleAPIError(error);
        setError(apiError.message);
        toast({
          variant: "destructive",
          title: "Error loading content",
          description: apiError.message,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTvShowDetails();
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [id, toast]);
  
  const lastShowRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoadingMore) return;
    
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && relatedShows.length > 0) {
        const loadMoreRelatedShows = async () => {
          if (!id) return;
          
          try {
            setIsLoadingMore(true);
            const tvId = parseInt(id);
            const more = await getRelatedTvShows(tvId, relatedShows.length / 20 + 1);
            setRelatedShows(prev => [...prev, ...more.results.slice(0, 8)]);
          } catch (error) {
            console.error('Error loading more related shows:', error);
          } finally {
            setIsLoadingMore(false);
          }
        };
        
        loadMoreRelatedShows();
      }
    });
    
    if (node) {
      observerRef.current.observe(node);
    }
  }, [id, isLoadingMore, relatedShows.length]);
  
  const getFormattedTvShowDetails = () => {
    if (!tvShow) return { title: '', formattedDate: '', formattedRuntime: '', rating: '' };
    
    const title = tvShow.name;
    const formattedDate = tvShow.first_air_date 
      ? new Date(tvShow.first_air_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : '';
    
    const formattedRuntime = tvShow.number_of_seasons 
      ? `${tvShow.number_of_seasons} Season${tvShow.number_of_seasons > 1 ? 's' : ''}`
      : '';
    
    const rating = tvShow.vote_average ? tvShow.vote_average.toFixed(1) : '0.0';
    
    return { title, formattedDate, formattedRuntime, rating };
  };
  
  const { title, formattedDate, formattedRuntime, rating } = getFormattedTvShowDetails();
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-24">
        {isLoading ? (
          <Card className="w-full p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-2/3 rounded-md bg-muted"></div>
              <div className="h-4 w-1/3 rounded-md bg-muted"></div>
              <div className="h-32 w-full rounded-md bg-muted"></div>
            </div>
          </Card>
        ) : error ? (
          <Card className="w-full p-8 border-red-500/20 bg-red-500/10">
            <h2 className="mb-4 text-2xl font-bold">Error</h2>
            <p>{error}</p>
          </Card>
        ) : tvShow ? (
          <div className="space-y-8">
            <ContentHeader 
              content={tvShow} 
              type="tv"
              title={title}
              formattedDate={formattedDate}
              formattedRuntime={formattedRuntime}
              rating={rating}
              showPlayer={showPlayer}
              setShowPlayer={setShowPlayer}
            />
            
            {showPlayer && (
              <>
                <SeasonCarousel
                  seasons={tvShow.seasons || null}
                  selectedSeason={selectedSeason}
                  onSeasonChange={handleSeasonChange}
                  tvShowId={tvShow.id}
                />
                
                <PlayerSection 
                  showPlayer={showPlayer}
                  isMovie={false}
                  contentId={tvShow.id}
                  imdbId={tvShow.imdb_id}
                  selectedSeason={selectedSeason}
                  selectedEpisode={selectedEpisode}
                  title={tvShow.name}
                  episodeTitle={currentEpisode?.name}
                />
                
                <div className="episode-selector">
                  <SeasonEpisodeSelector 
                    seasons={tvShow.seasons || null}
                    selectedSeason={selectedSeason}
                    selectedEpisode={selectedEpisode}
                    onSeasonChange={(e) => handleSeasonChange(parseInt(e.target.value))}
                    onEpisodeChange={handleEpisodeChange}
                    tvShowId={tvShow.id}
                  />
                </div>
              </>
            )}
            
            {showPlayer && currentEpisode && (
              <Card className="bg-moviemate-card border-gray-700">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {currentEpisode.name || `Episode ${currentEpisode.episode_number}`}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                    <span>Season {selectedSeason}</span>
                    <span>Episode {currentEpisode.episode_number}</span>
                    {currentEpisode.air_date && (
                      <span>Air Date: {new Date(currentEpisode.air_date).toLocaleDateString()}</span>
                    )}
                    {currentEpisode.vote_average > 0 && (
                      <span>Rating: {currentEpisode.vote_average.toFixed(1)}/10</span>
                    )}
                  </div>
                  
                  <p className="text-gray-300">
                    {currentEpisode.overview || 'No episode description available.'}
                  </p>
                </div>
              </Card>
            )}
            
            <ContentDetails content={tvShow} type="tv" />
            
            {relatedShows.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-4">You May Also Like</h2>
                <Separator className="mb-6" />
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {relatedShows.map((show, index) => (
                    <div 
                      key={show.id} 
                      ref={index === relatedShows.length - 1 ? lastShowElementRef : null}
                    >
                      <MovieCard 
                        movieId={show.id}
                        title={show.name}
                        posterPath={show.poster_path}
                        rating={show.vote_average}
                        mediaType="tv"
                      />
                    </div>
                  ))}
                  
                  {isLoadingMore && (
                    <>
                      {[1, 2, 3, 4].map((i) => (
                        <div key={`skeleton-${i}`} className="rounded-lg overflow-hidden">
                          <Skeleton className="aspect-[2/3] w-full" />
                          <Skeleton className="h-4 w-2/3 mt-2" />
                          <Skeleton className="h-3 w-1/3 mt-1" />
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default TvShowPage;
