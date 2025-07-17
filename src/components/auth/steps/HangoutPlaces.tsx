import React, { useState } from 'react';

const cities = ['東京', '大阪', '愛知', '福岡', '北海道'];

const HangoutPlaces: React.FC = () => {
    const [selected, setSelected] = useState<string[]>([]);
    const toggleCity = (city: string) => {
        setSelected(sel => sel.includes(city) ? sel.filter(c => c !== city) : [...sel, city]);
    };
    return (
        <div className="max-w-md mx-auto min-h-screen bg-primary p-6">
            <h1 className="text-xl font-bold mb-4 text-white">よく遊ぶ場所を選択</h1>
            <div className="flex flex-wrap gap-3 mb-6">
                {cities.map(city => (
                    <button
                        key={city}
                        className={`px-4 py-2 rounded-full border font-bold ${selected.includes(city) ? 'bg-primary text-white border-secondary' : 'bg-primary text-white border-secondary'}`}
                        onClick={() => toggleCity(city)}
                    >
                        {city}
                    </button>
                ))}
            </div>
            <button className={`w-full bg-primary text-white py-3 rounded font-bold ${selected.length === 0 ? 'opacity-50' : ''}`} disabled={selected.length === 0}>次へ</button>
        </div>
    );
};

export default HangoutPlaces; 