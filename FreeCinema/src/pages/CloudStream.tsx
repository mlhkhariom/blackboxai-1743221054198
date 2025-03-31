
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CLOUDSTREAM_SOURCES, CloudStreamContent, CloudStreamSource, searchCloudStreamContent, fetchAllSources, subscribeToCloudStreamUpdates, syncSourcesToSupabase, INDIAN_LANGUAGES } from '../services/cloudstream';
import Navbar from '../components/Navbar';
import { Search, Filter, Cloud, Loader2, AlertCircle, RefreshCw, Globe } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '../components/ui/use-toast';
import { useAdmin } from '../contexts/AdminContext';
import { useIsMobile } from '@/hooks/use-mobile';
import CloudStreamSourceCard from '@/components/cloudstream/CloudStreamSourceCard';
import CloudStreamContentCard from '@/components/cloudstream/CloudStreamContentCard';
import CloudStreamFilterSection from '@/components/cloudstream/CloudStreamFilterSection';

const CloudStream = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [combinedResults, setCombinedResults] = useState<CloudStreamContent[]>([]);
  const [availableSources, setAvailableSources] = useState<CloudStreamSource[]>([]);
  const [groupedSources, setGroupedSources] = useState<Record<string, CloudStreamSource[]>>({});
  const [categories, setCategories] = useState<string[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { settings } = useAdmin();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Fetch sources from Supabase
  const { 
    data: sourcesData, 
    isLoading: isLoadingSources, 
    error: sourcesError,
    refetch: refetchSources 
  } = useQuery({
    queryKey: ['cloudstream-sources'],
    queryFn: fetchAllSources,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Effect to sync sources on first load
  useEffect(() => {
    const syncSources = async () => {
      const result = await syncSourcesToSupabase();
      if (result) {
        refetchSources();
      }
    };
    
    syncSources();
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    const unsubscribe = subscribeToCloudStreamUpdates(() => {
      refetchSources();
      refetch();
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  // Process sources when they are loaded
  useEffect(() => {
    if (sourcesData) {
      setAvailableSources(sourcesData);
      
      // Group sources by category
      const grouped: Record<string, CloudStreamSource[]> = {};
      
      sourcesData.forEach(source => {
        const sourceCategories = source.categories || [];
        
        if (sourceCategories.length === 0) {
          const category = 'uncategorized';
          if (!grouped[category]) grouped[category] = [];
          grouped[category].push(source);
          return;
        }
        
        sourceCategories.forEach(category => {
          if (!grouped[category]) grouped[category] = [];
          grouped[category].push(source);
        });
      });
      
      // Make sure Indian content is at the top
      const sortedCategories = Object.keys(grouped).sort((a, b) => {
        if (a === 'indian') return -1;
        if (b === 'indian') return 1;
        return a.localeCompare(b);
      });
      
      setGroupedSources(grouped);
      setCategories(sortedCategories);
    }
  }, [sourcesData]);

  // Search content query
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['cloudstreamContent', searchQuery, selectedSources, selectedLanguage, page],
    queryFn: () => searchCloudStreamContent(
      searchQuery, 
      selectedSources.length ? selectedSources : undefined,
      {
        indianContent: true,
        language: selectedLanguage || undefined,
        page: page,
        pageSize: 20
      }
    ),
    enabled: true,
    placeholderData: (prev) => prev,
  });

  // Update combined results when new data arrives
  useEffect(() => {
    if (data?.results && !isLoading) {
      if (page === 1) {
        // Reset results for first page
        setCombinedResults(data.results);
      } else {
        // Append results for subsequent pages
        setCombinedResults(prev => [...prev, ...data.results]);
      }
    }
  }, [data, isLoading, page]);

  // Infinite scrolling
  useEffect(() => {
    if (loadMoreRef.current && !isLoading) {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && data?.hasMore) {
          setPage(prev => prev + 1);
        }
      });

      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [data, isLoading]);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: searchQuery });
    setPage(1);
    refetch();
  };

  // Toggle source selection
  const toggleSource = (name: string) => {
    setSelectedSources(prev => 
      prev.includes(name) 
        ? prev.filter(s => s !== name) 
        : [...prev, name]
    );
  };

  // Handle filter apply
  const applyFilters = () => {
    setPage(1);
    refetch();
    if (isMobile) {
      setShowFilters(false);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSelectedSources([]);
    setSelectedLanguage('');
  };

  // Handle content click to navigate to details
  const handleContentClick = (content: CloudStreamContent) => {
    navigate(`/cloudstream/${content.source}/${content.external_id || content.id.split('-').pop()}`);
  };

  // Force refresh data
  const handleRefresh = async () => {
    await syncSourcesToSupabase();
    await refetchSources();
    await refetch();
    toast({
      title: "Data Refreshed",
      description: "CloudStream data has been refreshed",
    });
  };

  // Render loading state
  const renderLoadingState = () => (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: isMobile ? 6 : 12 }).map((_, i) => (
        <div key={i} className="aspect-[2/3] animate-pulse rounded-lg bg-moviemate-card/40"></div>
      ))}
    </div>
  );

  // Render error state
  const renderErrorState = () => (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Failed to load content. Please try again later.
      </AlertDescription>
    </Alert>
  );

  // Render empty state
  const renderEmptyState = () => (
    <div className="text-center py-12">
      <h3 className="text-xl font-semibold">No Results Found</h3>
      <p className="mt-2 text-gray-400">
        {searchQuery 
          ? `No results found for "${searchQuery}". Try a different search term or source.` 
          : 'Start by searching for content or selecting sources.'}
      </p>
    </div>
  );

  // Render content
  const renderContent = () => (
    <>
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {combinedResults.map((content, index) => (
          <CloudStreamContentCard 
            key={`${content.id}-${index}`} 
            content={content} 
            onClick={handleContentClick} 
          />
        ))}
      </div>
      
      {/* Loading indicator for infinite scroll */}
      {data?.hasMore && (
        <div 
          ref={loadMoreRef} 
          className="flex justify-center items-center py-8"
        >
          {isFetching && (
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-moviemate-primary" />
              <span className="text-sm text-gray-400">Loading more content...</span>
            </div>
          )}
        </div>
      )}
      
      {!data?.hasMore && combinedResults.length > 0 && (
        <div className="py-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => {
                    if (page > 1) {
                      setPage(prev => prev - 1);
                      window.scrollTo(0, 0);
                    }
                  }}
                  className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {[...Array(Math.min(5, Math.max(page + 2, 3)))].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={page === i + 1}
                    onClick={() => {
                      setPage(i + 1);
                      window.scrollTo(0, 0);
                    }}
                    className="cursor-pointer"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext 
                  onClick={() => {
                    setPage(prev => prev + 1);
                    window.scrollTo(0, 0);
                  }}
                  className="cursor-pointer"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  );

  if (!settings.enableCloudStream) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-bold">CloudStream Content</h1>
          <p className="mt-4 text-gray-400">
            The administrator has disabled this feature. Please contact the site administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-24">
        <h1 className="mb-8 text-3xl font-bold text-center text-white flex items-center justify-center gap-2">
          <Cloud className="h-8 w-8 text-moviemate-primary" />
          Indian CloudStream Content
        </h1>
        
        <div className="mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  className="pl-8"
                  placeholder="Search Indian content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  type="submit"
                  className="bg-moviemate-primary hover:bg-moviemate-primary/80"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : 'Search'}
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isLoadingSources}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoadingSources ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
            
            {showFilters && (
              <div className="bg-moviemate-card/40 backdrop-blur-sm rounded-lg p-4 space-y-4">
                <div className="flex flex-wrap gap-4">
                  {/* Indian Language Filter */}
                  <div className="w-full sm:w-auto">
                    <label className="block text-sm font-medium mb-1">Language</label>
                    <Select
                      value={selectedLanguage}
                      onValueChange={setSelectedLanguage}
                    >
                      <SelectTrigger className="w-full sm:w-[180px] bg-background/30">
                        <SelectValue placeholder="All Languages" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Languages</SelectItem>
                        {INDIAN_LANGUAGES.map(lang => (
                          <SelectItem key={lang.code} value={lang.code} className="flex items-center gap-2">
                            <Globe className="h-3 w-3 inline" />
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {categories.length > 0 && (
                  <CloudStreamFilterSection
                    selectedSources={selectedSources}
                    toggleSource={toggleSource}
                    applyFilters={applyFilters}
                    clearFilters={clearFilters}
                    categories={categories}
                    groupedSources={groupedSources}
                    isLoading={isLoading || isLoadingSources}
                  />
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={clearFilters}
                    size="sm"
                  >
                    Clear Filters
                  </Button>
                  <Button 
                    onClick={applyFilters}
                    size="sm"
                    className="bg-moviemate-primary hover:bg-moviemate-primary/80"
                    disabled={isLoading}
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>
        
        {(isLoading && page === 1) || isLoadingSources ? renderLoadingState() 
          : error || sourcesError ? renderErrorState() 
          : combinedResults.length > 0 ? renderContent() 
          : renderEmptyState()
        }
      </main>
    </div>
  );
};

export default CloudStream;
