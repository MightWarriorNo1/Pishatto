import React, { useState } from 'react';
import StepIndicator from './StepIndicator';

const shiatsuOptions = ['弱い', '普通', '強い'];

interface ShiatsuSelectProps {
    onNext: () => void;
    onBack: () => void;
    updateFormData: (data: { shiatsu: string }) => void;
    formData: { shiatsu: string };
}

const ShiatsuSelect: React.FC<ShiatsuSelectProps> = ({ onNext, onBack, updateFormData, formData }) => {
    const [selected, setSelected] = useState(formData.shiatsu || '');
    const handleNext = () => {
        if (selected) {
            updateFormData({ shiatsu: selected });
            onNext();
        }
    };
    return (
        <div className="max-w-md mx-auto min-h-screen bg-primary p-6">
            <StepIndicator totalSteps={6} currentStep={5} />
            <h1 className="text-xl font-bold mb-4 text-white">指圧の好みを選択</h1>
            <div className="flex flex-col gap-3 mb-6">
                {shiatsuOptions.map(opt => (
                    <button
                        key={opt}
                        className={`px-4 py-3 rounded-full border font-bold text-lg ${selected === opt ? 'bg-primary text-white border-secondary' : 'bg-primary text-white border-secondary'}`}
                        onClick={() => setSelected(opt)}
                    >
                        {opt}
                    </button>
                ))}
            </div>
            <button className={`w-full bg-secondary hover:bg-pink-400   text-white py-3 rounded font-bold ${!selected ? 'opacity-50' : ''}`} disabled={!selected} onClick={handleNext}>次へ</button>
            <button className="w-full mt-2 bg-secondary hover:bg-pink-400 text-white py-3 rounded font-bold" onClick={onBack}>戻る</button>
        </div>
    );
};

export default ShiatsuSelect; 