import React, { useState } from 'react';

const ScheduleRequest: React.FC = () => {
    const [show, setShow] = useState(false);
    return (
        <div>
            <button className="text-blue-500 font-bold" onClick={() => setShow(true)}>スケジュール調整を依頼</button>
            {show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
                        <h2 className="font-bold text-lg mb-4">カレンダーから日程を選択</h2>
                        <div className="w-64 h-64 bg-gray-100 flex items-center justify-center text-gray-400">カレンダー（仮）</div>
                        <button className="text-gray-400 mt-4" onClick={() => setShow(false)}>閉じる</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScheduleRequest; 