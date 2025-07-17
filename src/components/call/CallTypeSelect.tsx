import React, { useState } from 'react';

const callTypes = ['フリー', 'ピシャット（指名）'];

const CallTypeSelect: React.FC = () => {
    const [selected, setSelected] = useState('');
    return (
        <div className="max-w-md mx-auto bg-primary p-8 rounded-2xl shadow-lg border border-secondary mt-16">
            <h2 className="font-bold text-xl mb-6 text-white text-center">通話タイプを選択</h2>
            <div className="flex gap-6 mb-8 justify-center">
                {callTypes.map(type => (
                    <button
                        key={type}
                        className={`px-8 py-4 rounded-full border-2 font-bold text-lg transition-all duration-200 shadow-md ${selected === type ? 'bg-secondary text-white border-secondary' : 'bg-primary text-white border-secondary hover:bg-red-700 hover:text-white'}`}
                        onClick={() => setSelected(type)}
                    >
                        {type}
                    </button>
                ))}
            </div>
            <button className={`w-full bg-secondary text-white py-4 rounded-full font-bold shadow-lg transition-all duration-200 ${!selected ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'}`} disabled={!selected}>次へ</button>
        </div>
    );
};

export default CallTypeSelect; 