
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchMulti } from '../services/tmdb';
import { getImageUrl } from '../services/tmdb';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Film, Tv, Search as SearchIcon, X } from 'lucide-react';

interface SearchBarProps {
  minimal?: boolean;
  className?: string;
}

const SearchBar = ({ minimal = false, className = '' }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const commandRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // Debounced search query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue.trim().length > 1) {
        setQuery(inputValue);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [inputValue]);
  
  // Fetch search results
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search-suggestions', query],
    queryFn: () => query.length > 1 ? searchMulti(query) : { results: [] },
    enabled: query.length > 1
  });
  
  // Handle keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !minimal) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      
      // Close suggestions on Escape
      if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [minimal]);
  
  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (commandRef.current && !commandRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(inputValue.trim())}`);
      setInputValue('');
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };
  
  const handleSuggestionClick = (id: number, type: 'movie' | 'tv') => {
    navigate(`/${type}/${id}`);
    setInputValue('');
    setShowSuggestions(false);
  };
  
  const filteredResults = searchResults?.results?.filter(
    item => item.media_type === 'movie' || item.media_type === 'tv'
  ).slice(0, 6) || [];
  
  return (
    <form 
      onSubmit={handleSubmit}
      className={`${className} relative transition-all ${
        minimal 
          ? 'w-full' 
          : isFocused 
            ? 'w-full max-w-lg' 
            : 'w-full max-w-xs'
      }`}
    >
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          placeholder={minimal ? "Search" : "Search movies, TV shows..."}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            if (inputValue.trim().length > 1) {
              setShowSuggestions(true);
            }
          }}
          onBlur={() => setIsFocused(false)}
          className={`peer w-full rounded-full border border-gray-700 bg-gray-800/50 py-2 pl-10 pr-4 text-sm text-white placeholder-gray-400 outline-none backdrop-blur-lg transition-all focus:border-moviemate-primary focus:ring-1 focus:ring-moviemate-primary ${
            minimal ? 'h-10' : 'h-12'
          }`}
        />
        <div className="absolute left-3 text-gray-400 peer-focus:text-moviemate-primary">
          <SearchIcon width="20" height="20" />
        </div>
        
        {inputValue && (
          <button
            type="button"
            onClick={() => {
              setInputValue('');
              setShowSuggestions(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 rounded-full p-1 text-gray-400 hover:bg-gray-700 hover:text-white"
          >
            <X size={16} />
          </button>
        )}
        
        {!minimal && !isFocused && (
          <div className="absolute right-3 rounded border border-gray-700 bg-gray-800 px-1.5 py-0.5 text-xs text-gray-400">
            /
          </div>
        )}
      </div>
      
      {/* Search suggestions */}
      {showSuggestions && (
        <div 
          ref={commandRef}
          className="absolute z-50 mt-2 w-full rounded-lg border border-gray-700 bg-gray-800/95 p-1 shadow-lg backdrop-blur-lg"
        >
          <div className="max-h-[350px] overflow-y-auto rounded-md">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-gray-400">
                Loading suggestions...
              </div>
            ) : filteredResults.length > 0 ? (
              <div>
                {filteredResults.map((item: any) => (
                  <div 
                    key={`${item.id}-${item.media_type}`}
                    onClick={() => handleSuggestionClick(item.id, item.media_type)}
                    className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-gray-700"
                  >
                    <div className="h-12 w-10 flex-shrink-0 overflow-hidden rounded bg-gray-700">
                      {item.poster_path ? (
                        <img 
                          src={getImageUrl(item.poster_path, 'w92')} 
                          alt={item.title || item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          {item.media_type === 'movie' ? (
                            <Film size={16} className="text-gray-400" />
                          ) : (
                            <Tv size={16} className="text-gray-400" />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium text-white">
                        {item.title || item.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          {item.media_type === 'movie' ? (
                            <>
                              <Film size={12} />
                              <span>Movie</span>
                            </>
                          ) : (
                            <>
                              <Tv size={12} />
                              <span>TV Show</span>
                            </>
                          )}
                        </span>
                        {item.release_date && (
                          <span>
                            {new Date(item.release_date).getFullYear()}
                          </span>
                        )}
                        {item.first_air_date && (
                          <span>
                            {new Date(item.first_air_date).getFullYear()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                <div 
                  className="mt-1 cursor-pointer rounded-md border-t border-gray-700 p-2 text-center text-sm font-medium text-moviemate-primary hover:bg-gray-700"
                  onClick={handleSubmit}
                >
                  See all results for "{query}"
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-gray-400">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </form>
  );
};

export default SearchBar;
