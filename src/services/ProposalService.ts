import { createReservation, updateReservation, updateChat, sendMessage } from './api';

/**
 * ProposalService - Handles proposal approval flow using existing Pishatto-call system
 * This service reuses all existing time tracking, payment, and session management
 */
export class ProposalService {
    /**
     * Accept a proposal and create/update reservation using existing Pishatto-call system
     */
    static async acceptProposal(proposalData: {
        guest_id: number;
        cast_id: number;
        date: string;
        duration: number | string;
        totalPoints?: number;
        chatId: number;
        reservationId?: number;
    }, queryClient?: any) {
        console.log('ProposalService.acceptProposal called with:', proposalData);
        console.log('ProposalService: chatId =', proposalData.chatId, 'type =', typeof proposalData.chatId);
        try {
            // Convert duration to hours (backend expects hours, not minutes)
            let durationInHours: number;
            if (typeof proposalData.duration === 'string') {
                if (proposalData.duration.includes('時間')) {
                    durationInHours = parseFloat(proposalData.duration.replace('時間', ''));
                } else if (proposalData.duration.includes('分')) {
                    durationInHours = parseInt(proposalData.duration.replace('分', '')) / 60;
                } else {
                    durationInHours = 1; // Default to 1 hour
                }
            } else if (typeof proposalData.duration === 'number') {
                // If it's a number, treat it as hours
                durationInHours = proposalData.duration;
            } else {
                durationInHours = 1; // Default to 1 hour
            }
            
            console.log('ProposalService: Converted duration to hours:', durationInHours);
            
            let reservation;
            
            if (proposalData.reservationId) {
                // Update existing reservation
                reservation = await updateReservation(proposalData.reservationId, {
                    scheduled_at: proposalData.date,
                    duration: durationInHours,
                    details: `提案による予約更新 - 日時: ${proposalData.date}, 時間: ${durationInHours}時間`
                });
            } else {
                // Create new reservation using existing Pishatto-call API
                // The backend will now handle automatic payment for insufficient points
                reservation = await createReservation({
                    guest_id: proposalData.guest_id,
                    cast_id: proposalData.cast_id,
                    type: 'Pishatto', // Same type as Pishatto-call
                    scheduled_at: proposalData.date,
                    duration: durationInHours,
                    location: '提案による予約',
                    meeting_location: '提案による予約',
                    reservation_name: '提案による予約',
                    details: `提案による予約 - 日時: ${proposalData.date}, 時間: ${durationInHours}時間`,
                    points: proposalData.totalPoints || 0 // Add points for point transaction creation
                });
            }

            // Update chat with reservation_id to enable timer display
            const reservationId = reservation?.reservation?.id || reservation?.id;
            if (reservation && reservationId) {
                console.log('ProposalService: Updating chat with reservation_id', {
                    chatId: proposalData.chatId,
                    reservationId: reservationId
                });
                try {
                    console.log('ProposalService: About to call updateChat with:', {
                        chatId: proposalData.chatId,
                        reservation_id: reservationId
                    });
                    const updateResult = await updateChat(proposalData.chatId, { reservation_id: reservationId });
                    console.log('ProposalService: Chat updated successfully, result:', updateResult);
                    
                    // Update the frontend cache to reflect the new reservation_id
                    if (queryClient) {
                        console.log('ProposalService: Updating frontend cache for chatId:', proposalData.chatId);
                        
                        // Update both possible query keys for chat data
                        const chatQueryKey = ['chat', proposalData.chatId];
                        const castChatQueryKey = ['cast', 'chatById', proposalData.chatId];
                        
                        // Invalidate both query keys
                        queryClient.invalidateQueries({ queryKey: chatQueryKey });
                        queryClient.invalidateQueries({ queryKey: castChatQueryKey });
                        
                        // Manually update both caches to ensure immediate UI update
                        queryClient.setQueryData(chatQueryKey, (oldData: any) => {
                            if (oldData) {
                                return { ...oldData, reservation_id: reservationId };
                            }
                            return oldData;
                        });
                        
                        queryClient.setQueryData(castChatQueryKey, (oldData: any) => {
                            if (oldData) {
                                return { ...oldData, reservation_id: reservationId };
                            }
                            return oldData;
                        });
                        
                        console.log('ProposalService: Frontend cache updated with reservation_id:', reservationId);
                    }
                } catch (updateError: any) {
                    console.error('ProposalService: Failed to update chat:', updateError);
                    console.error('ProposalService: Update error details:', {
                        message: updateError.message,
                        status: updateError.response?.status,
                        data: updateError.response?.data
                    });
                    // Don't throw - this is not critical for the main flow
                }
            } else {
                console.error('ProposalService: No reservation ID found:', {
                    reservation: reservation,
                    reservationId: reservationId
                });
            }

            return reservation;
        } catch (error) {
            console.error('ProposalService.acceptProposal error:', error);
            throw error;
        }
    }

