import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchMulti } from '../services/tmdb';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Movie, TvShow } from '../types';
import { SearchIcon, Film, Tv, Loader } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [query, setQuery] = useState(queryParam);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  // Update query state when URL param changes
  useEffect(() => {
    setQuery(queryParam);
  }, [queryParam]);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['search', queryParam],
    queryFn: () => searchMulti(queryParam),
    enabled: queryParam.length > 0,
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };
  
  // Filter results by content type
  const filteredResults = data?.results?.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'movies') return 'title' in item;
    if (activeTab === 'tv') return 'name' in item;
    return true;
  });
  
  const movies = data?.results?.filter(item => 'title' in item) as Movie[];
  const tvShows = data?.results?.filter(item => 'name' in item && !('title' in item)) as TvShow[];
  
  return (
    <div className="min-h-screen bg-moviemate-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16 pt-24">
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold text-white">Search</h1>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search for movies, TV shows..."
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>
        
        {queryParam && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl text-white">
              {isLoading 
                ? 'Searching...' 
                : `Search results for "${queryParam}"`}
            </h2>
            
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">
                  All ({data?.results?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="movies">
                  <Film className="mr-1 h-4 w-4" />
                  Movies ({movies?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="tv">
                  <Tv className="mr-1 h-4 w-4" />
                  TV Shows ({tvShows?.length || 0})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader className="h-8 w-8 animate-spin text-moviemate-primary" />
                  </div>
                ) : error ? (
                  <div className="rounded-lg bg-red-500/10 p-4 text-center">
                    <p className="text-red-300">Error fetching search results</p>
                  </div>
                ) : filteredResults?.length ? (
                  <motion.div 
                    className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.05 }}
                  >
                    {filteredResults.map((item) => {
                      const isMovie = 'title' in item;
                      const contentType = isMovie ? 'movie' : 'tv';
                      
                      return (
                        <MovieCard 
                          key={`${contentType}-${item.id}`}
                          item={item}
                          type={contentType as 'movie' | 'tv'} 
                        />
                      );
                    })}
                  </motion.div>
                ) : (
                  <div className="rounded-lg bg-moviemate-card p-8 text-center">
                    <p className="text-xl text-gray-400">No results found</p>
                    <p className="mt-2 text-gray-500">
                      Try a different search term or browse our content instead
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
};

export default Search;
