
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Movie } from '../types';
import { getMovieDetails, getMovieExternalIds, getRelatedMovies } from '../services/tmdb';
import Navbar from '../components/Navbar';
import { useToast } from "@/components/ui/use-toast";
import { handleAPIError } from '../services/error-handler';
import MovieDetails from '../components/movie/MovieDetails';
import MovieLoading from '../components/movie/MovieLoading';
import MovieError from '../components/movie/MovieError';
import RelatedMovies from '../components/movie/RelatedMovies';

const MoviePage = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [relatedMovies, setRelatedMovies] = useState<Movie[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);
  const { toast } = useToast();
  
  const fetchMovieDetails = useCallback(async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      setShowPlayer(false);
      
      const movieId = parseInt(id);
      const movieData = await getMovieDetails(movieId);
      
      try {
        const externalIds = await getMovieExternalIds(movieId);
        movieData.imdb_id = externalIds.imdb_id;
      } catch (error) {
        console.error('Error fetching external IDs:', error);
      }
      
      setMovie(movieData);
      
      try {
        const related = await getRelatedMovies(movieId);
        setRelatedMovies(related.results.slice(0, 10));
      } catch (error) {
        console.error('Error fetching related movies:', error);
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
      setIsRetrying(false);
    }
  }, [id, toast]);
  
  useEffect(() => {
    fetchMovieDetails();
  }, [fetchMovieDetails]);
  
  const handleRetry = () => {
    setIsRetrying(true);
    fetchMovieDetails();
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-24">
        {isLoading ? (
          <MovieLoading />
        ) : error ? (
          <MovieError message={error} onRetry={handleRetry} isRetrying={isRetrying} />
        ) : movie ? (
          <>
            <MovieDetails 
              movie={movie}
              showPlayer={showPlayer}
              setShowPlayer={setShowPlayer}
            />
            
            <RelatedMovies 
              movieId={movie.id}
              initialMovies={relatedMovies}
            />
          </>
        ) : (
          <MovieError message="Movie not found" onRetry={handleRetry} isRetrying={isRetrying} />
        )}
      </main>
    </div>
  );
};

export default MoviePage;
