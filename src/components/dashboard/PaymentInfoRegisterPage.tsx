import React, { useState } from 'react';
import PaymentInfoListPage from './PaymentInfoListPage';
import { X } from 'lucide-react'

interface PaymentInfoRegisterPageProps {
    onBack: () => void;
}

const PaymentInfoRegisterPage: React.FC<PaymentInfoRegisterPageProps> = ({ onBack }) => {
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [name, setName] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [showList, setShowList] = useState(false);

    const validate = () => {
        const errs: { [key: string]: string } = {};
        if (!/^\d{13,19}$/.test(cardNumber.replace(/\s/g, ''))) errs.cardNumber = 'カード番号を正しく入力してください';
        if (!/^\d{2}\/\d{4}$/.test(expiry)) errs.expiry = '有効期限をMM/YYYY形式で入力してください';
        if (!/^\d{3,4}$/.test(cvc)) errs.cvc = 'セキュリティコードを正しく入力してください';
        if (!/^.{2,}$/.test(name)) errs.name = '氏名を入力してください';
        return errs;
    };

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const errs = validate();
        setErrors(errs);
        if (Object.keys(errs).length === 0) {
            setShowList(true);
        }
    };

    if (showList) return <PaymentInfoListPage onBack={onBack} />;

    return (
        <div className="max-w-md mx-auto min-h-screen bg-primary flex flex-col relative pb-24">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-secondary bg-primary">
                <span className="flex-1 text-center text-lg font-bold text-white">お支払い情報を登録する</span>
                <button onClick={onBack} className="text-2xl text-white font-bold">
                    <X />
                </button>
            </div>
            {/* Card icons */}
            <div className="flex justify-center gap-4 py-4">
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="visa" className="h-8" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/0e/Mastercard-logo.png" alt="mc" className="h-8" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/JCB_logo.svg" alt="jcb" className="h-8" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo_%282018%29.svg" alt="amex" className="h-8" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Diners_Club_Logo3.svg" alt="diners" className="h-8" />
            </div>
            {/* Form */}
            <form className="flex-1 flex flex-col gap-4 px-6 pt-2" onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
                <div>
                    <label className="block font-bold mb-1 text-white">カード番号</label>
                    <input
                        className={`w-full border rounded px-3 py-2 text-lg bg-primary text-white border-secondary ${errors.cardNumber ? 'border-secondary' : ''}`}
                        placeholder="1234567812345678"
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value)}
                        maxLength={19}
                        inputMode="numeric"
                    />
                    {errors.cardNumber && <div className="text-xs text-white mt-1">{errors.cardNumber}</div>}
                </div>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block font-bold mb-1 text-white">有効期限</label>
                        <input
                            className={`w-full border rounded px-3 py-2 text-lg bg-primary text-white border-secondary ${errors.expiry ? 'border-secondary' : ''}`}
                            placeholder="MM/YYYY"
                            value={expiry}
                            onChange={e => setExpiry(e.target.value)}
                            maxLength={7}
                        />
                        {errors.expiry && <div className="text-xs text-white mt-1">{errors.expiry}</div>}
                    </div>
                    <div className="flex-1">
                        <label className="block font-bold mb-1 text-white">セキュリティコード</label>
                        <input
                            className={`w-full border rounded px-3 py-2 text-lg bg-primary text-white border-secondary ${errors.cvc ? 'border-secondary' : ''}`}
                            placeholder="123"
                            value={cvc}
                            onChange={e => setCvc(e.target.value)}
                            maxLength={4}
                            inputMode="numeric"
                        />
                        {errors.cvc && <div className="text-xs text-white mt-1">{errors.cvc}</div>}
                    </div>
                </div>
                <div>
                    <label className="block font-bold mb-1 text-white">カード所有者の氏名</label>
                    <div className="text-xs text-white mb-1">※ご本人様名義のカードのみご利用いただけます</div>
                    <input
                        className={`w-full border rounded px-3 py-2 text-lg bg-primary text-white border-secondary ${errors.name ? 'border-secondary' : ''}`}
                        placeholder="TARO TANAKA"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                    {errors.name && <div className="text-xs text-white mt-1">{errors.name}</div>}
                </div>
                <div className="text-xs text-white mt-2">※決済は、<span className="text-white">GMO PAYMENT</span>サービスを利用しています。</div>
            </form>
            {/* Fixed Add Button */}
            <div className="fixed left-0 right-0 bottom-0 max-w-md mx-auto px-6 pb-4 bg-primary z-20 border-t border-secondary" style={{ boxShadow: '0 -2px 8px rgba(0,0,0,0.03)' }}>
                <button
                    type="button"
                    className="w-full bg-primary text-white text-lg font-bold py-3 rounded disabled:bg-primary disabled:text-white border border-secondary"
                    disabled={!cardNumber || !expiry || !cvc || !name}
                    onClick={() => handleSubmit()}
                >
                    追加する
                </button>
            </div>
        </div>
    );
};

export default PaymentInfoRegisterPage; 