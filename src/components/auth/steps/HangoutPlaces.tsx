import React, { useState, useEffect } from 'react';
import { locationService } from '../../../services/locationService';

const HangoutPlaces: React.FC = () => {
    const [selected, setSelected] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>(['東京', '大阪', '愛知', '福岡', '北海道']);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const activeLocations = await locationService.getActiveLocations();
                setCities(activeLocations);
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
        <div className="max-w-md mx-auto min-h-screen bg-primary p-6">
            <h1 className="text-xl font-bold mb-4 text-white">よく遊ぶ場所を選択</h1>
            {loading ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                    <p className="text-white text-sm mt-2">読み込み中...</p>
                </div>
            ) : (
                <>
                    <div className="flex flex-wrap gap-3 mb-6">
                        {cities.map(city => (
                            <button
                                key={city}
                                className={`px-4 py-2 rounded-full border font-bold ${selected.includes(city) ? 'bg-secondary hover:bg-red-400 text-white border-secondary' : 'bg-primary text-white border-secondary'}`}
                                onClick={() => toggleCity(city)}
                            >
                                {city}
                            </button>
                        ))}
                    </div>
                    <button className={`w-full bg-secondary text-white py-3 rounded font-bold ${selected.length === 0 ? 'opacity-50' : ''}`} disabled={selected.length === 0}>次へ</button>
                </>
            )}
        </div>
    );
};

export default HangoutPlaces; 