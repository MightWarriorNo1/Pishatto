import React, { useState } from 'react';

const SearchBar: React.FC<{ onSearch?: (q: string) => void }> = ({ onSearch }) => {
    const [q, setQ] = useState('');
    return (
        <form className="flex gap-2 mb-4" onSubmit={e => { e.preventDefault(); onSearch && onSearch(q); }}>
            <input
                className="flex-1 border border-secondary rounded px-3 py-2 bg-primary text-white placeholder-red-500"
                placeholder="キャスト・ゲストを検索"
                value={q}
                onChange={e => setQ(e.target.value)}
            />
            <button className="bg-secondary text-white px-4 py-2 rounded font-bold" type="submit">検索</button>
        </form>
    );
};

export default SearchBar; 