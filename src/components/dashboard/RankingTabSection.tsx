import React, { useState } from 'react';

type UserType = 'cast' | 'guest';
type TimePeriod = 'current' | 'yesterday' | 'lastWeek' | 'lastMonth' | 'allTime';
type Category = '総合' | 'パトロール' | 'コバト' | 'ギフ';

const areas = [
  '全国',
  '東京',
  '大阪',
  '福岡',
  '名古屋'
];

const RankingTabSection: React.FC = () => {
  const [userType, setUserType] = useState<UserType>('cast');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('current');
  const [selectedCategory, setSelectedCategory] = useState<Category>('総合');
  const [selectedArea, setSelectedArea] = useState<string>('全国');
  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);

  const handleAreaSelect = (area: string) => {
    setSelectedArea(area);
    setIsAreaDropdownOpen(false);
  };

  return (
    <div className="flex flex-col bg-primary min-h-[calc(100vh-10rem)] relative">
      {/* User Type Tabs */}
      <div className="px-4 pt-4">
        <div className="flex">
          <button
            className={`flex-1 py-3 text-sm font-medium border-b-2 ${userType === 'cast'
              ? 'border-secondary text-white'
              : 'border-transparent text-white'
              }`}
            onClick={() => setUserType('cast')}
          >
            キャスト
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium border-b-2 ${userType === 'guest'
              ? 'border-secondary text-white'
              : 'border-transparent text-white'
              }`}
            onClick={() => setUserType('guest')}
          >
            ゲスト
          </button>
          <button
            className="flex items-center space-x-1 px-3 py-1.5 border rounded-md border-secondary text-white"
            onClick={() => setIsAreaDropdownOpen(!isAreaDropdownOpen)}
          >
            <span className="text-sm">{selectedArea}</span>
            <span className="text-xs">▼</span>
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
              className={`px-4 py-1.5 rounded-full text-sm ${selectedCategory === '総合'
                ? 'bg-secondary text-white'
                : 'border border-gray-700 text-white'
                }`}
              onClick={() => setSelectedCategory('総合')}
            >
              総合
            </button>
            <button
              className={`px-4 py-1.5 rounded-full text-sm ${selectedCategory === 'パトロール'
                ? 'bg-secondary text-white'
                : 'border border-gray-700 text-white'
                }`}
              onClick={() => setSelectedCategory('パトロール')}
            >
              パトロール
            </button>
            <button
              className={`px-4 py-1.5 rounded-full text-sm ${selectedCategory === 'コバト'
                ? 'bg-secondary text-white'
                : 'border border-gray-700 text-white'
                }`}
              onClick={() => setSelectedCategory('コバト')}
            >
              コバト
            </button>
            <button
              className={`px-4 py-1.5 rounded-full text-sm ${selectedCategory === 'ギフ'
                ? 'bg-secondary text-white'
                : 'border border-gray-700 text-white'
                }`}
              onClick={() => setSelectedCategory('ギフ')}
            >
              ギフ
            </button>
          </div>
        </div>
      </div>

      {/* Time Period Row */}
      <div className="px-4 mt-4 mx-auto w-full">
        <div className="flex w-full text-sm">
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

      {/* Empty State */}
      <div className="flex-1 flex flex-col items-center justify-center min-w-[360px]">
        <div className="relative">
          <div className="absolute -left-16 top-12">
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white text-base font-bold">
              1
            </div>
          </div>
          <div className="w-[120px] h-[120px] rounded-full bg-primary flex items-center justify-center relative border border-secondary">
            <div className="w-full h-full relative">
              <img
                src="/assets/avatar/avatar-1.png"
                alt="Tiger Illustration"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm text-white">R491TBD</p>
      </div>

      {/* Bottom Profile Bar */}
      <div className="bg-primary text-white p-4 flex items-center space-x-3 mt-auto min-w-[360px] border-t border-secondary">
        <span className="text-sm">圏外</span>
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-400 border-2 border-secondary">
          <img
            src="/assets/avatar/avatar-2.png"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <span className="text-sm">まこちゃん</span>
      </div>
    </div>
  );
};

export default RankingTabSection; 