import { ChevronLeft } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { guestUpdateProfile } from '../../services/api';
import { locationService } from '../../services/locationService';
import { useUser } from '../../contexts/UserContext';

interface ProfileDetailEditPageProps {
    onBack: () => void;
}

const fieldOptions: { [key: string]: string[] } = {
    '身長': ['未選択','150', '151', '152', '153', '154', '155', '156', '157', '158', '159', '160', '161', '162', '163', '164', '165', '166', '167', '168', '169', '170', '171', '172', '173', '174', '175', '176', '177', '178', '179', '180', '181', '182', '183', '184', '185', '186', '187', '188', '189', '190', '191', '192', '193', '194', '195', '196', '197', '198', '199', '200','201','202','203','204','205','206','207','208','209','210','211','212','213','214','215','216','217','218','219','220'],
    '居住地': ['埼玉県', '千葉県', '東京都', '神奈川県', '新潟県'],
    '出身地': ['群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'],
    '学歴': ['未選択', '高校卒', '大学卒', '大学院卒'],
    '年収': ['未選択', '200万未満', '200万〜400万', '400万〜600万', '600万〜800万', '800万〜1000万', '1000万〜1200万', '1200万〜1400万', '1400万〜1600万', '1600万〜1800万', '1800万〜2000万', '2000万〜2200万', '2200万〜2400万', '2400万〜2600万', '2600万〜2800万', '2800万〜3000万', '3000万〜3200万', '3200万〜3400万', '3400万〜3600万', '3600万〜3800万', '3800万〜4000万', '4000万〜4200万', '4200万〜4400万', '4400万〜4600万', '4600万〜4800万', '4800万〜5000万', '5000万〜5200万', '5200万〜5400万', '5400万〜5600万', '5600万〜5800万', '5800万〜6000万', '6000万〜6200万', '6200万〜6400万', '6400万〜6600万', '6600万〜6800万', '6800万〜7000万', '7000万〜7200万', '7200万〜7400万', '7400万〜7600万', '7600万〜7800万', '7800万〜8000万', '8000万〜8200万', '8200万〜8400万', '8400万〜8600万', '8600万〜8800万', '8800万〜9000万', '9000万〜9200万', '9200万〜9400万', '9400万〜9600万', '9600万〜9800万', '9800万〜1億', '1億〜1億2000万', '1億2000万〜1億4000万', '1億4000万〜1億6000万', '1億6000万〜1億8000万', '1億8000万〜2億', '2億〜2億2000万', '2億2000万〜2億4000万', '2億4000万〜2億6000万', '2億6000万〜2億8000万', '2億8000万〜3億', '3億〜3億2000万', '3億2000万〜3億4000万', '3億4000万〜3億6000万', '3億6000万〜3億8000万', '3億8000万〜4億', '4億〜4億2000万', '4億2000万〜4億4000万', '4億4000万〜4億6000万', '4億6000万〜4億8000万', '4億8000万〜5億', '5億〜5億2000万', '5億2000万〜5億4000万', '5億4000万〜5億6000万', '5億6000万〜5億8000万', '5億8000万〜6億', '6億〜6億2000万', '6億2000万〜6億4000万', '6億4000万〜6億6000万', '6億6000万〜6億8000万', '6億8000万〜7億', '7億〜7億2000万', '7億2000万〜7億4000万', '7億4000万〜7億6000万', '7億6000万〜7億8000万', '7億8000万〜8億', '8億〜8億2000万', '8億2000万〜8億4000万', '8億4000万〜8億6000万', '8億6000万〜8億8000万', '8億8000万〜9億', '9億〜9億2000万', '9億2000万〜9億4000万', '9億4000万〜9億6000万', '9億6000万〜9億8000万', '9億8000万〜10億'],
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

    // Dynamic location options from DB (Location.name)
    const [locationOptions, setLocationOptions] = useState<string[]>([]);

    useEffect(() => {
        const loadLocations = async () => {
            try {
                const activeLocations = await locationService.getActiveLocations();
                // Defensive: ensure uniqueness
                const unique = Array.from(new Set(activeLocations));
                setLocationOptions(unique);
            } catch (e) {
                console.error('Failed to load locations:', e);
                setLocationOptions([]);
            }
        };
        loadLocations();
    }, []);

    // Merge static options with DB-driven locations for residence/birthplace
    const mergedFieldOptions: { [key: string]: string[] } = React.useMemo(() => {
        const unique = Array.from(new Set(locationOptions));
        return {
            ...fieldOptions,
            '居住地': ['未選択', ...unique],
            '出身地': ['未選択', ...unique],
        };
    }, [locationOptions]);

    // Update form values when user data changes, but only if values are different
    useEffect(() => {
        if (user) {
            const newValues = {
                '身長': user.height?.toString() || '未選択',
                '居住地': user.residence || '未選択',
                '出身地': user.birthplace || '未選択',
                '学歴': user.education || '未選択',
                '年収': user.annual_income || '未選択',
                'お仕事': user.occupation || '未選択',
                'お酒': user.alcohol || '未選択',
                'タバコ': user.tobacco || '未選択',
                '兄弟姉妹': user.siblings || '未選択',
                '同居人': user.cohabitant || '未選択',
            };
            
            // Only update if values are actually different
            const hasChanges = Object.keys(newValues).some(key => 
                newValues[key as keyof typeof newValues] !== values[key]
            );
            
            if (hasChanges) {
                setValues(newValues);
            }
        }
    }, [user, values]);

    const openPicker = (field: string) => {
        setTempValue(values[field] !== '未選択' ? values[field] : (mergedFieldOptions[field]?.[0] || ''));
        setPicker({ field, value: values[field] });
    };
    const closePicker = () => setPicker(null);
    const confirmPicker = () => {
        if (picker) setValues(v => ({ ...v, [picker.field]: tempValue }));
        setPicker(null);
    };

    const handleSave = async () => {
        console.log('Starting profile save...', { user, phone, line_id: user?.line_id });
        
        // Check if user has either phone or line_id
        if (!phone && !user?.line_id) {
            setMessage('電話番号またはLINE IDが必要です');
            return;
        }
        
        setIsSaving(true);
        setMessage(null);
        try {
            const payload: any = {};
            
            // Use phone if available, otherwise use line_id
            if (phone) {
                payload.phone = phone;
            } else if (user?.line_id) {
                payload.line_id = user.line_id;
            }
            
            // Map Japanese field names to English field names and only include non-default values
            const fieldMapping: { [key: string]: string } = {
                '身長': 'height',
                '居住地': 'residence',
                '出身地': 'birthplace',
                '学歴': 'education',
                '年収': 'annual_income',
                'お仕事': 'occupation',
                'お酒': 'alcohol',
                'タバコ': 'tobacco',
                '兄弟姉妹': 'siblings',
                '同居人': 'cohabitant'
            };
            
            // Only include fields that have been changed from default
            Object.entries(values).forEach(([japaneseField, value]) => {
                if (value !== '未選択') {
                    const englishField = fieldMapping[japaneseField];
                    if (englishField) {
                        // Convert height to number, others to string
                        if (englishField === 'height') {
                            payload[englishField] = Number(value);
                        } else {
                            payload[englishField] = value;
                        }
                    }
                }
            });
            
            console.log('Profile update payload:', payload);
            const response = await guestUpdateProfile(payload);
            console.log('Profile update response:', response);
            
            // Refresh user data to ensure we have the latest information
            if (user?.line_id) {
                try {
                    const { getGuestProfileByLineId } = await import('../../services/api');
                    const refreshResult = await getGuestProfileByLineId(user.line_id);
                    if (refreshResult.guest) {
                        console.log('Refreshed user data:', refreshResult.guest);
                        setUser(refreshResult.guest);
                    }
                } catch (refreshError) {
                    console.error('Error refreshing user data:', refreshError);
                    // Fallback to using response data if refresh fails
                    if (response.guest) {
                        setUser(response.guest);
                    }
                }
            } else if (phone) {
                try {
                    const { getGuestProfile } = await import('../../services/api');
                    const refreshResult = await getGuestProfile(phone);
                    if (refreshResult.guest) {
                        console.log('Refreshed user data:', refreshResult.guest);
                        setUser(refreshResult.guest);
                    }
                } catch (refreshError) {
                    console.error('Error refreshing user data:', refreshError);
                    // Fallback to using response data if refresh fails
                    if (response.guest) {
                        setUser(response.guest);
                    }
                }
            } else if (response.guest) {
                setUser(response.guest);
            }
            
            setMessage('保存しました');
            setTimeout(() => onBack(), 1000);
        } catch (e) {
            console.error('Profile update error:', e);
            setMessage('保存に失敗しました');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-md mx-auto min-h-screen bg-gradient-to-b from-primary via-primary to-secondary relative">
            {/* Top bar */}
            <div className="flex items-center px-4 py-3 border-b bg-primary border-secondary">
                <button onClick={onBack} className="mr-2 text-2xl text-white hover:text-secondary cursor-pointer transition-colors">
                    <ChevronLeft />
                </button>
                <span className="text-lg font-bold flex-1 text-center text-white">基本情報</span>
                <button 
                    className="text-white font-bold" 
                    onClick={handleSave} 
                    disabled={isSaving}
                >
                    {isSaving ? '保存中...' : '保存'}
                </button>
            </div>

            {/* Profile fields */}
            {fields.map((label) => (
                <div
                    key={label}
                    className="flex items-center justify-between px-4 py-4 bg-gradient-br-to from-primary via-primary to-secondary cursor-pointer"
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
                            {mergedFieldOptions[picker.field]?.map(option => (
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