import React, { useState } from 'react';

interface PostCreatePageProps {
    onClose: () => void;
    onSubmit: (content: string) => void;
}

const PostCreatePage: React.FC<PostCreatePageProps> = ({ onClose, onSubmit }) => {
    const [content, setContent] = useState('');
    return (
        <div className="max-w-md mx-auto min-h-screen bg-white flex flex-col">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-4 border-b">
                <button onClick={onClose} className="text-3xl text-gray-500 font-bold">&#10005;</button>
                <span className="flex-1 text-center text-lg font-bold">つぶやきを投稿</span>
                <button
                    className="text-orange-400 font-bold text-base"
                    disabled={!content.trim()}
                    onClick={() => { if (content.trim()) onSubmit(content); }}
                >
                    投稿する
                </button>
            </div>
            {/* User info */}
            <div className="flex items-center gap-2 px-4 mt-4">
                <img src="/public/assets/avatar/avatar-1.png" alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                <span className="font-bold">まこちゃん</span>
            </div>
            {/* Textarea */}
            <textarea
                className="w-full px-4 py-6 text-lg text-gray-600 border-none outline-none resize-none bg-transparent"
                style={{ minHeight: 120 }}
                placeholder="今なにしてる？"
                value={content}
                onChange={e => setContent(e.target.value)}
            />
            {/* Image upload icon */}
            <div className="mt-auto flex items-center px-4 pb-4">
                <button className="text-gray-400">
                    <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 15l3-3 2 2 3-3" /><circle cx="8.5" cy="8.5" r="1.5" /></svg>
                </button>
            </div>
        </div>
    );
};

export default PostCreatePage; 