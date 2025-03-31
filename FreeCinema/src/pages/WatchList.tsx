
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Plus, ListPlus, Film, Tv, Archive, ListX, SearchX, Trash2 } from 'lucide-react';
import { Movie, TvShow } from '../types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { getImageUrl } from '../services/tmdb';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

// Define WatchList item interface
interface WatchListItem {
  id: number;
  tmdbId: number;
  type: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  addedAt: string;
  notes?: string;
}

const WatchList = () => {
  const [watchList, setWatchList] = useState<WatchListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newListItem, setNewListItem] = useState({
    tmdbId: '',
    type: 'movie',
    title: '',
    notes: ''
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Load watch list from localStorage
    try {
      const savedList = localStorage.getItem('watchList');
      if (savedList) {
        setWatchList(JSON.parse(savedList));
      }
    } catch (error) {
      console.error('Error loading watch list:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your watch list',
        variant: 'destructive'
      });
    }
  }, [toast]);
  
  // Save watchList to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('watchList', JSON.stringify(watchList));
  }, [watchList]);
  
  const handleAddToWatchList = () => {
    if (!newListItem.title.trim() || !newListItem.tmdbId) {
      toast({
        title: 'Error',
        description: 'Please enter a valid title and ID',
        variant: 'destructive'
      });
      return;
    }
    
    const newItem: WatchListItem = {
      id: Date.now(), // Use timestamp as unique ID
      tmdbId: Number(newListItem.tmdbId),
      type: newListItem.type as 'movie' | 'tv',
      title: newListItem.title,
      posterPath: null, // We don't have this without API call
      addedAt: new Date().toISOString(),
      notes: newListItem.notes
    };
    
    setWatchList(prev => [newItem, ...prev]);
    setIsAddDialogOpen(false);
    setNewListItem({
      tmdbId: '',
      type: 'movie',
      title: '',
      notes: ''
    });
    
    toast({
      title: 'Added to Watchlist',
      description: `"${newItem.title}" has been added to your watchlist.`
    });
  };
  
  const handleRemoveFromWatchList = (id: number) => {
    const itemToRemove = watchList.find(item => item.id === id);
    if (!itemToRemove) return;
    
    const newList = watchList.filter(item => item.id !== id);
    setWatchList(newList);
    
    toast({
      title: 'Removed from Watchlist',
      description: `"${itemToRemove.title}" has been removed from your watchlist.`
    });
  };
  
  const filteredList = searchQuery.trim()
    ? watchList.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : watchList;
  
  const moviesList = filteredList.filter(item => item.type === 'movie');
  const tvList = filteredList.filter(item => item.type === 'tv');
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-moviemate-background to-purple-900/20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">My Watchlist</h1>
            <p className="text-gray-400">
              Keep track of shows and movies you want to watch
            </p>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-moviemate-primary hover:bg-moviemate-primary/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Add to Watchlist
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-moviemate-card sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add to Watchlist</DialogTitle>
                  <DialogDescription>
                    Add a movie or TV show to your watchlist
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Title
                    </Label>
                    <Input
                      id="title"
                      value={newListItem.title}
                      onChange={(e) => setNewListItem({...newListItem, title: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Type
                    </Label>
                    <div className="col-span-3">
                      <Tabs 
                        defaultValue="movie" 
                        value={newListItem.type}
                        onValueChange={(value) => setNewListItem({...newListItem, type: value})}
                      >
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="movie">Movie</TabsTrigger>
                          <TabsTrigger value="tv">TV Show</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tmdbId" className="text-right">
                      TMDB ID
                    </Label>
                    <Input
                      id="tmdbId"
                      type="number"
                      value={newListItem.tmdbId}
                      onChange={(e) => setNewListItem({...newListItem, tmdbId: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="notes" className="text-right">
                      Notes
                    </Label>
                    <Input
                      id="notes"
                      value={newListItem.notes}
                      onChange={(e) => setNewListItem({...newListItem, notes: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddToWatchList}>Add</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1">
            <Input
              placeholder="Search your watchlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md bg-moviemate-card/50 pl-10"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="mt-6">
          <TabsList className="mb-6 w-full max-w-md grid grid-cols-3">
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="movies">Movies</TabsTrigger>
            <TabsTrigger value="tv">TV Shows</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            {filteredList.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {filteredList.map((item) => (
                  <div key={item.id} className="group relative">
                    <Card className="overflow-hidden bg-moviemate-card">
                      <div className="relative aspect-[2/3] overflow-hidden bg-gray-800">
                        {item.posterPath ? (
                          <img
                            src={getImageUrl(item.posterPath, 'w500')}
                            alt={item.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-moviemate-background">
                            <ListPlus className="h-12 w-12 text-gray-600" />
                          </div>
                        )}
                        <div className="absolute inset-0 hidden items-center justify-center bg-black/60 transition-opacity group-hover:flex">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-white text-white hover:bg-white/20"
                            onClick={() => navigate(`/${item.type}/${item.tmdbId}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <h3 className="mb-1 line-clamp-1 font-medium text-white">{item.title}</h3>
                        <p className="text-xs text-gray-400">
                          Added: {new Date(item.addedAt).toLocaleDateString()}
                        </p>
                      </CardContent>
                      <CardFooter className="border-t border-gray-800 p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-red-400 hover:bg-red-950/30 hover:text-red-300"
                          onClick={() => handleRemoveFromWatchList(item.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl bg-moviemate-card/50 p-12 text-center backdrop-blur-sm">
                {searchQuery ? (
                  <>
                    <SearchX size={64} className="mb-4 text-gray-500" />
                    <h3 className="mb-2 text-xl font-semibold text-white">No results found</h3>
                    <p className="text-gray-400">Try a different search term</p>
                  </>
                ) : (
                  <>
                    <ListX size={64} className="mb-4 text-gray-500" />
                    <h3 className="mb-2 text-xl font-semibold text-white">Your watchlist is empty</h3>
                    <p className="text-gray-400">Start adding movies and TV shows to your watchlist</p>
                    <Button 
                      className="mt-4 bg-moviemate-primary hover:bg-moviemate-primary/90"
                      onClick={() => setIsAddDialogOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Item
                    </Button>
                  </>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="movies">
            {moviesList.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {moviesList.map((item) => (
                  <div key={item.id} className="group relative">
                    <Card className="overflow-hidden bg-moviemate-card">
                      <div className="relative aspect-[2/3] overflow-hidden bg-gray-800">
                        {item.posterPath ? (
                          <img
                            src={getImageUrl(item.posterPath, 'w500')}
                            alt={item.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-moviemate-background">
                            <Film className="h-12 w-12 text-gray-600" />
                          </div>
                        )}
                        <div className="absolute inset-0 hidden items-center justify-center bg-black/60 transition-opacity group-hover:flex">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-white text-white hover:bg-white/20"
                            onClick={() => navigate(`/movie/${item.tmdbId}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <h3 className="mb-1 line-clamp-1 font-medium text-white">{item.title}</h3>
                        <p className="text-xs text-gray-400">
                          Added: {new Date(item.addedAt).toLocaleDateString()}
                        </p>
                      </CardContent>
                      <CardFooter className="border-t border-gray-800 p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-red-400 hover:bg-red-950/30 hover:text-red-300"
                          onClick={() => handleRemoveFromWatchList(item.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl bg-moviemate-card/50 p-12 text-center backdrop-blur-sm">
                <Film size={64} className="mb-4 text-gray-500" />
                <h3 className="mb-2 text-xl font-semibold text-white">No movies in your watchlist</h3>
                <p className="text-gray-400">Add some movies to watch later</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="tv">
            {tvList.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {tvList.map((item) => (
                  <div key={item.id} className="group relative">
                    <Card className="overflow-hidden bg-moviemate-card">
                      <div className="relative aspect-[2/3] overflow-hidden bg-gray-800">
                        {item.posterPath ? (
                          <img
                            src={getImageUrl(item.posterPath, 'w500')}
                            alt={item.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-moviemate-background">
                            <Tv className="h-12 w-12 text-gray-600" />
                          </div>
                        )}
                        <div className="absolute inset-0 hidden items-center justify-center bg-black/60 transition-opacity group-hover:flex">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-white text-white hover:bg-white/20"
                            onClick={() => navigate(`/tv/${item.tmdbId}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <h3 className="mb-1 line-clamp-1 font-medium text-white">{item.title}</h3>
                        <p className="text-xs text-gray-400">
                          Added: {new Date(item.addedAt).toLocaleDateString()}
                        </p>
                      </CardContent>
                      <CardFooter className="border-t border-gray-800 p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-red-400 hover:bg-red-950/30 hover:text-red-300"
                          onClick={() => handleRemoveFromWatchList(item.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl bg-moviemate-card/50 p-12 text-center backdrop-blur-sm">
                <Tv size={64} className="mb-4 text-gray-500" />
                <h3 className="mb-2 text-xl font-semibold text-white">No TV shows in your watchlist</h3>
                <p className="text-gray-400">Add some TV shows to watch later</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default WatchList;
