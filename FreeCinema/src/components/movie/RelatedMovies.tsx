
import { useCallback, useRef, useState } from 'react';
import { Movie } from '../../types';
import { getRelatedMovies } from '../../services/tmdb';
import MovieCard from '../MovieCard';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

interface RelatedMoviesProps {
  movieId: number;
  initialMovies: Movie[];
}

const RelatedMovies = ({ movieId, initialMovies }: RelatedMoviesProps) => {
  const [relatedMovies, setRelatedMovies] = useState<Movie[]>(initialMovies);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  const lastMovieRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoadingMore) return;
    
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && relatedMovies.length > 0) {
        const loadMoreRelatedMovies = async () => {
          try {
            setIsLoadingMore(true);
            const more = await getRelatedMovies(movieId, relatedMovies.length / 20 + 1);
            setRelatedMovies(prev => [...prev, ...more.results.slice(0, 10)]);
          } catch (error) {
            console.error('Error loading more related movies:', error);
          } finally {
            setIsLoadingMore(false);
          }
        };
        
        loadMoreRelatedMovies();
      }
    });
    
    if (node) {
      observerRef.current.observe(node);
    }
  }, [movieId, isLoadingMore, relatedMovies.length]);
  
  if (relatedMovies.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-4">You May Also Like</h2>
      <Separator className="mb-6" />
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {relatedMovies.map((relatedMovie, index) => (
          <div 
            key={relatedMovie.id} 
            ref={index === relatedMovies.length - 1 ? lastMovieRef : null}
          >
            <MovieCard 
              movieId={relatedMovie.id}
              title={relatedMovie.title}
              posterPath={relatedMovie.poster_path}
              rating={relatedMovie.vote_average}
              mediaType="movie"
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
  );
};

export default RelatedMovies;
