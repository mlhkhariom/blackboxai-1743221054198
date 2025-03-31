
import { useState, useEffect } from 'react';
import { getPopularMovies, getPopularTvShows, getTopRatedMovies, getTopRatedTvShows } from '../services/tmdb';
import { Movie, TvShow } from '../types';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

const Explore = () => {
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [popularTvShows, setPopularTvShows] = useState<TvShow[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [topRatedTvShows, setTopRatedTvShows] = useState<TvShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all data in parallel
        const [
          popularMoviesRes,
          popularTvShowsRes,
          topRatedMoviesRes,
          topRatedTvShowsRes
        ] = await Promise.all([
          getPopularMovies(),
          getPopularTvShows(),
          getTopRatedMovies(),
          getTopRatedTvShows()
        ]);
        
        setPopularMovies(popularMoviesRes.results);
        setPopularTvShows(popularTvShowsRes.results);
        setTopRatedMovies(topRatedMoviesRes.results);
        setTopRatedTvShows(topRatedTvShowsRes.results);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };
  
  return (
    <div className="min-h-screen bg-moviemate-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24">
        <h1 className="mb-8 text-3xl font-bold text-white md:text-4xl">Explore Content</h1>
        
        <Tabs defaultValue="movies" className="w-full">
          <TabsList className="mb-8 grid w-full grid-cols-2 bg-moviemate-card">
            <TabsTrigger value="movies" className="text-base">Movies</TabsTrigger>
            <TabsTrigger value="tvshows" className="text-base">TV Shows</TabsTrigger>
          </TabsList>
          
          <TabsContent value="movies" className="mt-0">
            <div className="mb-12 space-y-8">
              <section>
                <h2 className="mb-6 text-2xl font-bold text-white">Popular Movies</h2>
                {isLoading ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {Array.from({ length: 18 }).map((_, i) => (
                      <div key={i} className="animate-pulse rounded-lg bg-moviemate-card">
                        <div className="aspect-[2/3]"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {popularMovies.map((movie, index) => (
                      <motion.div
                        key={movie.id}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                      >
                        <MovieCard item={movie} type="movie" />
                      </motion.div>
                    ))}
                  </div>
                )}
              </section>
              
              <section>
                <h2 className="mb-6 text-2xl font-bold text-white">Top Rated Movies</h2>
                {isLoading ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {Array.from({ length: 18 }).map((_, i) => (
                      <div key={i} className="animate-pulse rounded-lg bg-moviemate-card">
                        <div className="aspect-[2/3]"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {topRatedMovies.map((movie, index) => (
                      <motion.div
                        key={movie.id}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                      >
                        <MovieCard item={movie} type="movie" />
                      </motion.div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </TabsContent>
          
          <TabsContent value="tvshows" className="mt-0">
            <div className="mb-12 space-y-8">
              <section>
                <h2 className="mb-6 text-2xl font-bold text-white">Popular TV Shows</h2>
                {isLoading ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {Array.from({ length: 18 }).map((_, i) => (
                      <div key={i} className="animate-pulse rounded-lg bg-moviemate-card">
                        <div className="aspect-[2/3]"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {popularTvShows.map((show, index) => (
                      <motion.div
                        key={show.id}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                      >
                        <MovieCard item={show} type="tv" />
                      </motion.div>
                    ))}
                  </div>
                )}
              </section>
              
              <section>
                <h2 className="mb-6 text-2xl font-bold text-white">Top Rated TV Shows</h2>
                {isLoading ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {Array.from({ length: 18 }).map((_, i) => (
                      <div key={i} className="animate-pulse rounded-lg bg-moviemate-card">
                        <div className="aspect-[2/3]"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {topRatedTvShows.map((show, index) => (
                      <motion.div
                        key={show.id}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                      >
                        <MovieCard item={show} type="tv" />
                      </motion.div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Explore;
