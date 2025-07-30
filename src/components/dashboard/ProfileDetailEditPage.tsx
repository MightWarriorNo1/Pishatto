import { ChevronLeft } from 'lucide-react';
import React, { useState } from 'react';
import { guestUpdateProfile } from '../../services/api';
import { useUser } from '../../contexts/UserContext';

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


const ProfileDetailEditPage: React.FC<ProfileDetailEditPageProps> = ({ onBack }) => {
    const { user, setUser, phone } = useUser();
    // Use index signature for values
    const [values, setValues] = useState<{ [key: string]: string }>(() => {
        return {
            '身長': user?.height?.toString() || '未選択',
            '居住地': user?.residence || '未選択',
            '出身地': user?.birthplace || '未選択',
            '学歴': user?.education || '未選択',
            '年収': user?.annual_income || '未選択',
            'お仕事': user?.occupation || '未選択',
            'お酒': user?.alcohol || '未選択',
            'タバコ': user?.tobacco || '未選択',
            '兄弟姉妹': user?.siblings || '未選択',
            '同居人': user?.cohabitant || '未選択',
        };
    });
    const [picker, setPicker] = useState<null | { field: string; value: string }>();
    const [tempValue, setTempValue] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const openPicker = (field: string) => {
        setTempValue(values[field] !== '未選択' ? values[field] : (fieldOptions[field]?.[0] || ''));
        setPicker({ field, value: values[field] });
    };
    const closePicker = () => setPicker(null);
    const confirmPicker = () => {
        if (picker) setValues(v => ({ ...v, [picker.field]: tempValue }));
        setPicker(null);
    };

    const handleSave = async () => {
        if (!phone) return;
        setIsSaving(true);
        setMessage(null);
        try {
            const payload: any = { phone };
            payload.height = Number(values['身長']);
            payload.residence = values['居住地'];
            payload.birthplace = values['出身地'];
            payload.education = values['学歴'];
            payload.annual_income = values['年収'];
            payload.occupation = values['お仕事'];
            payload.alcohol = values['お酒'];
            payload.tobacco = values['タバコ'];
            payload.siblings = values['兄弟姉妹'];
            payload.cohabitant = values['同居人'];
            const response = await guestUpdateProfile(payload);
            if (response.guest) setUser(response.guest);
            setMessage('保存しました');
            setTimeout(() => onBack(), 1000);
        } catch (e) {
            setMessage('保存に失敗しました');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-md mx-auto min-h-screen bg-primary relative">
            {/* Top bar */}
            <div className="flex items-center px-4 py-3 border-b bg-primary border-secondary">
                <button onClick={onBack} className="mr-2 text-2xl text-white">
                    <ChevronLeft />
                </button>
                <span className="text-lg font-bold flex-1 text-center text-white">基本情報</span>
                <button className="text-white font-bold" onClick={handleSave} disabled={isSaving}>{isSaving ? '保存中...' : '保存'}</button>
            </div>
            {/* Profile fields */}
            {fields.map((label) => (
                <div
                    key={label}
                    className="flex items-center justify-between px-4 py-4 bg-primary cursor-pointer"
                    onClick={() => openPicker(label)}
                >
                    <span className="text-white">{label}</span>
                    <div className="flex items-center gap-2">
                        <span className={values[label] !== '未選択' ? 'text-white' : 'text-white'}>{values[label]}</span>
                        <span className="text-white text-xl">&gt;</span>
                    </div>
                </div>
            ))}
            {/* Picker Modal */}
            {picker && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-30">
                    <div className="bg-primary rounded-xl w-80 max-w-full shadow-lg flex flex-col overflow-hidden border border-secondary">
                        <div className="text-center font-bold py-3 border-b text-lg text-white border-secondary">{picker.field}</div>
                        <div className="flex-1 overflow-y-auto max-h-72">
                            {fieldOptions[picker.field]?.map(option => (
                                <div
                                    key={option}
                                    className={`px-6 py-2 text-center cursor-pointer ${tempValue === option ? 'text-white font-bold' : 'text-white'}`}
                                    onClick={() => setTempValue(option)}
                                >
                                    {option} {tempValue === option && <span className="ml-2">✓</span>}
                                </div>
                            ))}
                        </div>
                        <div className="flex border-t text-white text-lg font-bold divide-x border-secondary">
                            <button className="flex-1 py-3 bg-secondary hover:bg-pink-500" onClick={closePicker}>キャンセル</button>
                            <button className="flex-1 py-3 bg-secondary hover:bg-pink-500" onClick={confirmPicker}>わかりました</button>
                        </div>
                    </div>
                </div>
            )}
            {message && (
                <div className="fixed bottom-4 left-0 right-0 flex justify-center">
                    <div className="bg-secondary text-white px-6 py-2 rounded shadow-lg">{message}</div>
                </div>
            )}
        </div>
    );
};

export default ProfileDetailEditPage; 