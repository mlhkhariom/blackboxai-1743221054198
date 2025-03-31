
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getPopularMovies, getTopRatedMovies, getIndianMovies } from '../services/tmdb';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Movies = () => {
  const [isLoading, setIsLoading] = useState(true);

  const { data: popularMovies, error: popularError } = useQuery({
    queryKey: ['popular-movies'],
    queryFn: getPopularMovies,
  });

  const { data: topRatedMovies, error: topRatedError } = useQuery({
    queryKey: ['top-rated-movies'],
    queryFn: getTopRatedMovies,
  });

  const { data: indianMovies, error: indianError } = useQuery({
    queryKey: ['indian-movies'],
    queryFn: getIndianMovies,
  });

  useEffect(() => {
    if (popularMovies && topRatedMovies && indianMovies) {
      setIsLoading(false);
    }
  }, [popularMovies, topRatedMovies, indianMovies]);

  const hasError = popularError || topRatedError || indianError;

  return (
    <div className="min-h-screen bg-moviemate-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <h1 className="mb-8 text-3xl font-bold text-white">Movies</h1>
        
        {hasError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load movies. Please try again later.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Indian Movies */}
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Indian Movies</h2>
            <Link to="/genre/movie/hi" className="text-moviemate-primary hover:underline">
              View All
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-lg bg-moviemate-card">
                  <div className="aspect-[2/3]"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {indianMovies?.results.slice(0, 12).map((movie) => (
                <MovieCard key={movie.id} item={movie} type="movie" />
              ))}
            </div>
          )}
        </section>
        
        {/* Popular Movies */}
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Popular Movies</h2>
            <Link to="/explore?type=movie&filter=popular" className="text-moviemate-primary hover:underline">
              View All
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-lg bg-moviemate-card">
                  <div className="aspect-[2/3]"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {popularMovies?.results.slice(0, 12).map((movie) => (
                <MovieCard key={movie.id} item={movie} type="movie" />
              ))}
            </div>
          )}
        </section>
        
        {/* Top Rated Movies */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Top Rated Movies</h2>
            <Link to="/explore?type=movie&filter=top_rated" className="text-moviemate-primary hover:underline">
              View All
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-lg bg-moviemate-card">
                  <div className="aspect-[2/3]"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {topRatedMovies?.results.slice(0, 12).map((movie) => (
                <MovieCard key={movie.id} item={movie} type="movie" />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Movies;
