import React from 'react';
import { Pencil } from 'lucide-react';

const FloatingActionButton: React.FC = () => {
    return (
        <button className="flex items-center px-5 py-3 bg-pink-500 text-white rounded-full shadow-lg text-base font-medium fixed bottom-24 right-4 z-30 max-w-md mx-auto">
            <span className="mr-2"><Pencil /></span> 本日の出勤登録
        </button>
    );
};

export default FloatingActionButton; 