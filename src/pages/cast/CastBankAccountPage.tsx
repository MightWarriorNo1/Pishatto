/*eslint-disable*/
import React, { useEffect, useState } from 'react';
import { ChevronLeft, Trash2, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getCastBankAccount, saveCastBankAccount, deleteCastBankAccount, CastBankAccount } from '../../services/api';
import { useCast } from '../../contexts/CastContext';
import Spinner from '../../components/ui/Spinner';

interface CastBankAccountPageProps {
    onBack: () => void;
}

const CastBankAccountPage: React.FC<CastBankAccountPageProps> = ({ onBack }) => {
    const { castId } = useCast() as any;
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [bankAccount, setBankAccount] = useState<CastBankAccount | null>(null);
    const [formData, setFormData] = useState<CastBankAccount>({
        bank_name: '',
        branch_name: '',
        account_type: '普通',
        account_number: '',
        account_holder_name: '',
    });

    useEffect(() => {
        if (castId) {
            fetchBankAccount();
        } else {
            setError('キャスト情報を取得できませんでした。');
            setLoading(false);
        }
    }, [castId]);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const fetchBankAccount = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getCastBankAccount(castId);
            if (response.bank_account) {
                setBankAccount(response.bank_account);
                setFormData(response.bank_account);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || '銀行口座情報の取得に失敗しました。');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof CastBankAccount, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (!formData.bank_name.trim() || !formData.branch_name.trim() || 
            !formData.account_number.trim() || !formData.account_holder_name.trim()) {
            setError('すべての項目を入力してください。');
            return;
        }

        try {
            setSaving(true);
            setError(null);
            const response = await saveCastBankAccount(castId, formData);
            setBankAccount(response.bank_account);
            setSuccessMessage(response.message || '銀行口座情報が保存されました。');
        } catch (err: any) {
            setError(err.response?.data?.message || '銀行口座情報の保存に失敗しました。');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!bankAccount) return;
        
        if (!window.confirm('銀行口座情報を削除してもよろしいですか？')) {
            return;
        }

        try {
            setDeleting(true);
            setError(null);
            await deleteCastBankAccount(castId);
            setBankAccount(null);
            setFormData({
                bank_name: '',
                branch_name: '',
                account_type: '普通',
                account_number: '',
                account_holder_name: '',
            });
            setSuccessMessage('銀行口座情報が削除されました。');
        } catch (err: any) {
            setError(err.response?.data?.message || '銀行口座情報の削除に失敗しました。');
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className='max-w-md bg-gradient-to-b from-primary via-primary to-secondary min-h-screen flex items-center justify-center' style={{ paddingBottom: 'max(12rem, calc(12rem + env(safe-area-inset-bottom)))' }}>
                <Spinner size='lg' />
            </div>
        );
    }

    return (
        <div className='bg-gradient-to-b from-primary via-primary to-secondary min-h-screen overflow-y-auto scrollbar-hidden' style={{ paddingBottom: 'max(12rem, calc(12rem + env(safe-area-inset-bottom)))' }}>
            {/* Top bar */}
            <div className="fixed max-w-md mx-auto left-0 right-0 top-0 z-50 flex items-center justify-between px-4 pt-4 pb-4 border-b border-secondary bg-primary shadow-lg">
                <button className="text-2xl text-white hover:text-secondary cursor-pointer transition-colors duration-200" onClick={onBack}>
                    <ChevronLeft />
                </button>
                <span className="absolute left-1/2 transform -translate-x-1/2 text-base font-bold text-white">銀行口座登録</span>
                <div className="w-8"></div>
            </div>

            {/* Main section */}
            <div className="px-4 py-6 mt-20 animate-fade-in">
                {successMessage && (
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-center mb-6 shadow-lg animate-fade-in flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        <p className="text-white font-medium">{successMessage}</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 mb-6 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <div className="text-red-400 text-sm">{error}</div>
                    </div>
                )}

                {/* Bank Account Info Card */}
                {bankAccount && (
                    <div className="bg-white/10 rounded-xl shadow-lg p-6 mb-6 border border-secondary/50 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white font-bold text-lg">登録済みの銀行口座</h3>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                {deleting ? '削除中...' : '削除'}
                            </button>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-300">銀行名</span>
                                <span className="text-white font-medium">{bankAccount.bank_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-300">支店名</span>
                                <span className="text-white font-medium">{bankAccount.branch_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-300">口座種別</span>
                                <span className="text-white font-medium">{bankAccount.account_type}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-300">口座番号</span>
                                <span className="text-white font-medium">{bankAccount.account_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-300">口座名義</span>
                                <span className="text-white font-medium">{bankAccount.account_holder_name}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form Card */}
                <div className="bg-white/10 rounded-xl shadow-lg p-6 mb-6 border border-secondary/50 backdrop-blur-sm">
                    <h3 className="text-white font-bold text-lg mb-6">
                        {bankAccount ? '銀行口座情報を更新' : '銀行口座情報を登録'}
                    </h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Bank Name */}
                        <div>
                            <label className="block text-white text-sm font-medium mb-2">
                                銀行名 <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.bank_name}
                                onChange={(e) => handleInputChange('bank_name', e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/50"
                                placeholder="例: 三菱UFJ銀行"
                                required
                            />
                        </div>

                        {/* Branch Name */}
                        <div>
                            <label className="block text-white text-sm font-medium mb-2">
                                支店名 <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.branch_name}
                                onChange={(e) => handleInputChange('branch_name', e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/50"
                                placeholder="例: 新宿支店"
                                required
                            />
                        </div>

                        {/* Account Type */}
                        <div>
                            <label className="block text-white text-sm font-medium mb-2">
                                口座種別 <span className="text-red-400">*</span>
                            </label>
                            <select
                                value={formData.account_type}
                                onChange={(e) => handleInputChange('account_type', e.target.value as '普通' | '当座')}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/50"
                                required
                            >
                                <option value="普通">普通</option>
                                <option value="当座">当座</option>
                            </select>
                        </div>

                        {/* Account Number */}
                        <div>
                            <label className="block text-white text-sm font-medium mb-2">
                                口座番号 <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.account_number}
                                onChange={(e) => handleInputChange('account_number', e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/50"
                                placeholder="例: 1234567"
                                required
                            />
                        </div>

                        {/* Account Holder Name */}
                        <div>
                            <label className="block text-white text-sm font-medium mb-2">
                                口座名義 <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.account_holder_name}
                                onChange={(e) => handleInputChange('account_holder_name', e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/50"
                                placeholder="例: ヤマダ タロウ"
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={saving}
                            className={`w-full bg-gradient-to-r from-secondary to-red-600 text-white font-bold py-4 rounded-xl text-lg mt-6 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg ${saving ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'} flex items-center justify-center gap-2`}
                        >
                            {saving ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    保存中...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    {bankAccount ? '更新する' : '登録する'}
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Info Section */}
                <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
                    <div className="text-xs text-gray-300 leading-relaxed">
                        <div className="font-medium text-white mb-2">ご注意</div>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>銀行口座情報は振込処理に使用されます。</li>
                            <li>入力内容に誤りがあると振込ができませんので、正確に入力してください。</li>
                            <li>口座名義はカタカナで入力してください。</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CastBankAccountPage;

