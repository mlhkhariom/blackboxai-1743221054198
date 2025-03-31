
import { useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import AdminLayout from '../../components/admin/AdminLayout';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Save, 
  Film, 
  Tv, 
  Star, 
  Plus
} from 'lucide-react';
import { getImageUrl, searchMulti } from '../../services/tmdb';
import { useQuery } from '@tanstack/react-query';
import { Movie, TvShow } from '../../types';

const AdminContent = () => {
  const { settings, updateSettings } = useAdmin();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'movie' | 'tv'>('movie');
  
  // Track selected content
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(
    settings.featuredContent.movie ? { id: settings.featuredContent.movie } as Movie : null
  );
  const [selectedTvShow, setSelectedTvShow] = useState<TvShow | null>(
    settings.featuredContent.tvShow ? { id: settings.featuredContent.tvShow } as TvShow : null
  );
  
  // Search for content
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['admin-search', searchType, searchQuery],
    queryFn: () => searchMulti(searchQuery),
    enabled: searchQuery.length > 2,
  });
  
  // Filter results by content type
  const filteredResults = searchResults?.results?.filter(item => {
    if (searchType === 'movie') return 'title' in item;
    if (searchType === 'tv') return 'name' in item;
    return true;
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };
  
  const selectContent = (item: Movie | TvShow) => {
    if ('title' in item) {
      setSelectedMovie(item as Movie);
    } else {
      setSelectedTvShow(item as TvShow);
    }
    
    toast({
      title: 'Content Selected',
      description: `${('title' in item) ? item.title : item.name} has been selected`,
    });
  };
  
  const saveChanges = () => {
    updateSettings({
      featuredContent: {
        movie: selectedMovie?.id || null,
        tvShow: selectedTvShow?.id || null,
      }
    });
    
    toast({
      title: 'Settings Saved',
      description: 'Featured content settings have been updated',
    });
  };
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Content Management</h1>
          <Button 
            onClick={saveChanges}
            className="bg-moviemate-primary hover:bg-moviemate-primary/90"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <Card className="bg-moviemate-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Featured Content</CardTitle>
              <CardDescription>
                Select content to be featured on your homepage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="movie" className="w-full" onValueChange={(value) => setSearchType(value as 'movie' | 'tv')}>
                <TabsList className="mb-4 grid w-full grid-cols-2">
                  <TabsTrigger value="movie">
                    <Film className="mr-2 h-4 w-4" />
                    Featured Movie
                  </TabsTrigger>
                  <TabsTrigger value="tv">
                    <Tv className="mr-2 h-4 w-4" />
                    Featured TV Show
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="movie" className="space-y-4">
                  {selectedMovie ? (
                    <div className="rounded-lg bg-moviemate-background p-4">
                      <div className="flex flex-col items-center gap-4 sm:flex-row">
                        <img 
                          src={getImageUrl(selectedMovie.poster_path, 'w200')} 
                          alt={selectedMovie.title || 'Movie poster'} 
                          className="h-40 rounded-lg object-cover shadow-lg" 
                        />
                        <div>
                          <h3 className="mb-2 text-xl font-bold text-white">{selectedMovie.title}</h3>
                          {selectedMovie.release_date && (
                            <p className="text-sm text-gray-400">
                              Released: {new Date(selectedMovie.release_date).getFullYear()}
                            </p>
                          )}
                          {selectedMovie.vote_average && (
                            <div className="mt-2 flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
                              <span className="text-white">{selectedMovie.vote_average.toFixed(1)}</span>
                            </div>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-3"
                            onClick={() => setSelectedMovie(null)}
                          >
                            Remove Selection
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-gray-700 bg-moviemate-background p-4">
                      <Film className="mb-2 h-8 w-8 text-gray-500" />
                      <p className="text-gray-400">No featured movie selected</p>
                      <p className="text-xs text-gray-500">Search for a movie below</p>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <form onSubmit={handleSearch} className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search for a movie..."
                          className="pl-9"
                        />
                      </div>
                      <Button type="submit">Search</Button>
                    </form>
                    
                    {isLoading && (
                      <div className="text-center">
                        <p className="text-gray-400">Searching...</p>
                      </div>
                    )}
                    
                    {!isLoading && filteredResults && filteredResults.length > 0 && (
                      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
                        {filteredResults.map((item) => {
                          const movie = item as Movie;
                          return (
                            <div 
                              key={movie.id} 
                              className="cursor-pointer rounded-lg bg-moviemate-background p-2 transition-transform hover:scale-105"
                              onClick={() => selectContent(movie)}
                            >
                              <img 
                                src={getImageUrl(movie.poster_path, 'w200')} 
                                alt={movie.title} 
                                className="mb-2 w-full rounded-lg object-cover" 
                              />
                              <h4 className="truncate text-sm font-medium text-white">{movie.title}</h4>
                              {movie.release_date && (
                                <p className="text-xs text-gray-500">{new Date(movie.release_date).getFullYear()}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="tv" className="space-y-4">
                  {selectedTvShow ? (
                    <div className="rounded-lg bg-moviemate-background p-4">
                      <div className="flex flex-col items-center gap-4 sm:flex-row">
                        <img 
                          src={getImageUrl(selectedTvShow.poster_path, 'w200')} 
                          alt={selectedTvShow.name || 'TV Show poster'} 
                          className="h-40 rounded-lg object-cover shadow-lg" 
                        />
                        <div>
                          <h3 className="mb-2 text-xl font-bold text-white">{selectedTvShow.name}</h3>
                          {selectedTvShow.first_air_date && (
                            <p className="text-sm text-gray-400">
                              First aired: {new Date(selectedTvShow.first_air_date).getFullYear()}
                            </p>
                          )}
                          {selectedTvShow.vote_average && (
                            <div className="mt-2 flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
                              <span className="text-white">{selectedTvShow.vote_average.toFixed(1)}</span>
                            </div>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-3"
                            onClick={() => setSelectedTvShow(null)}
                          >
                            Remove Selection
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-gray-700 bg-moviemate-background p-4">
                      <Tv className="mb-2 h-8 w-8 text-gray-500" />
                      <p className="text-gray-400">No featured TV show selected</p>
                      <p className="text-xs text-gray-500">Search for a TV show below</p>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <form onSubmit={handleSearch} className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search for a TV show..."
                          className="pl-9"
                        />
                      </div>
                      <Button type="submit">Search</Button>
                    </form>
                    
                    {isLoading && (
                      <div className="text-center">
                        <p className="text-gray-400">Searching...</p>
                      </div>
                    )}
                    
                    {!isLoading && filteredResults && filteredResults.length > 0 && (
                      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
                        {filteredResults.map((item) => {
                          const tvShow = item as TvShow;
                          return (
                            <div 
                              key={tvShow.id} 
                              className="cursor-pointer rounded-lg bg-moviemate-background p-2 transition-transform hover:scale-105"
                              onClick={() => selectContent(tvShow)}
                            >
                              <img 
                                src={getImageUrl(tvShow.poster_path, 'w200')} 
                                alt={tvShow.name} 
                                className="mb-2 w-full rounded-lg object-cover" 
                              />
                              <h4 className="truncate text-sm font-medium text-white">{tvShow.name}</h4>
                              {tvShow.first_air_date && (
                                <p className="text-xs text-gray-500">{new Date(tvShow.first_air_date).getFullYear()}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminContent;
