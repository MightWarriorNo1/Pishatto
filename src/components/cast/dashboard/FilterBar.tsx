import React from 'react';

const areaOptions = ['全国', '東京', '大阪', '名古屋', '福岡', '北海道'];
const sortOptions = ['新しい順', '古い順', '人気順', 'おすすめ順'];

interface FilterBarProps {
    selectedArea: string;
    selectedSort: string;
    onAreaChange: (area: string) => void;
    onSortChange: (sort: string) => void;
    totalCount?: number;
}

const FilterBar: React.FC<FilterBarProps> = ({
    selectedArea,
    selectedSort,
    onAreaChange,
    onSortChange,
    totalCount
}) => {
    return (
        <div className="flex items-center justify-between px-4 py-2 bg-primary border-b border-secondary shadow-sm">
            <div className="text-white text-sm font-medium">全{totalCount ?? 0}件</div>
            <div className="flex space-x-2">
                <select
                    className="flex items-center px-3 py-1 border border-secondary rounded text-white text-sm bg-primary font-medium focus:outline-none"
                    value={selectedArea}
                    onChange={e => onAreaChange(e.target.value)}
                >
                    {areaOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
                <select
                    className="flex items-center px-3 py-1 border border-secondary rounded text-white text-sm bg-primary font-medium focus:outline-none"
                    value={selectedSort}
                    onChange={e => onSortChange(e.target.value)}
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