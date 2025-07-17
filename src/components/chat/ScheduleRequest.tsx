import React, { useState } from 'react';

const ScheduleRequest: React.FC = () => {
    const [show, setShow] = useState(false);
    return (
        <div>
            <button className="text-white font-bold hover:text-red-700 transition-all duration-200" onClick={() => setShow(true)}>スケジュール調整を依頼</button>
            {show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary bg-opacity-80">
                    <div className="bg-primary rounded-2xl shadow-lg p-8 flex flex-col items-center border border-secondary">
                        <h2 className="font-bold text-lg mb-4 text-white">カレンダーから日程を選択</h2>
                        <div className="w-64 h-64 bg-primary flex items-center justify-center text-white border border-secondary rounded-lg">カレンダー（仮）</div>
                        <button className="text-white mt-4 hover:text-red-700 transition-all duration-200 font-medium" onClick={() => setShow(false)}>閉じる</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScheduleRequest; 