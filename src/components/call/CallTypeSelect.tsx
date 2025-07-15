import React, { useState } from 'react';

const callTypes = ['フリー', 'ピシャット（指名）'];

const CallTypeSelect: React.FC = () => {
    const [selected, setSelected] = useState('');
    return (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
            <h2 className="font-bold text-lg mb-4">通話タイプを選択</h2>
            <div className="flex gap-4 mb-6">
                {callTypes.map(type => (
                    <button
                        key={type}
                        className={`px-6 py-3 rounded-full border font-bold text-lg ${selected === type ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                        onClick={() => setSelected(type)}
                    >
                        {type}
                    </button>
                ))}
            </div>
            <button className="w-full bg-blue-500 text-white py-3 rounded font-bold" disabled={!selected}>次へ</button>
        </div>
    );
};

export default CallTypeSelect; 