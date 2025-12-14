/* eslint-disable */
import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  RefreshCcw,
  CheckCircle2,
  AlertCircle,
  Wallet,
} from 'lucide-react';
import StripeService, {
  CastConnectStatus,
  CastOnboardingLinkPayload,
} from '../../services/stripe';
import Spinner from '../../components/ui/Spinner';
import { useCast } from '../../contexts/CastContext';

interface CastPayoutSettingsPageProps {
  onBack: () => void;
}

interface CastPayoutRecord {
  id: number;
  type: 'scheduled' | 'instant';
  closing_month: string;
  scheduled_payout_date: string | null;
  status: string;
  gross_amount_yen: number;
  net_amount_yen: number;
  fee_amount_yen: number;
  fee_rate: number;
  total_points: number;
  created_at?: string;
  paid_at?: string | null;
}

interface CastPayoutSummary {
  conversion_rate: number;
  scheduled_fee_rate: number;
  instant_fee_rate: number;
  unsettled_points: number;
  unsettled_amount_yen: number;
  instant_available_points: number;
  instant_available_amount_yen: number;
  upcoming_payout: CastPayoutRecord | null;
  recent_history: CastPayoutRecord[];
}

const requirementLabels: Record<string, string> = {
  'external_account': '銀行口座の登録',
  'individual.verification_document': '本人確認書類の提出',
  'individual.id_number': 'マイナンバー（個人番号）',
  'company.verification.document': '法人確認書類',
  'individual.address_kana': '住所（カナ）',
  'individual.address_kanji': '住所（漢字）',
  'individual.first_name_kana': '名前（カナ）',
  'individual.last_name_kana': '名字（カナ）',
  'individual.first_name_kanji': '名前（漢字）',
  'individual.last_name_kanji': '名字（漢字）',
  'individual.dob': '生年月日',
  'tos_acceptance.date': '利用規約への同意',
  'business_profile.support_email': 'サポート用メールアドレス',
  'business_profile.product_description': '事業内容の説明',
};

const translateRequirement = (code: string) => {
  if (requirementLabels[code]) {
    return requirementLabels[code];
  }

  if (code.includes('.')) {
    return code
      .split('.')
      .map((part) => requirementLabels[part] || part)
      .join(' / ');
  }

  return code.replace(/_/g, ' ');
};

const InlineSpinner: React.FC = () => (
  <span className="inline-block h-4 w-4 border-b-2 border-t-2 border-white rounded-full animate-spin" />
);

