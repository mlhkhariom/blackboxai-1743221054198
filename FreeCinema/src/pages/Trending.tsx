
import { useState, useEffect } from 'react';
import { getTrendingMovies, getTrendingTvShows } from '../services/tmdb';
import { Movie, TvShow } from '../types';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert";

const Trending = () => {
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [trendingTvShows, setTrendingTvShows] = useState<TvShow[]>([]);
  const [activeTab, setActiveTab] = useState<'movies' | 'tvshows'>('movies');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [moviesData, tvShowsData] = await Promise.all([
          getTrendingMovies(),
          getTrendingTvShows(),
        ]);
        
        setTrendingMovies(moviesData.results);
        setTrendingTvShows(tvShowsData.results);
      } catch (error) {
        console.error('Error fetching trending content:', error);
        setError('Failed to load trending content. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTrending();
  }, []);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };
  
  return (
    <div className="min-h-screen bg-moviemate-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <h1 className="text-3xl font-bold text-white">Trending Today</h1>
          
          <Tabs defaultValue="movies" className="w-full md:w-auto" onValueChange={(value) => setActiveTab(value as 'movies' | 'tvshows')}>
            <TabsList className="grid w-full grid-cols-2 md:w-auto">
              <TabsTrigger value="movies">Movies</TabsTrigger>
              <TabsTrigger value="tvshows">TV Shows</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {[...Array(10)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-[2/3] rounded-lg bg-moviemate-card"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive" className="bg-red-500/20 border-red-500/50">
            <AlertTitle className="text-white">Error</AlertTitle>
            <AlertDescription className="text-gray-300">{error}</AlertDescription>
          </Alert>
        ) : (
          <>
            {activeTab === 'movies' ? (
              <motion.div 
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {trendingMovies.map((movie) => (
                  <motion.div key={movie.id} variants={itemVariants}>
                    <MovieCard
                      movieId={movie.id}
                      title={movie.title}
                      posterPath={movie.poster_path}
                      rating={movie.vote_average}
                      mediaType="movie"
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {trendingTvShows.map((tvShow) => (
                  <motion.div key={tvShow.id} variants={itemVariants}>
                    <MovieCard
                      movieId={tvShow.id}
                      title={tvShow.name}
                      posterPath={tvShow.poster_path}
                      rating={tvShow.vote_average}
                      mediaType="tv"
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Trending;
