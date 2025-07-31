import React, { useState, useEffect, useRef } from 'react';
import {useNavigate} from 'react-router-dom'
import { Search, QrCode, X } from 'lucide-react';
import { getCastList } from '../../services/api';
import { CastProfile } from '../../services/api';
import QRCodeModal from './QRCodeModal';

interface TopNavigationProps {
  activeTab: 'home' | 'favorites' | 'footprints' | 'ranking';
  // eslint-disable-next-line
  onTabChange: (tab: 'home' | 'favorites' | 'footprints' | 'ranking') => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({ activeTab, onTabChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CastProfile[]>([]);
  const [allCasts, setAllCasts] = useState<CastProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate=useNavigate();
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { key: 'home', label: 'ホーム' },
    { key: 'favorites', label: 'お気に入り' },
    { key: 'footprints', label: '足あとから' },
    { key: 'ranking', label: 'ランキング' },
  ];

  // Fetch all casts on component mount
  useEffect(() => {
    const fetchAllCasts = async () => {
      setIsLoading(true);
      try {
        const response = await getCastList({});
        setAllCasts(response.casts || []);
      } catch (error) {
        console.error('Error fetching casts:', error);
        setAllCasts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllCasts();
  }, []);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    if (showResults) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showResults]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      // Use the existing API with search parameter
      const response = await getCastList({ search: query });
      setSearchResults(response.casts || []);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      const filtered = allCasts.filter(cast => {
        // Handle height search with or without units
        const heightMatch = cast.height ? 
          cast.height.toString().includes(query) || 
          cast.height.toString().replace('cm', '').includes(query) ||
          query.includes(cast.height.toString().replace('cm', '')) : false;
        
        // Handle age search
        const ageMatch = cast.birth_year ? 
          (new Date().getFullYear() - (cast.birth_year)).toString().includes(query) : false;
        
        return heightMatch || ageMatch;
      });
      setSearchResults(filtered);
      setShowResults(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim()) {
      // Debounce search
      const timeoutId = setTimeout(() => {
        handleSearch(value);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleInputFocus = () => {
    if (!searchQuery.trim() && allCasts.length > 0) {
      setSearchResults(allCasts);
      setShowResults(true);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const getAgeFromBirthYear = (birthYear?: number) => {
    if (!birthYear) return null;
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear;
  };

  const getFirstAvatarUrl = (avatarString: string | null | undefined): string => {
    if (!avatarString) {
      return '/assets/avatar/female.png';
    }
    
    // Split by comma and get the first non-empty avatar
    const avatars = avatarString.split(',').map(avatar => avatar.trim()).filter(avatar => avatar.length > 0);
    
    if (avatars.length === 0) {
      return '/assets/avatar/female.png';
    }
    
    // If it's already a full URL, return as is
    if (avatars[0].startsWith('http')) {
      return avatars[0];
    }
    
    // Construct the full URL using the API base URL
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
    return `${API_BASE_URL}/${avatars[0]}`;
  };

  const handleCastClick=(castId:number)=>{
    navigate(`/cast/${castId}`);
  }
  return (
    <div className="fixed max-w-md mx-auto top-0 left-0 right-0 bg-primary z-50 border-b border-secondary">
      <div className="max-w-md mx-auto px-4 pt-5">
        <div className="flex items-center justify-between">
          <div className="flex-1 relative" ref={searchRef}>
            <input
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              placeholder="年齢,身長検索が可能になりました (例: 25歳 160cm)"
              className="w-full pl-10 pr-10 py-2 rounded-full bg-primary text-white text-sm border border-secondary placeholder-red-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white" />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
              >
                <X size={16} />
              </button>
            )}
            
            {/* Search Results */}
            {showResults && (
              <div className="mt-2 max-h-96 overflow-y-auto bg-primary border border-secondary rounded-lg absolute left-0 right-0 z-50 shadow-lg">
                {isLoading ? (
                  <div className="p-4 text-center text-white">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
                    <p className="mt-2">キャスト情報を読み込み中...</p>
                  </div>
                ) : isSearching ? (
                  <div className="p-4 text-center text-white">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
                    <p className="mt-2">検索中...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="p-2">
                    <div className="text-white text-sm mb-2 px-2">
                      {searchQuery.trim() ? `検索結果: ${searchResults.length}件` : `全キャスト: ${searchResults.length}件`}
                    </div>
                    {searchResults.map((cast) => (
                      <div
                        key={cast.id}
                        className="flex items-center p-3 border-b border-secondary last:border-b-0 hover:bg-secondary/20 rounded-lg cursor-pointer"
                        onClick={() => {
                          // Navigate to cast profile or handle cast selection
                          handleCastClick(cast.id);
                          // You can add navigation logic here
                          // For now, just close the search results
                          setShowResults(false);
                          setSearchQuery('');
                        }}
                      >
                        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mr-3 overflow-hidden">
                          {cast.avatar ? (
                            <img
                              src={getFirstAvatarUrl(cast.avatar)}
                              alt={cast.nickname}
                              className="w-12 h-12 rounded-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/assets/avatar/female.png';
                              }}
                            />
                          ) : (
                            <span className="text-white text-lg font-bold">
                              {cast.nickname?.charAt(0) || '?'}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-bold text-sm">{cast.nickname || 'No Name'}</div>
                          <div className="text-gray-300 text-xs">
                            {getAgeFromBirthYear(cast.birth_year) && (
                              <span className="mr-2">{getAgeFromBirthYear(cast.birth_year)}歳</span>
                            )}
                            {cast.height && <span>{cast.height}cm</span>}
                          </div>
                          {cast.profile_text && (
                            <div className="text-gray-400 text-xs mt-1 line-clamp-2">
                              {cast.profile_text}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchQuery.trim() ? (
                  <div className="p-4 text-center text-white">
                    <p>検索結果が見つかりませんでした</p>
                    <p className="text-sm text-gray-400 mt-1">
                      別のキーワードで検索してください
                    </p>
                  </div>
                ) : allCasts.length === 0 ? (
                  <div className="p-4 text-center text-white">
                    <p>キャスト情報がありません</p>
                    <p className="text-sm text-gray-400 mt-1">
                      しばらくしてから再度お試しください
                    </p>
                  </div>
                ) : null}
              </div>
            )}
          </div>
          <button className="ml-4" onClick={() => setShowQRCode(true)}>
            <QrCode />
          </button>
        </div>
        
        {/* Backdrop to prevent interaction with main content when search results are shown */}
        {showResults && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowResults(false)} />
        )}

        <div className="flex justify-between mt-3 text-sm">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`flex-1 py-3 px-2 text-center text-sm font-bold rounded-t-lg transition-colors ${activeTab === tab.key ? 'bg-secondary text-white' : 'bg-primary text-gray-400'}`}
              onClick={() => onTabChange(tab.key as any)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* QR Code Modal */}
      {showQRCode && <QRCodeModal onClose={() => setShowQRCode(false)} />}
    </div>
  );
};

export default TopNavigation; 