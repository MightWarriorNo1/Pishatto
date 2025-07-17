import React, { useState } from 'react';

const ageOptions = ['20代前半', '20代後半', '30代前半', '30代後半'];

const AgeSelect: React.FC = () => {
    const [selected, setSelected] = useState('');
    return (
        <div className="max-w-md mx-auto min-h-screen bg-primary p-6">
            <h1 className="text-xl font-bold mb-4 text-white">年齢を選択</h1>
            <div className="flex flex-col gap-3 mb-6">
                {ageOptions.map(opt => (
                    <button
                        key={opt}
                        className={`px-4 py-3 rounded-full border font-bold text-lg ${selected === opt ? 'bg-primary text-white border-secondary' : 'bg-primary text-white border-secondary'}`}
                        onClick={() => setSelected(opt)}
                    >
                        {opt}
                    </button>
                ))}
            </div>
            <button className={`w-full bg-primary text-white py-3 rounded font-bold ${!selected ? 'opacity-50' : ''}`} disabled={!selected}>次へ</button>
        </div>
    );
};

export default AgeSelect; 