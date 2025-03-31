
import React, { createContext, useState, useContext, useEffect } from 'react';
import { AdminSettings, AdminUser, LiveTVCategory } from '../types';

interface AdminContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  settings: AdminSettings;
  updateSettings: (newSettings: Partial<AdminSettings>) => void;
  liveTVCategories: LiveTVCategory[];
  updateLiveTVCategories: (categories: LiveTVCategory[]) => void;
  featuredChannels: string[];
  updateFeaturedChannels: (channels: string[]) => void;
  m3uSources: M3USource[];
  updateM3USources: (sources: M3USource[]) => void;
  cloudstreamRepos: CloudStreamRepo[];
  updateCloudstreamRepos: (repos: CloudStreamRepo[]) => void;
  cloudstreamPlugins: CloudStreamPlugin[];
  updateCloudstreamPlugins: (plugins: CloudStreamPlugin[]) => void;
}

export interface M3USource {
  id: string;
  name: string;
  url: string;
  isEnabled: boolean;
  lastSynced?: string;
}

export interface CloudStreamRepo {
  id: string;
  name: string;
  url: string;
  description?: string;
  author?: string;
  isEnabled: boolean;
  lastSynced?: string;
  pluginCount?: number;
}

export interface CloudStreamPlugin {
  id: string;
  name: string;
  url: string;
  version?: string;
  description?: string;
  language?: string;
  categories?: string[];
  repository?: string;
  isEnabled: boolean;
}

const defaultSettings: AdminSettings = {
  siteName: 'FreeCinema',
  siteDescription: 'Watch movies and TV shows online for free',
  primaryColor: '#9b87f5', // Default moviemate-primary color
  secondaryColor: '#7E69AB',
  accentColor: '#6E59A5',
  sidebarBackgroundColor: '#1a1f2c',
  logoUrl: '',
  enableLiveTV: true,
  enableCloudStream: true,
  enableAutoPlay: true,
  enable3DEffects: true,
  tmdbApiKey: '43d89010b257341339737be36dfaac13',
  customCSS: '',
  featuredContent: {
    movie: null,
    tvShow: null,
  },
};

// Default admin credentials
const DEFAULT_ADMIN: AdminUser = {
  email: 'admin@redxerox.eu.org',
  password: 'Admin@123',
  name: 'Admin',
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  // Fix for the useState null error - use lazy initialization
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [settings, setSettings] = useState<AdminSettings>(() => {
    try {
      const storedSettings = localStorage.getItem('adminSettings');
      return storedSettings ? JSON.parse(storedSettings) : defaultSettings;
    } catch (error) {
      console.error('Error loading admin settings from localStorage:', error);
      return defaultSettings;
    }
  });
  
  const [liveTVCategories, setLiveTVCategories] = useState<LiveTVCategory[]>(() => {
    try {
      const storedCategories = localStorage.getItem('liveTVCategories');
      return storedCategories ? JSON.parse(storedCategories) : [];
    } catch (error) {
      console.error('Error loading live TV categories from localStorage:', error);
      return [];
    }
  });
  
  const [featuredChannels, setFeaturedChannels] = useState<string[]>(() => {
    try {
      const storedChannels = localStorage.getItem('featuredChannels');
      return storedChannels ? JSON.parse(storedChannels) : [];
    } catch (error) {
      console.error('Error loading featured channels from localStorage:', error);
      return [];
    }
  });
  
  const [m3uSources, setM3USources] = useState<M3USource[]>(() => {
    try {
      const storedSources = localStorage.getItem('m3uSources');
      return storedSources ? JSON.parse(storedSources) : [];
    } catch (error) {
      console.error('Error loading M3U sources from localStorage:', error);
      return [];
    }
  });
  
  const [cloudstreamRepos, setCloudstreamRepos] = useState<CloudStreamRepo[]>(() => {
    try {
      const storedRepos = localStorage.getItem('cloudstreamRepos');
      return storedRepos ? JSON.parse(storedRepos) : [];
    } catch (error) {
      console.error('Error loading CloudStream repositories from localStorage:', error);
      return [];
    }
  });

  const [cloudstreamPlugins, setCloudstreamPlugins] = useState<CloudStreamPlugin[]>(() => {
    try {
      const storedPlugins = localStorage.getItem('cloudstreamPlugins');
      return storedPlugins ? JSON.parse(storedPlugins) : [];
    } catch (error) {
      console.error('Error loading CloudStream plugins from localStorage:', error);
      return [];
    }
  });

  // Check if the user is already authenticated
  useEffect(() => {
    try {
      const adminAuth = localStorage.getItem('adminAuth');
      if (adminAuth) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking authentication status:', error);
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('adminSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving admin settings to localStorage:', error);
    }
  }, [settings]);

  // Save Live TV categories to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('liveTVCategories', JSON.stringify(liveTVCategories));
    } catch (error) {
      console.error('Error saving live TV categories to localStorage:', error);
    }
  }, [liveTVCategories]);

  // Save featured channels to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('featuredChannels', JSON.stringify(featuredChannels));
    } catch (error) {
      console.error('Error saving featured channels to localStorage:', error);
    }
  }, [featuredChannels]);

  // Save M3U sources to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('m3uSources', JSON.stringify(m3uSources));
    } catch (error) {
      console.error('Error saving M3U sources to localStorage:', error);
    }
  }, [m3uSources]);
  
  // Save CloudStream repos to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('cloudstreamRepos', JSON.stringify(cloudstreamRepos));
    } catch (error) {
      console.error('Error saving CloudStream repositories to localStorage:', error);
    }
  }, [cloudstreamRepos]);
  
  // Save CloudStream plugins to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('cloudstreamPlugins', JSON.stringify(cloudstreamPlugins));
    } catch (error) {
      console.error('Error saving CloudStream plugins to localStorage:', error);
    }
  }, [cloudstreamPlugins]);

  const login = (email: string, password: string): boolean => {
    if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
      localStorage.setItem('adminAuth', 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
  };

  const updateSettings = (newSettings: Partial<AdminSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const updateLiveTVCategories = (categories: LiveTVCategory[]) => {
    setLiveTVCategories(categories);
  };

  const updateFeaturedChannels = (channels: string[]) => {
    setFeaturedChannels(channels);
  };

  const updateM3USources = (sources: M3USource[]) => {
    setM3USources(sources);
  };
  
  const updateCloudstreamRepos = (repos: CloudStreamRepo[]) => {
    setCloudstreamRepos(repos);
  };
  
  const updateCloudstreamPlugins = (plugins: CloudStreamPlugin[]) => {
    setCloudstreamPlugins(plugins);
  };

  return (
    <AdminContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        settings,
        updateSettings,
        liveTVCategories,
        updateLiveTVCategories,
        featuredChannels,
        updateFeaturedChannels,
        m3uSources,
        updateM3USources,
        cloudstreamRepos,
        updateCloudstreamRepos,
        cloudstreamPlugins,
        updateCloudstreamPlugins,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
