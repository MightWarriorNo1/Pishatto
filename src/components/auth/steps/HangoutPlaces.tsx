import React, { useState, useEffect } from 'react';
import { locationService } from '../../../services/locationService';
import Spinner from '../../ui/Spinner';

const HangoutPlaces: React.FC = () => {
    const [selected, setSelected] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>(['東京', '大阪', '愛知', '福岡', '北海道']);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const activeLocations = await locationService.getActiveLocations();
                
                // Remove duplicates from locations to prevent React key warnings
                const uniqueLocations = Array.from(new Set(activeLocations));
                setCities(uniqueLocations);
                
                // Additional safety check - ensure no duplicates remain
                if (uniqueLocations.length !== activeLocations.length) {
                    console.warn('Duplicate locations detected and removed:', {
                        original: activeLocations,
                        unique: uniqueLocations
                    });
                }
            } catch (error) {
                console.error('Error fetching locations:', error);
                // Keep default cities if API fails
            } finally {
                setLoading(false);
            }
        };

        fetchLocations();
    }, []);

    const toggleCity = (city: string) => {
        setSelected(sel => sel.includes(city) ? sel.filter(c => c !== city) : [...sel, city]);
    };
    return (
        <div className="max-w-md mx-auto min-h-screen bg-gradient-to-b from-primary via-gray-800 to-secondary p-6">
            <h1 className="text-xl font-bold mb-4 text-white">よく遊ぶ場所を選択</h1>
            {loading ? (
                <Spinner />
            ) : (
                <>
                    <div className="flex flex-wrap gap-3 mb-6">
                        {cities.map((city, index) => (
                            <button
                                key={`${city}-${index}`}
                                className={`px-4 py-2 rounded-full border font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-secondary/60 ${selected.includes(city) ? 'bg-secondary hover:bg-red-400 text-white border-secondary' : 'bg-primary text-white border-secondary hover:bg-secondary/20'}`}
                                onClick={() => toggleCity(city)}
                            >
                                {city}
                            </button>
                        ))}
                    </div>
                    <button className={`w-full bg-secondary text-white py-3 rounded-lg font-bold transition-colors ${selected.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-400'}`} disabled={selected.length === 0}>次へ</button>
                </>
            )}
        </div>
    );
};

export default HangoutPlaces; 