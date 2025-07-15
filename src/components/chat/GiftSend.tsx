import React, { useState } from 'react';

const gifts = ['🎁', '🍰', '🌸', '🏅'];

const GiftSend: React.FC = () => {
    const [show, setShow] = useState(false);
    return (
        <div>
            <button className="text-pink-500 text-2xl" onClick={() => setShow(true)}>ギフトを送る</button>
            {show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
                        <h2 className="font-bold text-lg mb-4">ギフトを選択</h2>
                        <div className="flex gap-3 mb-4">
                            {gifts.map(g => <button key={g} className="text-3xl" onClick={() => setShow(false)}>{g}</button>)}
                        </div>
                        <button className="text-gray-400 mt-2" onClick={() => setShow(false)}>閉じる</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GiftSend; 