const CastPayoutSettingsPage: React.FC<CastPayoutSettingsPageProps> = ({ onBack }) => {
  const { castId, cast } = useCast();
  const [status, setStatus] = useState<CastConnectStatus | null>(null);
  const [balance, setBalance] = useState<{ available: any[]; pending: any[] } | null>(null);
  const [payoutSummary, setPayoutSummary] = useState<CastPayoutSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMemo, setPayoutMemo] = useState('');
  const [instantAmount, setInstantAmount] = useState('');
  const [instantMemo, setInstantMemo] = useState('');
  const [actionLoading, setActionLoading] = useState({
    init: false,
    refresh: false,
    payout: false,
    link: false,
    dashboard: false,
    instant: false,
  });

  useEffect(() => {
    if (cast?.phone) {
      setContactPhone(cast.phone);
    }
  }, [cast]);

  useEffect(() => {
    if (castId) {
      loadStatus();
    } else {
      setLoading(false);
      setError('キャスト情報を取得できませんでした。再度ログインしてください。');
    }
  }, [castId]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const outstandingRequirements = useMemo(() => {
    if (!status?.requirements) return [];
    const {
      currently_due = [],
      past_due = [],
      pending_verification = [],
    } = status.requirements;
    return Array.from(
      new Set([
        ...currently_due,
        ...past_due,
        ...pending_verification,
      ])
    ).filter(Boolean);
  }, [status]);

  const loadSummary = async () => {
    if (!castId) return;
    try {
      setSummaryLoading(true);
      const response = await StripeService.getCastPayoutSummary(castId);
      setPayoutSummary(response.summary);
    } catch (err) {
      console.warn('Failed to load payout summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  const loadStatus = async (force = false) => {
    if (!castId) return;
    try {
      setLoading(true);
      const response = await StripeService.getCastConnectAccount(
        castId,
        force ? { force: true } : undefined
      );
      setStatus(response.account);
      setError(null);
      
      // Load balance if account exists
      if (response.account?.id) {
        await loadBalance();
      }
      await loadSummary();
    } catch (err: any) {
      if (err?.status === 404) {
        setStatus(null);
        setError(null);
      } else {
        setError(err?.message || 'ステータスの取得に失敗しました。');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadBalance = async () => {
    if (!castId) return;
    try {
      const response = await StripeService.getCastAccountBalance(castId);
      setBalance(response.balance);
    } catch (err: any) {
      // Balance might not be available yet, don't show error
      console.warn('Failed to load balance:', err);
    }
  };

  const handleStartOnboarding = async () => {
    if (!castId) return;
    if (!contactEmail.trim()) {
      setError('Stripeに登録するメールアドレスを入力してください。');
      return;
    }
    setError(null);
    setActionLoading((prev) => ({ ...prev, init: true }));
    try {
      await StripeService.ensureCastConnectAccount(castId, {
        email: contactEmail.trim(),
        support_email: contactEmail.trim(),
        support_phone: contactPhone || undefined,
        metadata: {
          cast_nickname: cast?.nickname || '',
        },
      });
      const link = await StripeService.createCastOnboardingLink(castId, buildLinkPayload('account_onboarding'));
      window.location.href = link.link.url;
    } catch (err: any) {
      setError(err?.message || 'Stripe Connectアカウントの作成に失敗しました。');
      await loadStatus(true);
    } finally {
      setActionLoading((prev) => ({ ...prev, init: false }));
    }
  };

  const handleContinueOnboarding = async () => {
    if (!castId || !status) return;
    setActionLoading((prev) => ({ ...prev, link: true }));
    try {
      const linkType: CastOnboardingLinkPayload['type'] =
        status.details_submitted ? 'account_update' : 'account_onboarding';
      const link = await StripeService.createCastOnboardingLink(castId, buildLinkPayload(linkType));
      window.location.href = link.link.url;
    } catch (err: any) {
      setError(err?.message || 'Stripeリンクの生成に失敗しました。');
    } finally {
      setActionLoading((prev) => ({ ...prev, link: false }));
    }
  };

  const handleOpenDashboard = async () => {
    if (!castId) return;
    setActionLoading((prev) => ({ ...prev, dashboard: true }));
    try {
      const link = await StripeService.createCastLoginLink(castId);
      window.open(link.link.url, '_blank', 'noopener');
    } catch (err: any) {
      setError(err?.message || 'Stripeダッシュボードにアクセスできませんでした。');
    } finally {
      setActionLoading((prev) => ({ ...prev, dashboard: false }));
    }
  };

  const handleRefreshStatus = async () => {
    setActionLoading((prev) => ({ ...prev, refresh: true }));
    await loadStatus(true);
    await loadSummary();
    setActionLoading((prev) => ({ ...prev, refresh: false }));
  };

  const handleRequestPayout = async () => {
    if (!castId) return;
    const amountValue = Number(payoutAmount);
    if (Number.isNaN(amountValue) || amountValue < 100) {
      setError('振込金額は100円以上の整数で入力してください。');
      return;
    }
    setError(null);
    setActionLoading((prev) => ({ ...prev, payout: true }));
    try {
      await StripeService.requestCastPayout(castId, {
        amount: amountValue,
        description: payoutMemo || undefined,
      });
      setSuccessMessage('振込リクエストを送信しました。Stripeの審査が完了すると通知されます。');
      setPayoutAmount('');
      setPayoutMemo('');
      await loadStatus(true);
    } catch (err: any) {
      setError(err?.message || '振込リクエストの送信に失敗しました。');
    } finally {
      setActionLoading((prev) => ({ ...prev, payout: false }));
    }
  };

  const handleInstantPayout = async () => {
    if (!castId) return;
    const amountValue = Number(instantAmount);
    if (Number.isNaN(amountValue) || amountValue < 1000) {
      setError('即時振込額は1,000円以上の整数で入力してください。');
      return;
    }
    if (payoutSummary && amountValue > payoutSummary.instant_available_amount_yen) {
      setError('利用可能額を超えています。');
      return;
    }
    setError(null);
    setActionLoading((prev) => ({ ...prev, instant: true }));
    try {
      await StripeService.requestInstantCastPayout(castId, {
        amount: amountValue,
        memo: instantMemo || undefined,
      });
      setSuccessMessage('即時振込を受け付けました。審査完了後に通知されます。');
      setInstantAmount('');
      setInstantMemo('');
      await loadSummary();
    } catch (err: any) {
      setError(err?.message || '即時振込の申請に失敗しました。');
    } finally {
      setActionLoading((prev) => ({ ...prev, instant: false }));
    }
  };

  const buildLinkPayload = (type: CastOnboardingLinkPayload['type']): CastOnboardingLinkPayload => {
    const baseUrl = window.location.origin + '/cast/dashboard';
    return {
      type,
      return_url: baseUrl,
      refresh_url: baseUrl,
    };
  };

  const formatTimestamp = (value?: string) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('ja-JP').replace(/\//g, '-');
  };

  const renderRequirements = () => {
    if (!status) return null;
    if (outstandingRequirements.length === 0) {
      return (
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/40 rounded-xl px-4 py-3">
          <CheckCircle2 className="text-green-400" />
          <div>
            <div className="text-sm font-medium text-white">提出済み</div>
            <div className="text-xs text-gray-300">すべての要件が満たされています。</div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {outstandingRequirements.map((req) => (
          <div
            key={req}
            className="flex items-center gap-3 bg-white/5 border border-yellow-500/40 rounded-xl px-4 py-3"
          >
            <AlertTriangle className="text-yellow-400" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">{translateRequirement(req)}</div>
              <div className="text-xs text-gray-300">{req}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPayoutSummary = () => {
    if (summaryLoading && !payoutSummary) {
      return (
        <div className="bg-white/10 border border-secondary/40 rounded-2xl p-5 flex items-center justify-center">
          <Spinner size="md" />
        </div>
      );
    }

    if (!payoutSummary) {
      return null;
    }

    const upcoming = payoutSummary.upcoming_payout;

    return (
      <div className="bg-white/10 border border-secondary/40 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Wallet className="text-white" />
          <div>
            <div className="text-white font-bold">月次振込サマリー</div>
            <div className="text-xs text-gray-300">末締め翌月末（営業日前倒し）で入金されます。</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-black/10 rounded-xl p-3">
            <div className="text-gray-400 text-xs">未払ポイント</div>
            <div className="text-white text-lg font-semibold">
              {payoutSummary.unsettled_points.toLocaleString()} pt
            </div>
            <div className="text-gray-400 text-xs">
              ≒ ¥{payoutSummary.unsettled_amount_yen.toLocaleString()}
            </div>
          </div>
          <div className="bg-black/10 rounded-xl p-3">
            <div className="text-gray-400 text-xs">即時振込可能額</div>
            <div className="text-white text-lg font-semibold">
              ¥{payoutSummary.instant_available_amount_yen.toLocaleString()}
            </div>
            <div className="text-gray-400 text-xs">
              {payoutSummary.instant_available_points.toLocaleString()} pt
            </div>
          </div>
        </div>
        <div className="bg-black/10 rounded-xl p-3 text-sm space-y-1">
          <div className="text-gray-400 text-xs">次回振込予定</div>
          {upcoming ? (
            <>
              <div className="text-white font-semibold">
                {upcoming.closing_month} 分 / ¥{upcoming.net_amount_yen.toLocaleString()}
              </div>
              <div className="text-gray-300 text-xs">
                振込予定日: {formatTimestamp(upcoming.scheduled_payout_date || undefined)}
              </div>
              <div className="text-gray-400 text-xs">
                手数料 {Math.round(upcoming.fee_rate * 10000) / 100}% ({upcoming.fee_amount_yen.toLocaleString()}円)
              </div>
              {!status?.payouts_enabled && (
                <div className="text-yellow-300 text-xs mt-2 bg-yellow-500/10 border border-yellow-500/30 rounded px-2 py-1">
                  ⚠️ Stripe Connect未設定のため、振込は保留されます。設定完了後に自動で振込されます。
                </div>
              )}
            </>
          ) : (
            <div className="text-gray-300 text-xs">まだ今月の集計はありません。</div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-md bg-gradient-to-b from-primary via-primary to-secondary min-h-screen pb-24 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div
      className="bg-gradient-to-b from-primary via-primary to-secondary min-h-screen max-h-screen pb-24 overflow-y-auto"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <div className="fixed max-w-md mx-auto left-0 right-0 top-0 z-50 flex items-center px-4 pt-4 pb-4 border-b border-secondary bg-primary shadow">
        <button className="mr-2 text-2xl text-white hover:text-secondary cursor-pointer" onClick={onBack}>
          <ChevronLeft />
        </button>
        <span className="flex-1 text-center text-base font-bold text-white">振込設定 (Stripe)</span>
        <div className="w-8" />
      </div>

      <div className="px-4 mt-20 space-y-4">
        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/40 rounded-xl px-4 py-3 text-sm text-red-200">
            <AlertCircle />
            <div>{error}</div>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/40 rounded-xl px-4 py-3 text-sm text-green-100">
            <CheckCircle2 />
            <div>{successMessage}</div>
          </div>
        )}

        {!status ? (
          <div className="space-y-4">
            <div className="bg-white/10 border border-secondary/40 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-white" />
                <div>
                  <div className="text-white font-bold text-lg">Stripe連携を開始</div>
                  <div className="text-gray-300 text-sm">
                    Stripe Connectを利用すると、本人確認と銀行口座登録が完了次第すぐに振込申請ができるようになります。
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs text-gray-300" htmlFor="connect-email">
                  連絡用メールアドレス
                </label>
                <input
                  id="connect-email"
                  type="email"
                  className="w-full rounded-xl bg-black/20 border border-white/20 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="stripe@example.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
                <label className="text-xs text-gray-300" htmlFor="connect-phone">
                  連絡先電話番号 (任意)
                </label>
                <input
                  id="connect-phone"
                  type="tel"
                  className="w-full rounded-xl bg-black/20 border border-white/20 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="080-1234-5678"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
                <button
                  className="w-full bg-gradient-to-r from-secondary to-red-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                  onClick={handleStartOnboarding}
                  disabled={actionLoading.init}
                >
                  {actionLoading.init ? (
                    <>
                      <InlineSpinner />
                      連携を開始中...
                    </>
                  ) : (
                    <>
                      <ShieldCheck />
                      Stripeに接続する
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-gray-200 space-y-2">
              <div className="font-semibold text-white">準備に必要なもの</div>
              <ul className="list-disc list-inside space-y-1 text-gray-300 text-xs">
                <li>本人確認書類（運転免許証、マイナンバーカードなど）</li>
                <li>振込先の銀行口座情報</li>
                <li>税務情報（マイナンバーなど）</li>
                <li>サポート用メールアドレス</li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white/10 border border-secondary/40 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="text-white font-bold text-lg">アカウント状況</div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      status.payouts_enabled
                        ? 'bg-green-500/20 text-green-200 border border-green-500/30'
                        : 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/30'
                    }`}
                  >
                    {status.payouts_enabled ? '振込可能' : '要設定'}
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  最終同期: {formatTimestamp(status.last_requirement_refresh)}
                </div>
              </div>

              {/* Balance Display */}
              {balance && (
                <div className="bg-white/10 border border-secondary/40 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Wallet className="text-white" />
                    <div className="text-white font-bold text-lg">利用可能残高</div>
                  </div>
                  <div className="space-y-2">
                    {balance.available && balance.available.length > 0 ? (
                      balance.available.map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="text-sm text-gray-300">
                            {item.currency?.toUpperCase() || 'JPY'} 利用可能
                          </div>
                          <div className="text-lg font-bold text-white">
                            ¥{item.amount?.toLocaleString() || '0'}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-400">利用可能残高: ¥0</div>
                    )}
                    {balance.pending && balance.pending.length > 0 && (
                      <div className="pt-2 border-t border-white/10 space-y-1">
                        <div className="text-xs text-gray-400 mb-1">保留中</div>
                        {balance.pending.map((item: any, index: number) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <div className="text-gray-400">
                              {item.currency?.toUpperCase() || 'JPY'} 保留中
                            </div>
                            <div className="text-gray-300">
                              ¥{item.amount?.toLocaleString() || '0'}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {renderRequirements()}

              {renderPayoutSummary()}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-3 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  onClick={handleContinueOnboarding}
                  disabled={actionLoading.link}
                >
                  {actionLoading.link ? (
                    <>
                      <InlineSpinner />
                      リンク生成中...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="text-secondary" />
                      情報を更新する
                    </>
                  )}
                </button>
                <button
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-3 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  onClick={handleOpenDashboard}
                  disabled={actionLoading.dashboard}
                >
                  {actionLoading.dashboard ? (
                    <>
                      <InlineSpinner />
                      開いています...
                    </>
                  ) : (
                    <>
                      <ExternalLink />
                      Stripeダッシュボード
                    </>
                  )}
                </button>
              </div>

              <button
                className="w-full bg-transparent border border-white/20 rounded-xl py-3 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                onClick={handleRefreshStatus}
                disabled={actionLoading.refresh}
              >
                {actionLoading.refresh ? (
                  <>
                    <InlineSpinner />
                    更新中...
                  </>
                ) : (
                  <>
                    <RefreshCcw />
                    最新の状態を取得
                  </>
                )}
              </button>
            </div>

            {/* <div className="bg-white/10 border border-secondary/40 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Wallet className="text-white" />
                <div>
                  <div className="text-white font-bold">振込リクエスト</div>
                  <div className="text-xs text-gray-300">
                    Stripe残高に十分な金額がある場合にのみリクエストできます。
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs text-gray-300" htmlFor="payout-amount">
                  振込希望額（円）
                </label>
                <input
                  id="payout-amount"
                  type="number"
                  min={100}
                  className="w-full rounded-xl bg-black/20 border border-white/20 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="10,000"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value.replace(/[^\d]/g, ''))}
                />
                <label className="text-xs text-gray-300" htmlFor="payout-memo">
                  メモ (任意)
                </label>
                <textarea
                  id="payout-memo"
                  className="w-full rounded-xl bg-black/20 border border-white/20 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="任意のメモを入力できます"
                  value={payoutMemo}
                  onChange={(e) => setPayoutMemo(e.target.value)}
                  rows={3}
                />
                <button
                  className="w-full bg-gradient-to-r from-secondary to-red-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleRequestPayout}
                  disabled={!status.payouts_enabled || actionLoading.payout}
                >
                  {actionLoading.payout ? (
                    <>
                      <InlineSpinner />
                      送信中...
                    </>
                  ) : (
                    <>
                      <Wallet />
                      振込を申請する
                    </>
                  )}
                </button>
                {!status.payouts_enabled && (
                  <div className="text-xs text-yellow-200 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-3 py-2">
                    Stripeが「振込可能」と判定してから申請できます。必要事項が提出済みか確認してください。
                  </div>
                )}
              </div>
            </div> */}

            <div className="bg-white/10 border border-secondary/40 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Wallet className="text-white" />
                <div>
                  <div className="text-white font-bold">即時振込（手数料高）</div>
                  <div className="text-xs text-gray-300">
                    {payoutSummary
                      ? `最大 ¥${payoutSummary.instant_available_amount_yen.toLocaleString()} / 手数料 ${(payoutSummary.instant_fee_rate * 100).toFixed(1)}%`
                      : 'サマリーを取得中...'}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs text-gray-300" htmlFor="instant-amount">
                  即時振込額（円）
                </label>
                <input
                  id="instant-amount"
                  type="number"
                  min={1000}
                  className="w-full rounded-xl bg-black/20 border border-white/20 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="15,000"
                  value={instantAmount}
                  onChange={(e) => setInstantAmount(e.target.value.replace(/[^\d]/g, ''))}
                />
                <label className="text-xs text-gray-300" htmlFor="instant-memo">
                  メモ (任意)
                </label>
                <textarea
                  id="instant-memo"
                  className="w-full rounded-xl bg-black/20 border border-white/20 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="社内共有メモなど"
                  value={instantMemo}
                  onChange={(e) => setInstantMemo(e.target.value)}
                  rows={2}
                />
                <button
                  className="w-full bg-gradient-to-r from-secondary to-red-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={handleInstantPayout}
                  disabled={
                    actionLoading.instant ||
                    !payoutSummary ||
                    !status?.payouts_enabled ||
                    payoutSummary.instant_available_amount_yen < 5000
                  }
                >
                  {actionLoading.instant ? (
                    <>
                      <InlineSpinner />
                      申請中...
                    </>
                  ) : (
                    <>
                      <Wallet />
                      今すぐ振込を申請
                    </>
                  )}
                </button>
                {!payoutSummary && (
                  <div className="text-xs text-yellow-200 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-3 py-2">
                    サマリーを取得してからご利用ください。
                  </div>
                )}
                {payoutSummary && !status?.payouts_enabled && (
                  <div className="text-xs text-yellow-200 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-3 py-2">
                    Stripe Connectアカウントの設定が完了していません。上記の「情報を更新する」から設定を完了してください。
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-xs text-gray-200 space-y-2">
              <div className="font-semibold text-white">よくある質問</div>
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                <li>リンクが期限切れの場合は「情報を更新する」を押して再発行してください。</li>
                <li>銀行口座の承認には最大2営業日程度かかる場合があります。</li>
                <li>提出済みでも pending_verification に表示される場合はStripeの審査中です。</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CastPayoutSettingsPage;

