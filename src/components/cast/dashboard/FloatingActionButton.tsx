import React from 'react';
import { Pencil } from 'lucide-react';

const FloatingActionButton: React.FC = () => {
    return (
        <button className="flex items-center px-5 py-3 bg-red-600 text-white rounded-full shadow-lg text-base font-medium fixed bottom-24 right-4 z-30 max-w-md mx-auto hover:bg-red-700 transition-all duration-200 border-2 border-red-600">
            <span className="mr-2"><Pencil /></span> 注文履歴の確認
        </button>
    );
};

export default FloatingActionButton; 