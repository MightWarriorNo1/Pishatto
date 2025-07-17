
import React, { useState } from 'react';

const gifts = ['🎁', '🍰', '🌸', '🏅'];

const GiftSend: React.FC = () => {
    const [show, setShow] = useState(false);
    return (
        <div>
            <button className="text-white text-2xl font-semibold hover:text-red-700 transition-all duration-200" onClick={() => setShow(true)}>ギフトを送る</button>
            {show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary bg-opacity-80">
                    <div className="bg-primary rounded-2xl shadow-lg p-8 flex flex-col items-center border border-secondary">
                        <h2 className="font-bold text-lg mb-4 text-white">ギフトを選択</h2>
                        <div className="flex gap-4 mb-4">
                            {gifts.map(g => <button key={g} className="text-3xl hover:text-white transition-all duration-200" onClick={() => setShow(false)}>{g}</button>)}
                        </div>
                        <button className="text-white mt-2 hover:text-red-700 transition-all duration-200 font-medium" onClick={() => setShow(false)}>閉じる</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GiftSend; 