    /**
     * Send confirmation messages after proposal acceptance
     */
    static async sendConfirmationMessages(chatId: number, proposalData: any, reservationId: number) {
        try {
            // Convert duration to proper display format
            let displayDuration = proposalData.duration;
            if (typeof proposalData.duration === 'string') {
                if (proposalData.duration.includes('時間')) {
                    displayDuration = proposalData.duration; // Keep as "2時間"
                } else if (proposalData.duration.includes('分')) {
                    displayDuration = proposalData.duration; // Keep as "30分"
                } else {
                    // If it's a string number, treat as hours
                    const hours = parseFloat(proposalData.duration);
                    displayDuration = Number.isInteger(hours) ? `${hours}時間` : `${hours.toFixed(1)}時間`;
                }
            } else if (typeof proposalData.duration === 'number') {
                // If it's a number, treat it as hours (not minutes)
                const hours = proposalData.duration;
                displayDuration = Number.isInteger(hours) ? `${hours}時間` : `${hours.toFixed(1)}時間`;
            }

            // Send acceptance marker
            await sendMessage({
                chat_id: chatId,
                sender_guest_id: proposalData.guest_id,
                message: JSON.stringify({
                    type: 'proposal_accept',
                    reservationId: reservationId,
                    proposalKey: `${proposalData.date}-${proposalData.duration}`
                })
            });

            // Send confirmation to guest
            await sendMessage({
                chat_id: chatId,
                sender_guest_id: proposalData.guest_id,
                message: JSON.stringify({
                    type: 'system',
                    target: 'guest',
                    text: `✅ 予約が承認されました！\n📅 日時: ${new Date(proposalData.date).toLocaleString('ja-JP')}\n⏰ 時間: ${displayDuration}\n💰 ポイント: ${proposalData.totalPoints?.toLocaleString() || '0'}P\n\n合流後にキャストがタイマーを押下し、合流スタートとなります。そこからは自動課金となりますので、解散をご希望になる場合はキャスト側に解散の旨、お伝えください。`
                })
            });

            // Send confirmation to cast
            await sendMessage({
                chat_id: chatId,
                sender_guest_id: proposalData.guest_id,
                message: JSON.stringify({
                    type: 'system',
                    target: 'cast',
                    text: `✅ 予約が承認されました！\n📅 日時: ${new Date(proposalData.date).toLocaleString('ja-JP')}\n⏰ 時間: ${displayDuration}\n💰 ポイント: ${proposalData.totalPoints?.toLocaleString() || '0'}P\n\n合流直前にタイマーの押下を必ず行ってください。推し忘れが起きた場合、売上対象にならない可能性がありますので、ご注意ください。`
                })
            });
        } catch (error) {
            console.error('ProposalService.sendConfirmationMessages error:', error);
            // Don't throw - this is not critical
        }
    }

    /**
     * Reject a proposal
     */
    static async rejectProposal(chatId: number, proposalData: any, reason?: string) {
        try {
            await sendMessage({
                chat_id: chatId,
                sender_guest_id: proposalData.guest_id,
                message: JSON.stringify({
                    type: 'proposal_reject',
                    reason: reason || '提案を却下しました',
                    proposalKey: `${proposalData.date}-${proposalData.duration}`
                })
            });

            // Send rejection message to guest
            await sendMessage({
                chat_id: chatId,
                sender_guest_id: proposalData.guest_id,
                message: JSON.stringify({
                    type: 'system',
                    target: 'guest',
                    text: `❌ 提案が却下されました。${reason ? `理由: ${reason}` : ''}`
                })
            });
        } catch (error) {
            console.error('ProposalService.rejectProposal error:', error);
            throw error;
        }
    }
}

export default ProposalService;
