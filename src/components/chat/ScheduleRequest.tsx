import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

const ScheduleRequest: React.FC = () => {
    const [show, setShow] = useState(false);
    return (
        <div>
            <button 
                className="flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 border-2 border-blue-500 hover:border-blue-400"
                onClick={() => setShow(true)}
                aria-label="スケジュール調整を依頼"
            >
                <Calendar size={24} />
            </button>
            {show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
                    <div className="bg-primary rounded-2xl shadow-lg p-8 flex flex-col items-center border border-secondary max-w-sm w-full mx-4">
                        <h2 className="font-bold text-lg mb-4 text-white">カレンダーから日程を選択</h2>
                        <div className="w-64 h-64 bg-primary flex items-center justify-center text-white border border-secondary rounded-lg mb-4">
                            <div className="text-center">
                                <Calendar size={48} className="mx-auto mb-2 text-gray-400" />
                                <p className="text-gray-400">カレンダー（仮）</p>
                            </div>
                        </div>
                        <button 
                            className="text-white mt-4 hover:text-red-700 transition-all duration-200 font-medium px-4 py-2 bg-secondary rounded-lg hover:bg-red-600"
                            onClick={() => setShow(false)}
                        >
                            閉じる
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScheduleRequest; 