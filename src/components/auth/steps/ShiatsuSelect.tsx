import React, { useState } from 'react';

const shiatsuOptions = ['弱い', '普通', '強い'];

const ShiatsuSelect: React.FC = () => {
    const [selected, setSelected] = useState('');
    return (
        <div className="max-w-md mx-auto min-h-screen bg-white p-6">
            <h1 className="text-xl font-bold mb-4">指圧の好みを選択</h1>
            <div className="flex flex-col gap-3 mb-6">
                {shiatsuOptions.map(opt => (
                    <button
                        key={opt}
                        className={`px-4 py-3 rounded-full border font-bold text-lg ${selected === opt ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                        onClick={() => setSelected(opt)}
                    >
                        {opt}
                    </button>
                ))}
            </div>
            <button className="w-full bg-orange-500 text-white py-3 rounded font-bold" disabled={!selected}>次へ</button>
        </div>
    );
};

export default ShiatsuSelect; 