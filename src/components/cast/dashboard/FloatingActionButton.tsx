import React from 'react';
import { Pencil } from 'lucide-react';

const FloatingActionButton: React.FC = () => {
    return (
        <button className="flex items-center px-5 py-3 bg-secondary text-white rounded-full shadow-lg text-base font-medium fixed bottom-24 right-4 z-30 max-w-md mx-auto hover:bg-primary-700 transition-all duration-200 border-2 border-secondary">
            <span className="mr-2"><Pencil /></span> 本日の出勤登録
        </button>
    );
};

export default FloatingActionButton; 