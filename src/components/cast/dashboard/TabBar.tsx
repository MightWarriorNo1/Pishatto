import React, { useState } from 'react';

const tabs = [
    { label: 'すべて' },
    { label: '今日のフリー一覧' },
    { label: '明日以降のフリー一覧' },
    { label: '合流ゲスト' },
];

const TabBar: React.FC = () => {
    const [selected, setSelected] = useState(0);
    return (
        <div className="w-full bg-primary shadow-sm border border-secondary rounded-t-xl">
            <div className="flex w-full border-b border-secondary">
                {tabs.map((tab, idx) => (
                    <button
                        key={tab.label}
                        className={`flex-1 py-3 text-center text-base font-medium transition-colors duration-150
              ${selected === idx
                                ? 'bg-secondary text-white rounded-t-xl shadow font-bold'
                                : 'bg-primary text-white'}
              ${idx === 0 ? 'rounded-tl-xl' : ''} ${idx === tabs.length - 1 ? 'rounded-tr-xl' : ''}
            `}
                        style={{ borderRight: idx !== tabs.length - 1 ? '1px solid #FF0000' : undefined }}
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