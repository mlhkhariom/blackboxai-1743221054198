
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Movie, TvShow } from '../types';
import { getImageUrl } from '../services/tmdb';

interface TrendingSliderProps {
  items: (Movie | TvShow)[];
  title?: string;
}

const TrendingSlider = ({ items, title: sectionTitle }: TrendingSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const slideTimerRef = useRef<number | null>(null);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
  };

  useEffect(() => {
    // Reset image loaded state when index changes
    setImageLoaded(false);
    
    // Auto slide every 5 seconds
    if (slideTimerRef.current) {
      window.clearTimeout(slideTimerRef.current);
    }
    
    slideTimerRef.current = window.setTimeout(() => {
      nextSlide();
    }, 5000);
    
    return () => {
      if (slideTimerRef.current) {
        window.clearTimeout(slideTimerRef.current);
      }
    };
  }, [currentIndex, items.length]);

  if (!items.length) return null;

  const currentItem = items[currentIndex];
  const isMovie = 'title' in currentItem;
  const itemTitle = isMovie ? (currentItem as Movie).title : (currentItem as TvShow).name;
  const linkPath = isMovie ? `/movie/${currentItem.id}` : `/tv/${currentItem.id}`;

  return (
    <div className="relative overflow-hidden rounded-xl">
      {sectionTitle && (
        <h2 className="mb-4 text-2xl font-bold text-white">{sectionTitle}</h2>
      )}
      
      <div className="relative overflow-hidden rounded-xl bg-moviemate-card">
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <div 
            className={`absolute inset-0 ${imageLoaded ? 'image-loaded' : 'image-loading'}`}
            style={{ backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            <img
              src={getImageUrl(currentItem.backdrop_path, 'original')}
              alt={itemTitle}
              className="h-full w-full object-cover"
              onLoad={() => setImageLoaded(true)}
            />
          </div>
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          
          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-8">
            <h3 className="mb-2 text-2xl font-bold text-white sm:text-3xl md:text-4xl">{itemTitle}</h3>
            <div className="mb-4 flex items-center gap-2">
              <span className="flex items-center gap-1 rounded bg-yellow-400 px-2 py-1 text-xs font-semibold text-black">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="12" 
                  height="12" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z"/>
                </svg>
                {currentItem.vote_average.toFixed(1)}
              </span>
              {currentItem.genre_ids?.slice(0, 2).map((genreId) => (
                <span 
                  key={genreId} 
                  className="rounded bg-moviemate-primary/30 px-2 py-1 text-xs font-medium text-white"
                >
                  {getGenreName(genreId)}
                </span>
              ))}
            </div>
            <p className="mb-4 line-clamp-2 text-sm text-gray-300 md:max-w-xl">{currentItem.overview}</p>
            <Link 
              to={linkPath} 
              className="w-fit rounded-full bg-moviemate-primary px-6 py-2 text-sm font-medium text-white transition-all hover:bg-opacity-90"
            >
              Watch Now
            </Link>
          </div>
          
          {/* Navigation controls */}
          <div className="absolute inset-y-0 left-0 flex items-center">
            <button 
              onClick={prevSlide}
              className="ml-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition-all hover:bg-black/70"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center">
            <button 
              onClick={nextSlide}
              className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition-all hover:bg-black/70"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
          
          {/* Indicators */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {items.slice(0, 5).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentIndex ? 'w-8 bg-moviemate-primary' : 'w-2 bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get genre name
const getGenreName = (genreId: number): string => {
  const genres: Record<number, string> = {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Sci-Fi',
    10770: 'TV Movie',
    53: 'Thriller',
    10752: 'War',
    37: 'Western',
    // TV Show genres
    10759: 'Action & Adventure',
    10762: 'Kids',
    10763: 'News',
    10764: 'Reality',
    10765: 'Sci-Fi & Fantasy',
    10766: 'Soap',
    10767: 'Talk',
    10768: 'War & Politics',
  };
  
  return genres[genreId] || 'Unknown';
};

export default TrendingSlider;
