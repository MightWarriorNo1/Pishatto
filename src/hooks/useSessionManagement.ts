import { useState, useEffect, useCallback } from 'react';
import { createReservation, updateReservation } from '../services/api';

interface SessionState {
    isActive: boolean;
    startTime: Date | null;
    endTime: Date | null;
    elapsedTime: number; // in seconds
}

interface UseSessionManagementProps {
    reservationId?: number | null;
    chatId: number;
    onSessionStart?: () => void;
    onSessionEnd?: () => void;
    onReservationUpdate?: (reservation: any) => void;
}

export const useSessionManagement = ({
    reservationId,
    chatId,
    onSessionStart,
    onSessionEnd,
    onReservationUpdate
}: UseSessionManagementProps) => {
    const [sessionState, setSessionState] = useState<SessionState>({
        isActive: false,
        startTime: null,
        endTime: null,
        elapsedTime: 0
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        
        if (sessionState.isActive && sessionState.startTime) {
            interval = setInterval(() => {
                setSessionState(prev => ({
                    ...prev,
                    elapsedTime: Math.floor((Date.now() - prev.startTime!.getTime()) / 1000)
                }));
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [sessionState.isActive, sessionState.startTime]);

    // Format elapsed time
    const formatElapsedTime = useCallback((seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    // Start session (Meet button)
    const handleMeet = useCallback(async () => {
        if (!reservationId) {
            setError('予約IDが見つかりません');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Update reservation to mark as started by setting started_at
            const updatedReservation = await updateReservation(reservationId, {
                started_at: new Date().toISOString()
            });

            // Update local state
            setSessionState({
                isActive: true,
                startTime: new Date(),
                endTime: null,
                elapsedTime: 0
            });

            onSessionStart?.();
            onReservationUpdate?.(updatedReservation);
        } catch (err: any) {
            setError(err.message || 'セッション開始に失敗しました');
        } finally {
            setIsLoading(false);
        }
    }, [reservationId, onSessionStart, onReservationUpdate]);

    // Stop session (Dissolve button)
    const handleDissolve = useCallback(async () => {
        if (!reservationId) {
            setError('予約IDが見つかりません');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Update reservation to mark as completed by setting ended_at
            const updatedReservation = await updateReservation(reservationId, {
                ended_at: new Date().toISOString()
            });

            // Update local state
            setSessionState(prev => ({
                ...prev,
                isActive: false,
                endTime: new Date()
            }));

            onSessionEnd?.();
            onReservationUpdate?.(updatedReservation);
        } catch (err: any) {
            setError(err.message || 'セッション終了に失敗しました');
        } finally {
            setIsLoading(false);
        }
    }, [reservationId, onSessionEnd, onReservationUpdate]);

    // Create new reservation
    const createNewReservation = useCallback(async (proposalData: any) => {
        setIsLoading(true);
        setError(null);

        try {
            // Create reservation with required fields
            // Handle both camelCase and snake_case field names
            const newReservation = await createReservation({
                guest_id: proposalData.guest_id || proposalData.guestId,
                cast_id: proposalData.cast_id || proposalData.castId,
                scheduled_at: proposalData.date,
                duration: proposalData.duration
            });

            onReservationUpdate?.(newReservation);
            return newReservation;
        } catch (err: any) {
            setError(err.message || '予約作成に失敗しました');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [onReservationUpdate]);

    // Update existing reservation
    const updateExistingReservation = useCallback(async (proposalData: any) => {
        if (!reservationId) {
            setError('予約IDが見つかりません');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const updatedReservation = await updateReservation(reservationId, {
                scheduled_at: proposalData.date,
                duration: proposalData.duration
            });

            onReservationUpdate?.(updatedReservation);
            return updatedReservation;
        } catch (err: any) {
            setError(err.message || '予約更新に失敗しました');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [reservationId, onReservationUpdate]);

    // Accept proposal
    const acceptProposal = useCallback(async (proposalData: any) => {
        try {
            if (reservationId) {
                // Update existing reservation
                return await updateExistingReservation(proposalData);
            } else {
                // Create new reservation
                return await createNewReservation(proposalData);
            }
        } catch (err) {
            throw err;
        }
    }, [reservationId, updateExistingReservation, createNewReservation]);

    // Reset session
    const resetSession = useCallback(() => {
        setSessionState({
            isActive: false,
            startTime: null,
            endTime: null,
            elapsedTime: 0
        });
        setError(null);
    }, []);

    return {
        sessionState,
        isLoading,
        error,
        formatElapsedTime,
        handleMeet,
        handleDissolve,
        acceptProposal,
        resetSession
    };
};


