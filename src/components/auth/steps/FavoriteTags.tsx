import React, { useState } from 'react';

const tags = ['グルメ', '旅行', '音楽', '映画', 'スポーツ', 'カフェ', '読書', 'アウトドア'];

const FavoriteTags: React.FC = () => {
    const [selected, setSelected] = useState<string[]>([]);
    const toggleTag = (tag: string) => {
        setSelected(sel => sel.includes(tag) ? sel.filter(t => t !== tag) : [...sel, tag]);
    };
    return (
        <div className="max-w-md mx-auto min-h-screen bg-gradient-to-b from-primary via-gray-800 to-secondary p-6">
            <h1 className="text-xl font-bold mb-4 text-white">好きなタグを選択</h1>
            <div className="flex flex-wrap gap-3 mb-6">
                {tags.map(tag => (
                    <button
                        key={tag}
                        type="button"
                        aria-pressed={selected.includes(tag)}
                        className={`px-4 py-2 rounded-full border font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-secondary/60 ${selected.includes(tag) ? 'bg-secondary text-white border-secondary' : 'bg-primary text-white border-secondary hover:bg-secondary/20'}`}
                        onClick={() => toggleTag(tag)}
                    >
                        {tag}
                    </button>
                ))}
            </div>
            <button className={`w-full bg-secondary text-white py-3 rounded-lg font-bold transition-colors ${selected.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-400'}`} disabled={selected.length === 0}>次へ</button>
        </div>
    );
};

export default FavoriteTags; 