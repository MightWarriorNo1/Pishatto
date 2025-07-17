import React, { useState } from 'react';

const SelfIntroduction: React.FC = () => {
    const [editing, setEditing] = useState(false);
    const [intro, setIntro] = useState('こんにちは！よろしくお願いします。');
    return (
        <div className="bg-primary rounded-lg shadow p-4 mb-4 border border-secondary">
            <h2 className="font-bold text-lg mb-2 text-white">自己紹介</h2>
            {editing ? (
                <div>
                    <textarea className="w-full border border-secondary rounded p-2 mb-2 bg-primary text-white" value={intro} onChange={e => setIntro(e.target.value)} />
                    <button className="bg-secondary text-white px-4 py-2 rounded mr-2 hover:bg-red-700 transition-all duration-200" onClick={() => setEditing(false)}>保存</button>
                    <button className="text-white px-4 py-2" onClick={() => setEditing(false)}>キャンセル</button>
                </div>
            ) : (
                <div>
                    <div className="mb-2 text-white whitespace-pre-line">{intro}</div>
                    <button className="text-white font-bold" onClick={() => setEditing(true)}>編集</button>
                </div>
            )}
        </div>
    );
};

export default SelfIntroduction; 