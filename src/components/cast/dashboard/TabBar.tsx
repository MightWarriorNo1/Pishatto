import React, { useState } from 'react';

const tabs = [
    { label: 'すべて' },
    { label: '今日のコール' },
    { label: '明日以降のコール' },
    { label: '合流ゲスト' },
];

const TabBar: React.FC = () => {
    const [selected, setSelected] = useState(0);
    return (
        <div className="w-full bg-white shadow-sm">
            <div className="flex w-full border-b">
                {tabs.map((tab, idx) => (
                    <button
                        key={tab.label}
                        className={`flex-1 py-3 text-center text-base font-medium transition-colors duration-150
              ${selected === idx
                                ? 'bg-purple-600 text-white rounded-t-xl shadow font-bold'
                                : 'bg-[#FFF7E3] text-gray-500'}
              ${idx === 0 ? 'rounded-tl-xl' : ''} ${idx === tabs.length - 1 ? 'rounded-tr-xl' : ''}
            `}
                        style={{ borderRight: idx !== tabs.length - 1 ? '1px solid #F1F2F4' : undefined }}
                        onClick={() => setSelected(idx)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TabBar; 