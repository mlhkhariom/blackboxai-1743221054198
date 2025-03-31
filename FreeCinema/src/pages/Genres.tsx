
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { fetchApi } from '../services/tmdb';
import { Genre } from '../types';
import { motion } from 'framer-motion';

interface GenreResponse {
  genres: Genre[];
}

const Genres = () => {
  const [movieGenres, setMovieGenres] = useState<Genre[]>([]);
  const [tvGenres, setTvGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setIsLoading(true);
        
        const API_KEY = '43d89010b257341339737be36dfaac13';
        
        // Fetch movie and TV genres in parallel
        const [movieGenresRes, tvGenresRes] = await Promise.all([
          fetchApi<GenreResponse>(`/genre/movie/list?api_key=${API_KEY}&language=en-US`),
          fetchApi<GenreResponse>(`/genre/tv/list?api_key=${API_KEY}&language=en-US`)
        ]);
        
        setMovieGenres(movieGenresRes.genres);
        setTvGenres(tvGenresRes.genres);
      } catch (error) {
        console.error('Error fetching genres:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGenres();
  }, []);
  
  // Get a random gradient for each genre card
  const getRandomGradient = (index: number) => {
    const gradients = [
      'bg-gradient-to-r from-purple-500 to-indigo-500',
      'bg-gradient-to-r from-blue-500 to-teal-500',
      'bg-gradient-to-r from-green-500 to-teal-500',
      'bg-gradient-to-r from-yellow-500 to-orange-500',
      'bg-gradient-to-r from-red-500 to-pink-500',
      'bg-gradient-to-r from-pink-500 to-purple-500',
      'bg-gradient-to-r from-indigo-500 to-blue-500',
      'bg-gradient-to-r from-teal-500 to-green-500',
      'bg-gradient-to-r from-orange-500 to-red-500',
    ];
    
    return gradients[index % gradients.length];
  };
  
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.05,
        duration: 0.5,
        type: "spring",
        stiffness: 100
      }
    })
  };
  
  return (
    <div className="min-h-screen bg-moviemate-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24">
        <h1 className="mb-8 text-3xl font-bold text-white md:text-4xl">Browse by Genre</h1>
        
        <div className="mb-12 space-y-8">
          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">Movie Genres</h2>
            
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-xl bg-moviemate-card p-6">
                    <div className="h-6 w-24 rounded bg-gray-700"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {movieGenres.map((genre, index) => (
                  <motion.div
                    key={genre.id}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                  >
                    <Link 
                      to={`/genre/movie/${genre.id}`}
                      className={`flex h-24 items-center justify-center rounded-xl ${getRandomGradient(index)} p-4 text-center text-lg font-bold text-white shadow-lg hover:shadow-xl hover:transform hover:scale-105 transition-all duration-300`}
                    >
                      {genre.name}
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
          
          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">TV Show Genres</h2>
            
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-xl bg-moviemate-card p-6">
                    <div className="h-6 w-24 rounded bg-gray-700"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {tvGenres.map((genre, index) => (
                  <motion.div
                    key={genre.id}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                  >
                    <Link 
                      to={`/genre/tv/${genre.id}`}
                      className={`flex h-24 items-center justify-center rounded-xl ${getRandomGradient(index + movieGenres.length)} p-4 text-center text-lg font-bold text-white shadow-lg hover:shadow-xl hover:transform hover:scale-105 transition-all duration-300`}
                    >
                      {genre.name}
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Genres;
