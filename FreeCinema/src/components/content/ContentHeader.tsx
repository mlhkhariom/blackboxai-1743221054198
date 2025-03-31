
import { Movie, TvShow } from '../../types';
import { getImageUrl } from '../../services/tmdb';

interface ContentHeaderProps {
  content: Movie | TvShow;
  type: 'movie' | 'tv';
  title: string;
  formattedDate: string;
  formattedRuntime: string;
  rating: string;
  showPlayer: boolean;
  setShowPlayer: (show: boolean) => void;
}

const ContentHeader = ({ 
  content, 
  type, 
  title, 
  formattedDate, 
  formattedRuntime, 
  rating,
  showPlayer,
  setShowPlayer
}: ContentHeaderProps) => {
  const isMovie = type === 'movie';
  
  return (
    <div className="relative mb-8 overflow-hidden rounded-xl">
      <div className="absolute inset-0">
        <img 
          src={getImageUrl(content.backdrop_path, 'original')}
          alt={title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-moviemate-background via-moviemate-background/90 to-transparent"></div>
      </div>
      
      <div className="relative z-10 flex flex-col gap-8 px-4 py-12 md:flex-row lg:px-8 lg:py-16">
        {/* Poster */}
        <div className="flex-shrink-0">
          <div className="relative aspect-[2/3] w-48 overflow-hidden rounded-xl bg-moviemate-card shadow-lg md:w-64 lg:w-72">
            <img 
              src={getImageUrl(content.poster_path, 'w500')}
              alt={title}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        
        {/* Content Details */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">{title}</h1>
          
          <div className="flex flex-wrap items-center gap-3">
            {formattedDate && (
              <span className="rounded-full bg-moviemate-card px-3 py-1 text-sm text-gray-300">
                {formattedDate}
              </span>
            )}
            
            {formattedRuntime && (
              <span className="rounded-full bg-moviemate-card px-3 py-1 text-sm text-gray-300">
                {formattedRuntime}
              </span>
            )}
            
            {!isMovie && (
              <span className="rounded-full bg-moviemate-card px-3 py-1 text-sm text-gray-300">
                {(content as TvShow).number_of_seasons} Seasons
              </span>
            )}
            
            <div className="flex items-center gap-1 rounded-full bg-yellow-400 px-3 py-1 text-sm font-bold text-black">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z"/>
              </svg>
              {rating}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {content.genres?.map((genre) => (
              <span 
                key={genre.id}
                className="rounded-full bg-moviemate-primary/30 px-3 py-1 text-xs font-medium text-white"
              >
                {genre.name}
              </span>
            ))}
          </div>
          
          <p className="max-w-3xl text-gray-300">{content.overview}</p>
          
          <div className="mt-4 flex flex-wrap gap-4">
            <button
              onClick={() => setShowPlayer(true)}
              className="rounded-full bg-moviemate-primary px-6 py-3 text-sm font-medium text-white transition-all hover:bg-opacity-90"
            >
              Watch Now
            </button>
            
            <button
              onClick={() => setShowPlayer(false)}
              className="rounded-full border border-gray-700 bg-moviemate-card px-6 py-3 text-sm font-medium text-white transition-all hover:bg-gray-800"
            >
              Add to Watchlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentHeader;
