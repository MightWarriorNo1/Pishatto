import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SearchContextType {
  searchQuery: string;
  isSearchActive: boolean;
  filterResults: any[];
  setSearchQuery: (query: string) => void;
  setIsSearchActive: (active: boolean) => void;
  setFilterResults: (results: any[]) => void;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [filterResults, setFilterResults] = useState<any[]>([]);

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearchActive(false);
    setFilterResults([]);
  };

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        isSearchActive,
        filterResults,
        setSearchQuery,
        setIsSearchActive,
        setFilterResults,
        clearSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};
