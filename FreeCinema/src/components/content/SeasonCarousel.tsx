
import { useState, useEffect } from 'react';
import { Season } from '../../types';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { getSeasonDetails } from '../../services/tmdb';

interface SeasonCarouselProps {
  seasons: Season[] | null;
  selectedSeason: number;
  onSeasonChange: (seasonNumber: number) => void;
  tvShowId: number;
}

const SeasonCarousel = ({ 
  seasons, 
  selectedSeason, 
  onSeasonChange, 
  tvShowId 
}: SeasonCarouselProps) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!seasons || seasons.length === 0) {
    return null;
  }

  const filteredSeasons = seasons.filter(season => season.season_number > 0);
  
  if (filteredSeasons.length === 0) {
    return null;
  }

  return (
    <div className="my-6">
      <h3 className="mb-4 text-xl font-semibold">Seasons</h3>
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent>
          {filteredSeasons.map((season) => (
            <CarouselItem key={season.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
              <Card 
                className={`cursor-pointer overflow-hidden transition-all hover:opacity-80 ${
                  season.season_number === selectedSeason ? 'border-2 border-moviemate-primary' : ''
                }`}
                onClick={() => onSeasonChange(season.season_number)}
              >
                <div className="relative aspect-[2/3]">
                  {season.poster_path ? (
                    <img 
                      src={`https://image.tmdb.org/t/p/w300${season.poster_path}`}
                      alt={season.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-moviemate-card">
                      <span className="text-center text-gray-400">No Image</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
                    <p className="text-center text-sm font-medium text-white">{season.name}</p>
                    <p className="text-center text-xs text-gray-300">{season.episode_count} Episodes</p>
                  </div>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2 bg-black/50 text-white hover:bg-black/70" />
        <CarouselNext className="right-2 bg-black/50 text-white hover:bg-black/70" />
      </Carousel>
    </div>
  );
};

export default SeasonCarousel;
