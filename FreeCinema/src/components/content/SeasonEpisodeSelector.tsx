
import { useState, useEffect } from 'react';
import { Season } from '../../types';
import { Alert } from "@/components/ui/alert";
import { getSeasonDetails } from '../../services/tmdb';
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";

interface SeasonEpisodeSelectorProps {
  seasons: Season[] | null;
  selectedSeason: number;
  selectedEpisode: number;
  onSeasonChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onEpisodeChange: (episodeNumber: number) => void;
  tvShowId: number;
}

const SeasonEpisodeSelector = ({
  seasons,
  selectedSeason,
  selectedEpisode,
  onSeasonChange,
  onEpisodeChange,
  tvShowId
}: SeasonEpisodeSelectorProps) => {
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  const [episodeDetails, setEpisodeDetails] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadSeasonDetails = async () => {
      if (!tvShowId || !selectedSeason) return;
      
      try {
        setIsLoadingEpisodes(true);
        setError(null);
        const seasonData = await getSeasonDetails(tvShowId, selectedSeason);
        
        if (seasonData && seasonData.episodes) {
          setEpisodeDetails(seasonData.episodes);
        } else {
          setEpisodeDetails([]);
        }
      } catch (err) {
        console.error('Error loading season details:', err);
        setError('Failed to load episode details');
        setEpisodeDetails([]);
      } finally {
        setIsLoadingEpisodes(false);
      }
    };
    
    loadSeasonDetails();
  }, [tvShowId, selectedSeason]);
  
  if (!seasons) {
    return (
      <Alert className="mt-4 bg-yellow-500/20 border-yellow-500/50">
        <p className="text-white">No season information available</p>
      </Alert>
    );
  }
  
  const filteredSeasons = seasons.filter(season => season.season_number > 0);
  
  if (filteredSeasons.length === 0) {
    return (
      <Alert className="mt-4 bg-yellow-500/20 border-yellow-500/50">
        <p className="text-white">No season information available</p>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="season" className="mb-1 block text-sm font-medium text-gray-300">
            Season
          </label>
          <select
            id="season"
            value={selectedSeason}
            onChange={onSeasonChange}
            className="w-full rounded-lg border border-gray-700 bg-moviemate-card px-4 py-2 text-white"
          >
            {filteredSeasons.map((season) => (
              <option key={season.id} value={season.season_number}>
                {season.name} ({season.episode_count} episodes)
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Episode Grid with Details */}
      {isLoadingEpisodes ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="bg-moviemate-card border-gray-700">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-20 w-full mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Alert className="mt-4 bg-red-500/20 border-red-500/50">
          <p className="text-white">{error}</p>
        </Alert>
      ) : (
        <ScrollArea className="h-[400px] rounded-md border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {episodeDetails.map((episode) => (
              <Card 
                key={episode.id} 
                className={`bg-moviemate-card border-gray-700 hover:bg-moviemate-card/80 transition-all cursor-pointer ${
                  episode.episode_number === selectedEpisode ? 'border-moviemate-primary' : ''
                }`}
                onClick={() => onEpisodeChange(episode.episode_number)}
              >
                <CardContent className="p-4 flex gap-4">
                  <div className="w-24 h-16 relative rounded overflow-hidden flex-shrink-0">
                    {episode.still_path ? (
                      <img 
                        src={`https://image.tmdb.org/t/p/w300${episode.still_path}`} 
                        alt={episode.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                        <span className="text-xs text-gray-400">No Image</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-center text-xs py-1">
                      Episode {episode.episode_number}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white mb-1 line-clamp-1">{episode.name}</h4>
                    <p className="text-xs text-gray-400 line-clamp-2">{episode.overview || 'No description available.'}</p>
                    {episode.air_date && (
                      <p className="text-xs text-gray-500 mt-1">
                        Aired: {new Date(episode.air_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
      
      {episodeDetails.length > 0 && (
        <Pagination className="mt-4">
          <PaginationContent>
            {[...Array(Math.min(10, episodeDetails.length))].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink 
                  isActive={selectedEpisode === i + 1}
                  onClick={() => onEpisodeChange(i + 1)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default SeasonEpisodeSelector;
