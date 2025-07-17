import React, { useState } from 'react';

const categories = ['全体', '人気', '新着'];
const periods = ['日間', '週間', '月間'];
const regions = ['全国', '東京', '大阪', '愛知', '福岡', '北海道'];

const RankingFilters: React.FC = () => {
    const [category, setCategory] = useState(categories[0]);
    const [period, setPeriod] = useState(periods[0]);
    const [region, setRegion] = useState(regions[0]);
    return (
        <div className="flex gap-2 mb-4 bg-primary p-2 rounded">
            <select className="border border-secondary rounded px-2 py-1 text-white bg-primary" value={category} onChange={e => setCategory(e.target.value)}>
                {categories.map(c => <option key={c}>{c}</option>)}
            </select>
            <select className="border border-secondary rounded px-2 py-1 text-white bg-primary" value={period} onChange={e => setPeriod(e.target.value)}>
                {periods.map(p => <option key={p}>{p}</option>)}
            </select>
            <select className="border border-secondary rounded px-2 py-1 text-white bg-primary" value={region} onChange={e => setRegion(e.target.value)}>
                {regions.map(r => <option key={r}>{r}</option>)}
            </select>
        </div>
    );
};

export default RankingFilters; 