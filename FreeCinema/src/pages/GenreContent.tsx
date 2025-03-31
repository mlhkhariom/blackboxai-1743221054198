
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Movie, TvShow } from '../types';
import { fetchApi } from '../services/tmdb';
import MovieCard from '../components/MovieCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ContentResponse {
  page: number;
  results: Movie[] | TvShow[];
  total_pages: number;
  total_results: number;
}

const GenreContent = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [content, setContent] = useState<Movie[] | TvShow[]>([]);
  const [genreName, setGenreName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    const fetchGenreName = async () => {
      try {
        const API_KEY = '43d89010b257341339737be36dfaac13';
        const contentType = type === 'movie' ? 'movie' : 'tv';
        
        const response = await fetchApi<{ genres: { id: number; name: string }[] }>(
          `/genre/${contentType}/list?api_key=${API_KEY}&language=en-US`
        );
        
        const genre = response.genres.find((g) => g.id === parseInt(id || '0'));
        if (genre) {
          setGenreName(genre.name);
        }
      } catch (error) {
        console.error('Error fetching genre name:', error);
      }
    };
    
    fetchGenreName();
  }, [type, id]);
  
  useEffect(() => {
    const fetchGenreContent = async () => {
      if (!id || !type) return;
      
      try {
        setIsLoading(true);
        
        const API_KEY = '43d89010b257341339737be36dfaac13';
        const contentType = type === 'movie' ? 'movie' : 'tv';
        
        const response = await fetchApi<ContentResponse>(
          `/discover/${contentType}?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&with_genres=${id}&page=${currentPage}`
        );
        
        setContent(response.results);
        setTotalPages(response.total_pages);
      } catch (error) {
        console.error('Error fetching genre content:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGenreContent();
    // Scroll to top when page changes
    window.scrollTo(0, 0);
  }, [id, type, currentPage]);
  
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const contentTypeDisplay = type === 'movie' ? 'Movies' : 'TV Shows';
  
  const staggerContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };
  
  return (
    <div className="min-h-screen bg-moviemate-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24">
        <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">{genreName} {contentTypeDisplay}</h1>
        <p className="mb-8 text-gray-400">Page {currentPage} of {totalPages}</p>
        
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <Skeleton className="aspect-[2/3] w-full rounded-lg bg-moviemate-card" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {content.map((item) => (
              <motion.div key={item.id} variants={itemVariants}>
                <MovieCard item={item} type={type as 'movie' | 'tv'} />
              </motion.div>
            ))}
          </motion.div>
        )}
        
        <div className="mt-8 flex justify-center gap-4">
          <Button 
            onClick={handlePreviousPage} 
            disabled={currentPage <= 1}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ChevronLeft size={16} />
            Previous
          </Button>
          
          <Button 
            onClick={handleNextPage} 
            disabled={currentPage >= totalPages}
            variant="outline"
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight size={16} />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default GenreContent;
