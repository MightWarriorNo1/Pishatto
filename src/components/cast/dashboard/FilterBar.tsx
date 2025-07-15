import React, { useState } from 'react';

const areaOptions = ['全国', '東京', '大阪', '名古屋', '福岡', '北海道'];
const sortOptions = ['新しい順', '古い順', '人気順', 'おすすめ順'];

const FilterBar: React.FC = () => {
    const [selectedArea, setSelectedArea] = useState(areaOptions[0]);
    const [selectedSort, setSelectedSort] = useState(sortOptions[0]);
    return (
        <div className="flex items-center justify-between px-4 py-2 bg-white border-b shadow-sm">
            <div className="text-gray-700 text-sm font-medium">全15件</div>
            <div className="flex space-x-2">
                <select
                    className="flex items-center px-3 py-1 border border-gray-300 rounded text-gray-700 text-sm bg-white font-medium focus:outline-none"
                    value={selectedArea}
                    onChange={e => setSelectedArea(e.target.value)}
                >
                    {areaOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
                <select
                    className="flex items-center px-3 py-1 border border-gray-300 rounded text-gray-700 text-sm bg-white font-medium focus:outline-none"
                    value={selectedSort}
                    onChange={e => setSelectedSort(e.target.value)}
                >
                    {sortOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default FilterBar; 