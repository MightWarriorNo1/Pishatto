import React from 'react';
import { CircleUserRound, Sparkle, ArrowRight } from 'lucide-react';

interface RoleSelectProps {
    onSelect: (role: 'guest' | 'cast') => void;
}

const RoleSelect: React.FC<RoleSelectProps> = ({ onSelect }) => {
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary/80 to-secondary text-white">
            {/* Decorative background blobs */}
            <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-28 -right-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

            <div className="relative z-10 w-full max-w-md px-6">
                <div className="mb-6 flex justify-center">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                        <Sparkle className="h-6 w-6" aria-hidden />
                    </span>
                </div>

                <div className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
                    <h1 className="mb-2 text-center text-2xl font-bold tracking-tight">はじめかたを選択</h1>
                    <p className="mb-6 text-center text-sm text-white/80">あなたの目的に合ったモードをお選びください。</p>

                    <div className="space-y-4">
                        <button
                            type="button"
                            aria-label="ゲストとして始める"
                            onClick={() => onSelect('guest')}
                            className="group relative flex w-full items-center gap-4 rounded-2xl border border-white/15 bg-white/5 p-4 shadow-lg ring-1 ring-white/10 transition-all hover:-translate-y-0.5 hover:bg-white/10 hover:ring-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                        >
                            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                                <CircleUserRound className="h-6 w-6" aria-hidden />
                            </span>
                            <span className="flex-1 text-left">
                                <span className="block text-base font-semibold">ゲストとして始める</span>
                                <span className="block text-xs text-white/70">女性キャストを検索・マッチングし、メンズエステの施術を受けることができます。</span>
                            </span>
                            <ArrowRight className="h-5 w-5 opacity-0 transition-opacity duration-200 group-hover:opacity-100" aria-hidden />
                        </button>

                        <button
                            type="button"
                            aria-label="キャストとして始める"
                            onClick={() => onSelect('cast')}
                            className="group relative flex w-full items-center gap-4 rounded-2xl border border-white/20 bg-gradient-to-br from-secondary/80 to-secondary/60 p-4 shadow-xl ring-1 ring-white/20 transition-all hover:-translate-y-0.5 hover:ring-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                        >
                            <span className="absolute right-3 top-3 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold tracking-wide">おすすめ</span>
                            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                                <Sparkle className="h-6 w-6" aria-hidden />
                            </span>
                            <span className="flex-1 text-left">
                                <span className="block text-base font-semibold">キャストとして始める</span>
                                <span className="block text-xs text-white/80">男性ゲストを検索・マッチングし、メンズエステの施術を提供します。</span>
                            </span>
                            <ArrowRight className="h-5 w-5 opacity-0 transition-opacity duration-200 group-hover:opacity-100" aria-hidden />
                        </button>
                    </div>

                    <p id="policy" className="mt-6 text-center text-[11px] leading-5 text-white/70">
                        18歳以上の方のみご利用いただけます。利用規約 と プライバシーポリシーに同意のうえお進みください。
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RoleSelect; 