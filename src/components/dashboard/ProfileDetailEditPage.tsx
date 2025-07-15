import React, { useState } from 'react';

interface ProfileDetailEditPageProps {
    onBack: () => void;
}

const fieldOptions: { [key: string]: string[] } = {
    '身長': ['173', '174', '175', '176', '177'],
    '居住地': ['埼玉県', '千葉県', '東京都', '神奈川県', '新潟県'],
    '出身地': ['群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'],
    '学歴': ['未選択', '高校卒', '大学卒', '大学院卒'],
    '年収': ['未選択', '200万未満', '200万〜400万', '400万〜600万', '600万〜800万'],
    'お仕事': ['未選択', '会社員', '医者', '弁護士', '公認会計士'],
    'お酒': ['未選択', '飲まない', '飲む', 'ときどき飲む'],
    'タバコ': ['未選択', '吸わない', '吸う（電子タバコ）', '吸う（紙巻きたばこ）', 'ときどき吸う'],
    '兄弟姉妹': ['未選択', '長男', '次男', '三男', 'その他'],
    '同居人': ['未選択', '一人暮らし', '家族と同居', 'ペットと一緒'],
};

const fields = [
    '身長',
    '居住地',
    '出身地',
    '学歴',
    '年収',
    'お仕事',
    'お酒',
    'タバコ',
    '兄弟姉妹',
    '同居人',
];

const initialValues: { [key: string]: string } = fields.reduce((acc, cur) => {
    acc[cur] = '未選択';
    return acc;
}, {} as { [key: string]: string });

const ProfileDetailEditPage: React.FC<ProfileDetailEditPageProps> = ({ onBack }) => {
    const [values, setValues] = useState(initialValues);
    const [picker, setPicker] = useState<null | { field: string; value: string }>();
    const [tempValue, setTempValue] = useState<string>('');

    const openPicker = (field: string) => {
        setTempValue(values[field] !== '未選択' ? values[field] : (fieldOptions[field]?.[0] || ''));
        setPicker({ field, value: values[field] });
    };
    const closePicker = () => setPicker(null);
    const confirmPicker = () => {
        if (picker) setValues(v => ({ ...v, [picker.field]: tempValue }));
        setPicker(null);
    };

    return (
        <div className="max-w-md mx-auto min-h-screen bg-white relative">
            {/* Top bar */}
            <div className="flex items-center px-4 py-3 border-b bg-white">
                <button onClick={onBack} className="mr-2 text-2xl text-gray-500">&#60;</button>
                <span className="text-lg font-bold flex-1 text-center">基本情報</span>
                <button className="text-blue-500 font-bold">保存</button>
            </div>
            {/* Profile fields */}
            <div className="divide-y">
                {fields.map((label) => (
                    <div
                        key={label}
                        className="flex items-center justify-between px-4 py-4 bg-white cursor-pointer"
                        onClick={() => openPicker(label)}
                    >
                        <span>{label}</span>
                        <div className="flex items-center gap-2">
                            <span className={values[label] !== '未選択' ? '' : 'text-gray-400'}>{values[label]}</span>
                            <span className="text-gray-400 text-xl">&gt;</span>
                        </div>
                    </div>
                ))}
            </div>
            {/* Picker Modal */}
            {picker && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white rounded-xl w-80 max-w-full shadow-lg flex flex-col overflow-hidden">
                        <div className="text-center font-bold py-3 border-b text-lg">{picker.field}</div>
                        <div className="flex-1 overflow-y-auto max-h-72">
                            {fieldOptions[picker.field]?.map(option => (
                                <div
                                    key={option}
                                    className={`px-6 py-2 text-center cursor-pointer ${tempValue === option ? 'text-blue-600 font-bold' : ''}`}
                                    onClick={() => setTempValue(option)}
                                >
                                    {option} {tempValue === option && <span className="ml-2">✓</span>}
                                </div>
                            ))}
                        </div>
                        <div className="flex border-t text-blue-500 text-lg font-bold divide-x">
                            <button className="flex-1 py-3" onClick={closePicker}>Cancel</button>
                            <button className="flex-1 py-3" onClick={confirmPicker}>OK</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileDetailEditPage; 