import React, { useState } from 'react';

const SelfIntroduction: React.FC = () => {
    const [editing, setEditing] = useState(false);
    const [intro, setIntro] = useState('こんにちは！よろしくお願いします。');
    return (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h2 className="font-bold text-lg mb-2">自己紹介</h2>
            {editing ? (
                <div>
                    <textarea className="w-full border rounded p-2 mb-2" value={intro} onChange={e => setIntro(e.target.value)} />
                    <button className="bg-blue-500 text-white px-4 py-2 rounded mr-2" onClick={() => setEditing(false)}>保存</button>
                    <button className="text-gray-400 px-4 py-2" onClick={() => setEditing(false)}>キャンセル</button>
                </div>
            ) : (
                <div>
                    <div className="mb-2 text-gray-700 whitespace-pre-line">{intro}</div>
                    <button className="text-blue-500 font-bold" onClick={() => setEditing(true)}>編集</button>
                </div>
            )}
        </div>
    );
};

export default SelfIntroduction; 