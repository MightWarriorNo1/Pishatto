import React, { useState } from 'react';
import StepIndicator from './StepIndicator';
import { ChevronLeft } from 'lucide-react';

const ageOptions = ['20代前半', '20代後半', '30代前半', '30代後半'];

interface AgeSelectProps {
    onNext: () => void;
    onBack: () => void;
    updateFormData: (data: { age: string }) => void;
    formData: { age: string };
}

const AgeSelect: React.FC<AgeSelectProps> = ({
    onNext,
    onBack,
    updateFormData,
    formData,
}) => {
    const [selected, setSelected] = useState(formData.age || '');
    const handleNext = () => {
        if (selected) {
            updateFormData({ age: selected });
            onNext();
        }
    };
    return (
        <div className="max-w-md mx-auto min-h-screen bg-primary">
            <button onClick={onBack} className="text-white text-xl">
                <ChevronLeft />
            </button>
            <StepIndicator totalSteps={6} currentStep={4} />
            <h1 className="text-xl font-bold mb-4 text-white">年齢を選択</h1>
            <div className="flex flex-col gap-3 mb-6">
                {ageOptions.map(opt => (
                    <button
                        key={opt}
                        className={`px-4 py-3 rounded-full border font-bold text-lg ${selected === opt ? 'bg-secondary text-white border-secondary' : 'bg-primary text-white border-primary'}`}
                        onClick={() => setSelected(opt)}
                    >
                        {opt}
                    </button>
                ))}
            </div>
            <button className={`w-full bg-secondary hover:bg-pink-400 text-white py-3 rounded font-bold ${!selected ? 'opacity-50' : ''}`} disabled={!selected} onClick={handleNext}>次へ</button>
            <button className="w-full mt-2 bg-secondary hover:bg-pink-400 text-white py-3 rounded font-bold" onClick={onBack}>戻る</button>
        </div>
    );
};

export default AgeSelect;


