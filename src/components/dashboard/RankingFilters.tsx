import React, { useState, useEffect } from 'react';
import { locationService } from '../../services/locationService';

const categories = ['全体', '人気', '新着'];
const periods = ['日間', '週間', '月間'];

const RankingFilters: React.FC = () => {
    const [category, setCategory] = useState(categories[0]);
    const [period, setPeriod] = useState(periods[0]);
    const [region, setRegion] = useState('全国');
    const [regions, setRegions] = useState(['全国', '東京', '大阪', '愛知', '福岡', '北海道']);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const activeLocations = await locationService.getActiveLocations();
                
                // Remove duplicates from locations to prevent React key warnings
                const uniqueLocations = Array.from(new Set(activeLocations));
                setRegions(['全国', ...uniqueLocations]);
                
                // Additional safety check - ensure no duplicates remain
                if (uniqueLocations.length !== activeLocations.length) {
                    console.warn('Duplicate locations detected and removed:', {
                        original: activeLocations,
                        unique: uniqueLocations
                    });
                }
            } catch (error) {
                console.error('Error fetching locations:', error);
                // Keep default regions if API fails
            }
        };

        fetchLocations();
    }, []);
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