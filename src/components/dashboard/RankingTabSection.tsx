import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchRanking } from '../../services/api';
import Spinner from '../ui/Spinner';

import { getFirstAvatarUrl } from '../../utils/avatar';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Format numbers with comma separators (e.g., 2,000)
const formatAmount = (value: unknown): string => {
  const num = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  if (!isFinite(num)) return '0';
  return new Intl.NumberFormat('en-US').format(num);
};

type UserType = 'cast' | 'guest';
type TimePeriod = 'current' | 'yesterday' | 'lastWeek' | 'lastMonth' | 'allTime';
type Category = 'gift' | 'reservation';

const areas = [
  '全国',
  '東京都',
  '大阪府',
  '愛知県',
  '福岡県',
  '北海道'
];

const RankingTabSection: React.FC<{ hideLoading?: boolean }> = ({ hideLoading = false }) => {
  const [userType, setUserType] = useState<UserType>('cast');
  const navigate=useNavigate();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('current');
  const [selectedCategory, setSelectedCategory] = useState<Category>('gift');
  const [selectedArea, setSelectedArea] = useState<string>('全国');
  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);
  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAreaSelect = (area: string) => {
    setSelectedArea(area);
    setIsAreaDropdownOpen(false);
  };

  const handleProfileClick = (item: any) => {
    const id = item?.id ?? item?.user_id;
    if (!id) return;
    if (userType === 'cast') {
      navigate(`/cast/${id}`);
    } else {
      navigate(`/guest/${id}`);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchRanking({
      userType,
      timePeriod,
      category: selectedCategory,
      area: selectedArea,
    }).then((res) => {
      setRanking(res.data || res.data?.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [userType, timePeriod, selectedCategory, selectedArea]);

  return (
    <div className="flex flex-col bg-gradient-to-b from-primary/10 via-primary to-secondary min-h-[calc(100vh-10rem)] relative">
      <div className="px-4 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            className={`flex-1 py-3 text-sm sm:text-base font-medium border-b-2 ${userType === 'cast'
              ? 'border-secondary text-white'
              : 'border-transparent text-white'
              }`}
            onClick={() => setUserType('cast')}
          >
            キャスト
          </button>
          <button
            className={`flex-1 py-3 text-sm sm:text-base font-medium border-b-2 ${userType === 'guest'
              ? 'border-secondary text-white'
              : 'border-transparent text-white'
              }`}
            onClick={() => setUserType('guest')}
          >
            ゲスト
          </button>
          <button
            className="shrink-0 flex items-center space-x-1 px-3 py-1.5 border rounded-md border-secondary text-white"
            onClick={() => setIsAreaDropdownOpen(!isAreaDropdownOpen)}
          >
            <span className="text-sm sm:text-base">{selectedArea}</span>
            <span className="text-xs sm:text-sm">▼</span>
          </button>

          {/* Area Dropdown */}
          {isAreaDropdownOpen && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="absolute inset-0 bg-gray-400 bg-opacity-50" onClick={() => setIsAreaDropdownOpen(false)} />
              <div className="relative w-48 bg-primary rounded-lg shadow-lg border border-secondary">
                <div className="py-2">
                  {areas.map((area) => (
                    <button
                      key={area}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-secondary hover:text-white flex items-center justify-between text-white"
                      onClick={() => handleAreaSelect(area)}
                    >
                      {area}
                      {selectedArea === area && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
                <div className="border-t flex justify-between p-3 border-secondary">
                  <button
                    className="text-sm text-white"
                    onClick={() => setIsAreaDropdownOpen(false)}
                  >
                    閉じる
                  </button>
                  <button
                    className="text-sm text-white font-medium"
                    onClick={() => setIsAreaDropdownOpen(false)}
                  >
                    決定
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category and Area Row */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between w-full">
          <div className="flex space-x-1 w-full overflow-x-auto">
            <button
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm ${selectedCategory === 'gift'
                ? 'bg-secondary text-white'
                : 'border border-gray-700 text-white'
                }`}
              onClick={() => setSelectedCategory('gift')}
            >
              ギフト
            </button>
            <button
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm ${selectedCategory === 'reservation'
                ? 'bg-secondary text-white'
                : 'border border-gray-700 text-white'
                }`}
              onClick={() => setSelectedCategory('reservation')}
            >
              予約
            </button>
          </div>
        </div>
      </div>

      {/* Time Period Row */}
      <div className="px-4 mt-4 mx-auto w-full">
        <div className="flex w-full text-xs sm:text-sm">
          <button
            className={`flex-1 py-2 ${timePeriod === 'current'
              ? 'text-white border-b border-secondary'
              : 'text-white'
              }`}
            onClick={() => setTimePeriod('current')}
          >
            今月
          </button>
          <button
            className={`flex-1 py-2 ${timePeriod === 'yesterday'
              ? 'text-white border-b border-secondary'
              : 'text-white'
              }`}
            onClick={() => setTimePeriod('yesterday')}
          >
            昨日
          </button>
          <button
            className={`flex-1 py-2 ${timePeriod === 'lastWeek'
              ? 'text-white border-b border-secondary'
              : 'text-white'
              }`}
            onClick={() => setTimePeriod('lastWeek')}
          >
            先週
          </button>
          <button
            className={`flex-1 py-2 ${timePeriod === 'lastMonth'
              ? 'text-white border-b border-secondary'
              : 'text-white'
              }`}
            onClick={() => setTimePeriod('lastMonth')}
          >
            先月
          </button>
          <button
            className={`flex-1 py-2 ${timePeriod === 'allTime'
              ? 'text-white border-b border-secondary'
              : 'text-white'
              }`}
            onClick={() => setTimePeriod('allTime')}
          >
            全期間
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex-col items-center justify-center w-full">
        {loading && !hideLoading ? (
          <div className="flex justify-center items-center py-8">
            <Spinner />
          </div>
        ) : ranking.length === 0 ? (
          <div className="text-white text-center mt-8">ランキングデータがありません</div>
        ) : (
          <div className="w-full">
            {ranking.map((item, idx) => (
              <div key={item.id || item.user_id} className="flex items-center p-2 border-b border-secondary">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white text-sm sm:text-base font-bold mr-2">{idx + 1}</div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gray-400 border-2 border-secondary mr-2 cursor-pointer" onClick={() => handleProfileClick(item)}>
                  <img
                    src={getFirstAvatarUrl(item.avatar)}
                    alt={item.name || item.nickname || ''}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-white font-bold text-sm sm:text-base">{item.name || item.nickname || ''}</div>
                  {/* {item.points !== undefined && (
                    <div className="text-[10px] sm:text-xs text-white mt-1">ポイント: {formatAmount(item.points)}</div>
                  )} */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RankingTabSection; 