
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Movie, TvShow } from '../types';
import { 
  getIndianMovies,
  getIndianTVShows
} from '../services/tmdb';
import Navbar from '../components/Navbar';
import TrendingSlider from '../components/TrendingSlider';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';
import LiveTVSlider from '../components/LiveTVSlider';
import ContinueWatching from '../components/ContinueWatching';
import { Button } from '@/components/ui/button';
import { ArrowRight, Film, Tv, Globe, Play, PlayCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { handleAPIError } from '../services/error-handler';
import ErrorHandler from '../components/ErrorHandler';

const Index = () => {
  const [indianMovies, setIndianMovies] = useState<Movie[]>([]);
  const [indianTvShows, setIndianTvShows] = useState<TvShow[]>([]);
  const [webSeries, setWebSeries] = useState<TvShow[]>([]);
  const [tvSerials, setTvSerials] = useState<TvShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFeatured, setCurrentFeatured] = useState<(Movie | TvShow) | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  
  // Filter for web series vs TV serials
  const filterWebSeries = (shows: TvShow[]) => {
    return shows.filter(show => {
      // Explicit check for web_series type first
      if (show.show_type === 'web_series') return true;
      
      // Criteria for web series if not explicitly marked
      return (
        (!show.number_of_seasons || show.number_of_seasons < 5) && 
        (!show.number_of_episodes || show.number_of_episodes < 50) &&
        show.show_type !== 'tv_serial' &&
        (show.vote_average >= 6.5)
      );
    });
  };
  
  const filterTvSerials = (shows: TvShow[]) => {
    return shows.filter(show => {
      // Explicit check for tv_serial type first
      if (show.show_type === 'tv_serial') return true;
      
      // Criteria for TV serials if not explicitly marked
      return (
        (show.number_of_episodes >= 50 || show.number_of_seasons >= 5) &&
        show.show_type !== 'web_series'
      );
    });
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch Indian content only
        const [
          indianMoviesRes,
          indianTvShowsRes
        ] = await Promise.all([
          getIndianMovies(),
          getIndianTVShows()
        ]);
        
        setIndianMovies(indianMoviesRes.results);
        setIndianTvShows(indianTvShowsRes.results);
        
        // Separate Web Series and TV Serials
        const webSeriesResults = filterWebSeries(indianTvShowsRes.results);
        const tvSerialsResults = filterTvSerials(indianTvShowsRes.results);
        
        setWebSeries(webSeriesResults);
        setTvSerials(tvSerialsResults);
        
        // Set a featured content from Indian movies or web series
        const allTopIndian = [
          ...indianMoviesRes.results.slice(0, 3),
          ...webSeriesResults.slice(0, 3)
        ];
        
        if (allTopIndian.length > 0) {
          setCurrentFeatured(allTopIndian[Math.floor(Math.random() * allTopIndian.length)]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error as Error);
        const errorMessage = handleAPIError(error);
        toast({
          title: "Error loading content",
          description: errorMessage.message || "There was a problem loading content. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
  // Combine trending movies and TV shows for the main slider
  const trendingContent = [...indianMovies.slice(0, 5), ...indianTvShows.slice(0, 5)];
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };
  
  if (error) {
    return <ErrorHandler error={error} />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-moviemate-background to-purple-900/20">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-16">
        {/* Auto-play Featured Content at Top */}
        {currentFeatured && (
          <motion.div 
            className="relative mb-10 overflow-hidden rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative aspect-video overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ 
                  backgroundImage: `url(https://image.tmdb.org/t/p/original${currentFeatured.backdrop_path})`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-moviemate-background via-black/70 to-black/30"></div>
              </div>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-white">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.7 }}
                >
                  <Button 
                    className="mb-4 h-20 w-20 rounded-full bg-moviemate-primary hover:bg-moviemate-primary/90"
                    onClick={() => {
                      const contentType = 'title' in currentFeatured ? 'movie' : 'tv';
                      const contentRoute = `/${contentType}/${currentFeatured.id}`;
                      window.location.href = contentRoute;
                    }}
                  >
                    <Play size={36} />
                  </Button>
                </motion.div>
                
                <motion.h2 
                  className="mb-2 max-w-2xl text-4xl font-bold"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.7 }}
                >
                  {'title' in currentFeatured ? currentFeatured.title : currentFeatured.name}
                </motion.h2>
                
                <motion.p 
                  className="mb-6 max-w-2xl text-gray-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.7 }}
                >
                  {currentFeatured.overview ? (currentFeatured.overview.slice(0, 150) + '...') : 'No description available'}
                </motion.p>
                
                <motion.div
                  className="flex gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.7 }}
                >
                  <Link to={'title' in currentFeatured ? `/movie/${currentFeatured.id}` : `/tv/${currentFeatured.id}`}>
                    <Button className="bg-moviemate-primary hover:bg-moviemate-primary/90">
                      <PlayCircle className="mr-2" size={18} />
                      Watch Now
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Hero Search Section for Mobile */}
        <div className="mb-8 flex flex-col gap-4 rounded-xl bg-gradient-to-br from-moviemate-card/70 to-purple-900/30 p-6 backdrop-blur-sm md:hidden">
          <h1 className="text-2xl font-bold text-white">Find your favorite Indian movies and shows</h1>
          <SearchBar minimal className="w-full" />
        </div>
        
        {/* Featured Content Slider */}
        {isLoading ? (
          <div className="animate-pulse rounded-xl bg-moviemate-card">
            <div className="aspect-[16/9] w-full"></div>
          </div>
        ) : (
          <motion.div 
            className="animate-fade-in"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <TrendingSlider items={trendingContent} title="Featured Indian Content" />
          </motion.div>
        )}
        
        {/* Continue Watching Section */}
        <div className="mt-12">
          <ContinueWatching />
        </div>
        
        {/* Quick Navigation */}
        <motion.div 
          className="my-10 grid grid-cols-2 gap-4 md:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Link to="/movies">
              <div className="group flex flex-col items-center gap-3 rounded-xl bg-gradient-to-br from-purple-600/20 to-purple-900/20 p-6 text-center backdrop-blur transition hover:from-purple-600/30 hover:to-purple-900/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-600/30 group-hover:bg-purple-600/50">
                  <Film className="text-white" size={20} />
                </div>
                <span className="text-lg font-semibold text-white">Movies</span>
              </div>
            </Link>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Link to="/tv">
              <div className="group flex flex-col items-center gap-3 rounded-xl bg-gradient-to-br from-blue-600/20 to-blue-900/20 p-6 text-center backdrop-blur transition hover:from-blue-600/30 hover:to-blue-900/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/30 group-hover:bg-blue-600/50">
                  <Tv className="text-white" size={20} />
                </div>
                <span className="text-lg font-semibold text-white">Web Series</span>
              </div>
            </Link>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Link to="/tv-serials">
              <div className="group flex flex-col items-center gap-3 rounded-xl bg-gradient-to-br from-pink-600/20 to-pink-900/20 p-6 text-center backdrop-blur transition hover:from-pink-600/30 hover:to-pink-900/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-600/30 group-hover:bg-pink-600/50">
                  <Tv className="text-white" size={20} />
                </div>
                <span className="text-lg font-semibold text-white">TV Serials</span>
              </div>
            </Link>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Link to="/live-tv">
              <div className="group flex flex-col items-center gap-3 rounded-xl bg-gradient-to-br from-teal-600/20 to-teal-900/20 p-6 text-center backdrop-blur transition hover:from-teal-600/30 hover:to-teal-900/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-600/30 group-hover:bg-teal-600/50">
                  <Globe className="text-white" size={20} />
                </div>
                <span className="text-lg font-semibold text-white">Live TV</span>
              </div>
            </Link>
          </motion.div>
        </motion.div>
        
        {/* Content Sections */}
        <div className="mt-12 space-y-12">
          {/* Indian Movies */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Indian Movies</h2>
              <Link to="/movies" className="flex items-center gap-1 text-sm font-medium text-moviemate-primary hover:underline">
                View All
                <ArrowRight size={16} />
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
              <motion.div 
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {indianMovies.slice(0, 6).map((movie, index) => (
                  <motion.div key={movie.id} variants={itemVariants} custom={index}>
                    <MovieCard item={movie} type="movie" />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>
          
          {/* Indian Web Series */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Indian Web Series</h2>
              <Link to="/tv" className="flex items-center gap-1 text-sm font-medium text-moviemate-primary hover:underline">
                View All
                <ArrowRight size={16} />
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
              <motion.div 
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {webSeries.slice(0, 6).map((show, index) => (
                  <motion.div key={show.id} variants={itemVariants} custom={index}>
                    <MovieCard item={show} type="tv" />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>
          
          {/* TV Serials */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Indian TV Serials</h2>
              <Link to="/tv-serials" className="flex items-center gap-1 text-sm font-medium text-moviemate-primary hover:underline">
                View All
                <ArrowRight size={16} />
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
              <motion.div 
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {tvSerials.slice(0, 6).map((show, index) => (
                  <motion.div key={show.id} variants={itemVariants} custom={index}>
                    <MovieCard item={show} type="tv" />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>
          
          {/* Live TV Slider */}
          <LiveTVSlider />
        </div>
        
        {/* CTA Section */}
        <motion.div 
          className="my-16 overflow-hidden rounded-xl bg-gradient-to-r from-moviemate-primary/20 to-purple-900/20 p-8 backdrop-blur-sm lg:p-12"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
            <div className="max-w-2xl">
              <h2 className="mb-3 text-2xl font-bold text-white lg:text-3xl">Discover Indian Entertainment</h2>
              <p className="text-gray-300">Access thousands of Indian movies, web series, and TV shows with our easy-to-use streaming platform.</p>
            </div>
            <Button className="bg-moviemate-primary px-6 py-6 text-base hover:bg-moviemate-primary/90">Start Watching</Button>
          </div>
        </motion.div>
        
        {/* Footer */}
        <footer className="mt-16 py-8 text-center text-sm text-gray-500">
          <p>© 2023 FreeCinema. All rights reserved.</p>
          <p className="mt-2">
            Powered by{' '}
            <a 
              href="https://www.themoviedb.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-moviemate-primary hover:underline"
            >
              TMDB
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
