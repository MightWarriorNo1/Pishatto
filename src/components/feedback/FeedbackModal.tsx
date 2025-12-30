import React, { useState, useEffect } from 'react';
import { submitFeedback, fetchAllBadges, getReservationById, getCastProfile, getReservationFeedback, updateFeedback } from '../../services/api';
import Toast from '../ui/Toast';
import getFirstAvatarUrl from '../../utils/avatar';
interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservationId: number;
  castId?: number;
  guestId: number;
  onSuccess?: () => void;
  casts?: { id: number; nickname?: string; avatar?: string }[];
}

interface Badge {
  id: number;
  name: string;
  icon: string;
  description: string;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  reservationId,
  castId,
  guestId,
  onSuccess,
  casts
}) => {
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  // Maintain per-cast feedback state and resolved cast list
  const [perCastFeedback, setPerCastFeedback] = useState<Record<number, { text: string; rating: number | null; badgeId: number | null }>>({});
  const [resolvedCasts, setResolvedCasts] = useState<{
    id: number;
    nickname?: string;
    avatar?: string;
  }[]>([]);
  const [existingFeedbackByCast, setExistingFeedbackByCast] = useState<Record<number, { id: number; comment?: string | null; rating?: number | null; badge_id?: number | null; guest_id?: number }>>({});

  // Return first avatar URL when multiple are provided (comma-separated). Supports http/data URLs.
  useEffect(() => {
    if (!isOpen) return;
    fetchAllBadges().then(setBadges);

    const initForCasts = (list: { id: number; nickname?: string; avatar?: string }[]) => {
      setPerCastFeedback(prev => {
        const initialized = { ...prev } as Record<number, { text: string; rating: number | null; badgeId: number | null }>;
        list.forEach(c => {
          if (!initialized[c.id]) {
            initialized[c.id] = { text: '', rating: null, badgeId: null };
          }
        });
        return initialized;
      });
    };

    const resolveCastList = async () => {
      try {
        // Priority 1: explicit casts prop
        if (casts && casts.length > 0) {
          setResolvedCasts(casts);
          initForCasts(casts);
          return;
        }

        // Priority 2: explicit castId prop
        if (castId) {
          const list = [{ id: castId }];
          setResolvedCasts(list);
          initForCasts(list);
          return;
        }

        // Priority 3: fetch from reservation
        const reservation = await getReservationById(reservationId);
        const ids: number[] = Array.isArray(reservation?.cast_ids) && reservation.cast_ids.length > 0
          ? reservation.cast_ids
          : (reservation?.cast_id ? [reservation.cast_id] : []);

        if (!ids || ids.length === 0) {
          setResolvedCasts([]);
          return;
        }

        const profiles = await Promise.all(
          ids.map(async (id) => {
            try {
              const { cast } = await getCastProfile(id);
              return { id: cast.id, nickname: cast.nickname, avatar: cast.avatar };
            } catch {
              return { id } as { id: number };
            }
          })
        );
        setResolvedCasts(profiles);
        initForCasts(profiles);
      } catch {
        setResolvedCasts([]);
      }
    };

    // Reset state then resolve
    setPerCastFeedback({});
    setResolvedCasts([]);
    resolveCastList();
  }, [isOpen, casts, castId, reservationId]);

  // Load previously submitted feedback for this reservation by this guest and prefill
  useEffect(() => {
    const loadExisting = async () => {
      if (!isOpen || resolvedCasts.length === 0) return;
      try {
        const feedbackList = await getReservationFeedback(reservationId);
        // Map the current guest's feedback by cast
        const byCast: Record<number, { id: number; comment?: string | null; rating?: number | null; badge_id?: number | null; guest_id?: number }> = {};
        (Array.isArray(feedbackList) ? feedbackList : []).forEach((fb: any) => {
          if (fb && fb.cast_id != null && fb.guest_id === guestId) {
            byCast[fb.cast_id] = {
              id: fb.id,
              comment: fb.comment ?? null,
              rating: fb.rating ?? null,
              badge_id: fb.badge_id ?? null,
              guest_id: fb.guest_id,
            };
          }
        });
        setExistingFeedbackByCast(byCast);
        // Prefill UI state for each cast
        setPerCastFeedback(prev => {
          const next = { ...prev } as Record<number, { text: string; rating: number | null; badgeId: number | null }>;
          resolvedCasts.forEach(c => {
            const existing = byCast[c.id];
            const current = next[c.id] || { text: '', rating: null, badgeId: null };
            if (existing) {
              next[c.id] = {
                text: existing.comment ?? current.text ?? '',
                rating: (existing.rating ?? current.rating ?? null) as number | null,
                badgeId: (existing.badge_id ?? current.badgeId ?? null) as number | null,
              };
            } else if (!next[c.id]) {
              next[c.id] = current;
            }
          });
          return next;
        });
      } catch {
        // ignore failures; allow fresh input
      }
    };
    loadExisting();
  }, [isOpen, reservationId, guestId, resolvedCasts]);

  const handleSubmit = async () => {
    const list = (casts && casts.length > 0) ? casts : resolvedCasts;
    const payloads = list
      .map(c => ({ castId: c.id, data: perCastFeedback[c.id], existing: existingFeedbackByCast[c.id] }))
      .filter(({ data, existing }) => {
        if (existing) return true; // allow updates even if fields are cleared
        return Boolean(data && (data.text?.trim() || data.rating || data.badgeId));
      });

    if (payloads.length === 0) {
      setToast({ message: '少なくとも1人のキャストにフィードバックを入力してください', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      await Promise.all(
        payloads.map(async ({ castId: cid, data, existing }) => {
          const commentVal = (data?.text?.trim() || '') === '' ? null : data?.text?.trim();
          const ratingVal = (data && Object.prototype.hasOwnProperty.call(data, 'rating')) ? (data.rating ?? null) : null;
          const badgeVal = (data && Object.prototype.hasOwnProperty.call(data, 'badgeId')) ? (data.badgeId ?? null) : null;

          if (existing && existing.id) {
            return updateFeedback(existing.id, {
              comment: commentVal ?? null,
              rating: ratingVal,
              badge_id: badgeVal,
              reservation_id: reservationId,
              cast_id: cid,
              guest_id: guestId,
            } as any);
          }
          return submitFeedback({
            reservation_id: reservationId,
            cast_id: cid,
            guest_id: guestId,
            comment: commentVal || undefined,
            rating: data?.rating || undefined,
            badge_id: data?.badgeId || undefined,
          });
        })
      );

      setToast({ message: 'フィードバックを送信しました。ありがとうございました！', type: 'success' });
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1200);
    } catch (e: any) {
      setToast({ message: e?.response?.data?.message || 'フィードバック送信に失敗しました', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setPerCastFeedback({});
      onClose();
    }
  };

  const effectiveCasts = casts && casts.length > 0 ? casts : resolvedCasts;

  if (!isOpen) return null;

  return (
    <>
      <div className="inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center border border-gray-200 min-w-[420px] max-w-[420px] max-h-[90vh] overflow-y-auto">
          <h2 className="font-bold text-xl mb-6 text-gray-800">フィードバックを送信</h2>

          {effectiveCasts && effectiveCasts.length > 0 ? (
            <div className="w-full space-y-6">
              {effectiveCasts.map(cast => (
                <div key={cast.id} className="border rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-9 h-9 rounded-full bg-gray-200 inline-flex items-center justify-center overflow-hidden">
                      {getFirstAvatarUrl(cast.avatar) ? (
                        <img
                          src={getFirstAvatarUrl(cast.avatar) as string}
                          alt="avatar"
                          className="w-9 h-9 object-cover"
                        />
                      ) : (
                        <span className="text-sm text-gray-600">{(cast.nickname || `ID:${cast.id}`).slice(0, 2)}</span>
                      )}
                    </span>
                    <div className="font-medium text-gray-800">{cast.nickname || `キャスト #${cast.id}`}</div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">コメント (任意)</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 resize-none"
                      rows={3}
                      placeholder="キャストへの感想やフィードバックを入力してください"
                      value={perCastFeedback[cast.id]?.text || ''}
                      onChange={e => setPerCastFeedback(prev => ({
                        ...prev,
                        [cast.id]: { ...(prev[cast.id] || { text: '', rating: null, badgeId: null }), text: e.target.value }
                      }))}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">評価 (任意)</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(rating => (
                        <button
                          key={rating}
                          className={`w-9 h-9 rounded-full border-2 transition-colors ${
                            perCastFeedback[cast.id]?.rating === rating
                              ? 'bg-yellow-400 border-yellow-500 text-white'
                              : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                          }`}
                          onClick={() => setPerCastFeedback(prev => ({
                            ...prev,
                            [cast.id]: { ...(prev[cast.id] || { text: '', rating: null, badgeId: null }), rating: prev[cast.id]?.rating === rating ? null : rating }
                          }))}
                          disabled={isSubmitting}
                          type="button"
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">バッジを選択 (任意)</label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {badges.map(badge => (
                        <button
                          key={badge.id}
                          className={`p-3 rounded-lg border-2 transition-colors text-left ${
                            perCastFeedback[cast.id]?.badgeId === badge.id
                              ? 'bg-pink-100 border-pink-500 text-pink-700'
                              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                          onClick={() => setPerCastFeedback(prev => ({
                            ...prev,
                            [cast.id]: { ...(prev[cast.id] || { text: '', rating: null, badgeId: null }), badgeId: prev[cast.id]?.badgeId === badge.id ? null : badge.id }
                          }))}
                          disabled={isSubmitting}
                          type="button"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{badge.icon}</span>
                            <span className="text-sm font-medium">{badge.name}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{badge.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-600 text-sm">対象のキャストが見つかりません。</div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 w-full mt-6">
            <button 
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors hover:bg-gray-400"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button 
              className="flex-1 bg-pink-500 text-white px-4 py-3 rounded-lg font-medium transition-colors hover:bg-pink-600 disabled:opacity-50"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? '送信中...' : '送信'}
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <Toast 
          show 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </>
  );
};

export default FeedbackModal; 