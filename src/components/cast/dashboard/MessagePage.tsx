/* eslint-disable */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, Calendar, Image, Search, Filter, Camera, FolderClosed, Send } from 'lucide-react';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useNavigate } from 'react-router-dom';
import MessageProposalPage from './MessageProposalPage';
import { useCast } from '../../../contexts/CastContext';
import { useChatMessages as useRealtimeChatMessages, useGroupMessages, useCastChatsRealtime, useGroupChatsRealtime } from '../../../hooks/useRealtime';
import {
    useCastChats,
    useChatMessages,
    useChatById,
    useGuestReservations,
    useSendMessage
} from '../../../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/react-query';
import ConciergeChat from '../../ConciergeChat';
import dayjs from 'dayjs';
import CastConciergeDetailPage from './CastConciergeDetailPage';
import CastGroupChatScreen from './CastGroupChatScreen';
import Spinner from '../../ui/Spinner';
import { useSessionManagement } from '../../../hooks/useSessionManagement';
import { startReservation, stopReservation, updateReservation, getChatById, completeSession, getCastGrade, getCastProfileById, getReservationById } from '../../../services/api';
import { useStartReservation } from '../../../hooks/useQueries';

const APP_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

dayjs.extend(utc);
dayjs.extend(timezone);

const userTz = dayjs.tz.guess();
const buildAvatarUrl = (path?: string) => {
    if (!path) return '/assets/avatar/1.jpg';
    if (path.startsWith('http')) return path;
    return `${APP_BASE_URL}/${path}`;
};
interface Message {
    id: string;
    avatar: string;
    name: string;
    lastMessage: string;
    timestamp: Date;
    unread: boolean;
    guestAge?: string; // This now stores birth year from backend
    is_group_chat?: boolean;
    group_id?: number;
    group_name?: string;
}

interface MessageDetailProps {
    message: Message;
    onBack: () => void;
}
interface Proposal {
    type: string;
    date?: string;
    people?: string;
    duration?: string | number;
    totalPoints?: number;
    extensionPoints?: number;
    reservationId?: number;
    [key: string]: any;
}

const MessageDetail: React.FC<MessageDetailProps> = ({ message, onBack }) => {
    const navigate = useNavigate();
    const [messageProposal, setMessageProposal] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const fileSelectInputRef = useRef<HTMLInputElement>(null);
    const APP_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
    const IMAGE_BASE_URL = APP_BASE_URL.replace(/\/api$/, '');
    const [showFile, setShowFile] = useState(false);
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [inputBarHeight, setInputBarHeight] = useState<number>(0);

    // Helper function to get localStorage key for sessions
    const getSessionStorageKey = (chatId: number) => `proposal_sessions_${chatId}`;

    // Helper function to get localStorage key for button usage
    const getButtonUsageStorageKey = (chatId: number) => `button_usage_${chatId}`;

    // Helper function to get localStorage key for clicked proposals
    const getClickedProposalsStorageKey = (chatId: number) => `clicked_proposals_${chatId}`;
const getAcceptedProposalsStorageKey = (chatId: number) => `accepted_proposals_${chatId}`;

    // Proposal modal state
    const [showProposalModal, setShowProposalModal] = useState(false);
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
    const [selectedProposalMsgId, setSelectedProposalMsgId] = useState<number | null>(null);

    // Local state to track accepted proposals for immediate UI feedback
    const [acceptedProposals, setAcceptedProposals] = useState<Set<string>>(new Set());
    const [deniedProposalMsgIds, setDeniedProposalMsgIds] = useState<Set<number>>(new Set());

    // New state to track clicked proposals - persisted in localStorage
    const [clickedProposals, setClickedProposals] = useState<Set<string>>(new Set());

    // New state to track button usage - persisted in localStorage
    const [buttonUsage, setButtonUsage] = useState<{
        meetUpUsed: boolean;
        dismissUsed: boolean;
    }>(() => {
        // Load button usage from localStorage on component mount
        if (!message.id) return { meetUpUsed: false, dismissUsed: false };
        
        const storageKey = getButtonUsageStorageKey(Number(message.id));
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                console.log('Initial button usage loaded from localStorage:', {
                    chatId: message.id,
                    storageKey,
                    loadedUsage: parsed
                });
                return parsed;
            } catch (error) {
                console.error('Failed to parse button usage from localStorage:', error);
            }
        }
        console.log('No initial button usage found, using defaults:', {
            chatId: message.id,
            storageKey
        });
        return {
            meetUpUsed: false,
            dismissUsed: false
        };
    });

    // Matching confirmation state


    // Session management state for proposals
    const [proposalSessions, setProposalSessions] = useState<Map<string, {
        isActive: boolean;
        startTime: Date | null;
        elapsedTime: number;
        reservationId: number | null;
        totalPoints?: number;
        castPoints?: number;
        guestPoints?: number;
    }>>(new Map());



    // Camera functionality
    const [showCamera, setShowCamera] = useState(false);
    const [cameraError, setCameraError] = useState('');
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // New: ref for input bar and popover for click outside
    const inputBarRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const { castId } = useCast() as any;
    const queryClient = useQueryClient();

    // React Query hooks
    const { data: messages = [], isLoading: messagesLoading, refetch: refetchMessages } = useChatMessages(Number(message.id), castId);
    const { data: chatInfo } = useChatById(Number(message.id));
    const { data: guestReservations = [] } = useGuestReservations(chatInfo?.guest?.id || 0);
    const sendMessageMutation = useSendMessage();

    // Reservation management hooks
    const startReservationMutation = useStartReservation();

    // Debug: Log chatInfo structure
    useEffect(() => {
        if (chatInfo) {
            console.log('chatInfo structure:', chatInfo);
            console.log('chatInfo.guest:', chatInfo.guest);
            console.log('chatInfo.guest?.id:', chatInfo.guest?.id);
        }
    }, [chatInfo]);

    // Debug: Log guestReservations data
    useEffect(() => {
        if (guestReservations.length > 0) {
            console.log('guestReservations data:', guestReservations);
        }
    }, [guestReservations]);

    // Session management for proposals
    const {
        acceptProposal,
        isLoading: sessionLoading,
        error: sessionError
    } = useSessionManagement({
        chatId: Number(message.id),
        onReservationUpdate: async (reservation) => {
            console.log('Reservation updated, invalidating queries:', reservation);
            // Refetch guest reservations to update the accepted status
            if (chatInfo?.guest?.id) {
                await queryClient.invalidateQueries({
                    queryKey: queryKeys.cast.guestReservations(chatInfo.guest.id)
                });
                // Also refetch the chat info to ensure we have the latest data
                await queryClient.invalidateQueries({
                    queryKey: queryKeys.cast.chatById(Number(message.id))
                });
            }
        }
    });

    // Build accepted proposal set from DB marker messages
    const acceptedFromDb = useMemo(() => {
        const set = new Set<string>();
        (messages || []).forEach((msg: any) => {
            try {
                const parsed = typeof msg.message === 'string' ? JSON.parse(msg.message) : null;
                if (parsed && parsed.type === 'proposal_accept' && parsed.proposalKey) {
                    set.add(String(parsed.proposalKey));
                }
            } catch (_) {}
        });
        return set;
    }, [messages]);

    // Merge DB-derived acceptance into local state so it persists after refresh
    useEffect(() => {
        if (acceptedFromDb.size === 0) return;
        setAcceptedProposals(prev => {
            const merged = new Set(prev);
            acceptedFromDb.forEach(k => merged.add(k));
            return merged;
        });
    }, [acceptedFromDb]);

    // Real-time updates using the existing hook
    useRealtimeChatMessages(Number(message.id), (incoming: any) => {
        // Lightweight guard: if we already have this message ID locally, skip redundant refetch
        const exists = (messages || []).some((m: any) => String(m.id) === String(incoming.id));
        if (!exists) {
            queryClient.invalidateQueries({
                queryKey: queryKeys.cast.chatMessages(Number(message.id), castId)
            });
        }

        let shouldRefreshReservations = false;
        try {
            const parsed = typeof incoming.message === 'string' ? JSON.parse(incoming.message) : null;
            if (parsed && parsed.type === 'proposal') shouldRefreshReservations = true;
            if (parsed && (parsed.type === 'proposal_accept' || parsed.type === 'proposal_reject')) shouldRefreshReservations = true;
        } catch (_) {}
        if (shouldRefreshReservations && chatInfo?.guest?.id) {
            queryClient.invalidateQueries({
                queryKey: queryKeys.cast.guestReservations(chatInfo.guest.id)
            });
        }
    });

    // Refresh guest reservations when proposals are present to ensure acceptance status is up-to-date
    useEffect(() => {
        if (!chatInfo?.guest?.id || !castId) return;
        
        // Check if there are any proposal messages
        const hasProposals = messages.some((msg: any) => {
            try {
                const parsed = typeof msg.message === 'string' ? JSON.parse(msg.message) : null;
                return parsed && parsed.type === 'proposal';
            } catch (e) {
                return false;
            }
        });

        if (hasProposals) {
            // Invalidate guest reservations query to get fresh data
            queryClient.invalidateQueries({
                queryKey: queryKeys.cast.guestReservations(chatInfo.guest.id)
            });
        }
    }, [chatInfo?.guest?.id, castId, messages, queryClient]);

    // Periodic refresh of guest reservations when proposals are present
    useEffect(() => {
        if (!chatInfo?.guest?.id || !castId) return;
        
        // Check if there are any proposal messages
        const hasProposals = messages.some((msg: any) => {
            try {
                const parsed = typeof msg.message === 'string' ? JSON.parse(msg.message) : null;
                return parsed && parsed.type === 'proposal';
            } catch (e) {
                return false;
            }
        });

        if (hasProposals) {
            // Set up periodic refresh every 3 seconds when proposals exist
            const interval = setInterval(() => {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.cast.guestReservations(chatInfo.guest.id)
                });
            }, 3000);
            
            return () => clearInterval(interval);
        }
    }, [chatInfo?.guest?.id, castId, messages, queryClient]);

    // Set up real-time listener for group messages
    const [groupId, setGroupId] = useState<number | null>(null);

    useGroupMessages(groupId || 0, (message) => {
        // Only process if this message belongs to our chat and we have a valid group ID
        if (groupId && message.chat_id === Number(message.id)) {
            // Invalidate React Query cache to trigger refetch
            queryClient.invalidateQueries({
                queryKey: queryKeys.cast.chatMessages(Number(message.id), castId)
            });
        }
    });

    // Get chat info to check if it belongs to a group
    useEffect(() => {
        if (!message.id || !castId || !chatInfo) return;

        // Check if this chat belongs to a group
        if (chatInfo.group_id) {
            setGroupId(chatInfo.group_id);
        } else {
            setGroupId(null);
        }
    }, [message.id, castId, chatInfo]);

    // Check for matching confirmation and add automatic message
    // Matching messages are now handled by backend through group chats
    // No need for frontend simulation

    // Close popover when clicking outside input bar or popover
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                showFile &&
                inputBarRef.current &&
                popoverRef.current &&
                !inputBarRef.current.contains(event.target as Node) &&
                !popoverRef.current.contains(event.target as Node)
            ) {
                setShowFile(false);
            }
        };
        if (showFile) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showFile]);

    // Ensure freshest data when opening a chat
    useEffect(() => {
        // Force a refetch on mount or when switching chats
        refetchMessages?.();
        // Load accepted proposals from localStorage when switching chats
        const acceptedProposalsKey = getAcceptedProposalsStorageKey(Number(message.id));
        const savedAcceptedProposals = localStorage.getItem(acceptedProposalsKey);
        if (savedAcceptedProposals) {
            try {
                const parsed = JSON.parse(savedAcceptedProposals);
                setAcceptedProposals(new Set(parsed));
                console.log('Accepted proposals loaded from localStorage:', {
                    chatId: message.id,
                    storageKey: acceptedProposalsKey,
                    loadedProposals: parsed
                });
            } catch (error) {
                console.error('Failed to parse accepted proposals from localStorage:', error);
                setAcceptedProposals(new Set());
            }
        } else {
            setAcceptedProposals(new Set());
            console.log('No accepted proposals found in localStorage, using defaults:', {
                chatId: message.id,
                storageKey: acceptedProposalsKey
            });
        }
        // Load button usage state from localStorage when switching chats
        const storageKey = getButtonUsageStorageKey(Number(message.id));
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setButtonUsage(parsed);
                console.log('Button usage loaded from localStorage:', {
                    chatId: message.id,
                    storageKey,
                    loadedUsage: parsed
                });
            } catch (error) {
                console.error('Failed to parse button usage from localStorage:', error);
                setButtonUsage({
                    meetUpUsed: false,
                    dismissUsed: false
                });
            }
        } else {
            setButtonUsage({
                meetUpUsed: false,
                dismissUsed: false
            });
            console.log('No button usage found in localStorage, using defaults:', {
                chatId: message.id,
                storageKey
            });
        }

        // Load clicked proposals state from localStorage when switching chats
        const clickedProposalsKey = getClickedProposalsStorageKey(Number(message.id));
        const savedClickedProposals = localStorage.getItem(clickedProposalsKey);
        if (savedClickedProposals) {
            try {
                const parsed = JSON.parse(savedClickedProposals);
                setClickedProposals(new Set(parsed));
                console.log('Clicked proposals loaded from localStorage:', {
                    chatId: message.id,
                    storageKey: clickedProposalsKey,
                    loadedProposals: parsed
                });
            } catch (error) {
                console.error('Failed to parse clicked proposals from localStorage:', error);
                setClickedProposals(new Set());
            }
        } else {
            setClickedProposals(new Set());
            console.log('No clicked proposals found in localStorage, using defaults:', {
                chatId: message.id,
                storageKey: clickedProposalsKey
            });
        }

        // Don't clear proposal sessions here - they will be restored from localStorage
        // setProposalSessions(new Map());
    }, [refetchMessages, message.id]);

    // Measure input bar height (including dynamic content) and update on resize/state changes
    useEffect(() => {
        const updateHeights = () => {
            if (inputBarRef.current) {
                setInputBarHeight(inputBarRef.current.getBoundingClientRect().height);
            }
        };
        updateHeights();
        window.addEventListener('resize', updateHeights);
        return () => window.removeEventListener('resize', updateHeights);
    }, []);

    useEffect(() => {
        if (inputBarRef.current) {
            setInputBarHeight(inputBarRef.current.getBoundingClientRect().height);
        }
    }, [imagePreview, attachedFile, showFile, showCamera]);

    // Deduplicate messages (sometimes realtime + refetch can transiently duplicate entries until refresh)
    const dedupedMessages = useMemo(() => {
        const seen = new Set<string>();
        const result: any[] = [];
        (messages || []).forEach((m: any) => {
            const key = String(m?.id ?? `${m?.sender_cast_id || ''}-${m?.sender_guest_id || ''}-${m?.created_at || ''}-${m?.message || ''}`);
            if (!seen.has(key)) {
                seen.add(key);
                result.push(m);
            }
        });
        return result;
    }, [messages]);

    // Auto scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [dedupedMessages]);

    // Ensure messages are displayed from old to new
    const sortedMessages = useMemo(() => {
        return [...(dedupedMessages || [])].sort((a: any, b: any) => {
            const aTime = a?.created_at ? new Date(a.created_at).getTime() : 0;
            const bTime = b?.created_at ? new Date(b.created_at).getTime() : 0;
            return aTime - bTime;
        });
    }, [dedupedMessages]);

    // Build denied set from DB markers so state persists on refresh
    const deniedFromDb = useMemo(() => {
        const ids = new Set<number>();
        (dedupedMessages || []).forEach((m: any) => {
            try {
                const parsed = typeof m.message === 'string' ? JSON.parse(m.message) : null;
                if (parsed && parsed.type === 'proposal_reject' && typeof parsed.proposalMsgId === 'number') {
                    ids.add(Number(parsed.proposalMsgId));
                }
            } catch (_) {}
        });
        return ids;
    }, [dedupedMessages]);

    useEffect(() => {
        if (deniedFromDb.size === 0) return;
        setDeniedProposalMsgIds(prev => {
            const merged = new Set(prev);
            deniedFromDb.forEach(id => merged.add(id));
            return merged;
        });
    }, [deniedFromDb]);

    // Close popovers/modals with Escape
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowFile(false);
                setShowCamera(false);
                setLightboxUrl(null);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    // Real-time updates are handled by React Query automatically

    const formatTime = (timestamp: string) => {

        return dayjs.utc(timestamp).tz(userTz).format('YYYY-MM-DD HH:mm');
    };

    // Normalize proposal key to be stable across sessions/refreshes
    const makeProposalKey = (date: any, duration: any): string => {
        if (!date || !duration) return '';
        // Use full datetime precision to avoid collisions on same-day proposals
        const normalizedDateTime = dayjs(date).format('YYYY-MM-DD HH:mm');
        const normalizedDuration = parseInt(String(duration), 10);
        return `${normalizedDateTime}-${normalizedDuration}`;
    };

    const handleImageButtonClick = () => {
        setShowFile((prev) => !prev);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAttachedFile(file);
            const reader = new FileReader();
            reader.onload = (ev) => setImagePreview(ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    // Load sessions from localStorage on mount and when switching chats
    useEffect(() => {
        if (message.id) {
            const storageKey = getSessionStorageKey(Number(message.id));
            const savedSessions = localStorage.getItem(storageKey);
            if (savedSessions) {
                try {
                    const parsed = JSON.parse(savedSessions);
                    const restoredSessions = new Map();

                    parsed.forEach(([key, sessionData]: [string, any]) => {
                        // Restore startTime as Date object
                        if (sessionData.startTime) {
                            sessionData.startTime = new Date(sessionData.startTime);
                        }
                        restoredSessions.set(key, sessionData);
                    });

                    setProposalSessions(restoredSessions);
                    console.log('Restored sessions from localStorage for chat', message.id, ':', restoredSessions);
                } catch (error) {
                    console.error('Failed to restore sessions from localStorage:', error);
                }
            } else {
                // If no saved sessions, clear the current sessions
                setProposalSessions(new Map());
                console.log('No saved sessions found for chat', message.id, '- clearing sessions');
            }
        }
    }, [message.id]);

    // Save sessions to localStorage whenever they change
    useEffect(() => {
        if (message.id && proposalSessions.size > 0) {
            const storageKey = getSessionStorageKey(Number(message.id));
            const sessionsArray = Array.from(proposalSessions.entries());
            localStorage.setItem(storageKey, JSON.stringify(sessionsArray));
        }
    }, [proposalSessions, message.id]);

    // Save button usage to localStorage whenever it changes
    useEffect(() => {
        if (message.id) {
            const storageKey = getButtonUsageStorageKey(Number(message.id));
            localStorage.setItem(storageKey, JSON.stringify(buttonUsage));
            console.log('Button usage saved to localStorage:', {
                chatId: message.id,
                storageKey,
                buttonUsage
            });
        }
    }, [buttonUsage, message.id]);

    // Save clicked proposals to localStorage whenever they change
    useEffect(() => {
        if (message.id) {
            const storageKey = getClickedProposalsStorageKey(Number(message.id));
            localStorage.setItem(storageKey, JSON.stringify(Array.from(clickedProposals)));
            console.log('Clicked proposals saved to localStorage:', {
                chatId: message.id,
                storageKey,
                clickedProposals: Array.from(clickedProposals)
            });
        }
    }, [clickedProposals, message.id]);

    // Save accepted proposals to localStorage whenever they change
    useEffect(() => {
        if (message.id) {
            const storageKey = getAcceptedProposalsStorageKey(Number(message.id));
            localStorage.setItem(storageKey, JSON.stringify(Array.from(acceptedProposals)));
            console.log('Accepted proposals saved to localStorage:', {
                chatId: message.id,
                storageKey,
                acceptedProposals: Array.from(acceptedProposals)
            });
        }
    }, [acceptedProposals, message.id]);

    // Cleanup: Save sessions before unmounting or switching chats
    useEffect(() => {
        return () => {
            if (message.id && proposalSessions.size > 0) {
                const storageKey = getSessionStorageKey(Number(message.id));
                const sessionsArray = Array.from(proposalSessions.entries());
                localStorage.setItem(storageKey, JSON.stringify(sessionsArray));
            }
            // Save button usage before unmounting
            if (message.id) {
                const storageKey = getButtonUsageStorageKey(Number(message.id));
                localStorage.setItem(storageKey, JSON.stringify(buttonUsage));
            }
            // Save clicked proposals before unmounting
            if (message.id) {
                const storageKey = getClickedProposalsStorageKey(Number(message.id));
                localStorage.setItem(storageKey, JSON.stringify(Array.from(clickedProposals)));
            }
            // Save accepted proposals before unmounting
            if (message.id) {
                const storageKey = getAcceptedProposalsStorageKey(Number(message.id));
                localStorage.setItem(storageKey, JSON.stringify(Array.from(acceptedProposals)));
            }
        };
    }, [message.id, proposalSessions, buttonUsage, clickedProposals, acceptedProposals]);

    // Session management functions for proposals
    const startProposalSession = async (proposal: Proposal) => {
        const proposalKey = makeProposalKey(proposal.date, proposal.duration);

        try {
            // Find the matching reservation
            const matchingReservation = guestReservations.find((res: any) => {
                if (!res.scheduled_at || !chatInfo?.guest?.id) return false;

                const proposalDate = dayjs(proposal.date);
                const reservationDate = dayjs(res.scheduled_at);

                // Check if dates match and guest IDs match
                return res.guest_id === chatInfo.guest.id &&
                    reservationDate.isSame(proposalDate, 'day');
            });

            if (!matchingReservation) {
                console.error('No matching reservation found for proposal');
                return;
            }

            // Start the reservation in the database
            if (castId) {
                await startReservationMutation.mutateAsync({
                    reservationId: matchingReservation.id,
                    castId: castId
                });
            }

            // Update local session state to start the session
            setProposalSessions(prev => {
                const newMap = new Map(prev);
                const newSession = {
                    isActive: true,
                    startTime: new Date(),
                    elapsedTime: 0,
                    reservationId: matchingReservation.id
                };
                newMap.set(proposalKey, newSession);
                console.log('Setting new session:', { proposalKey, newSession, prevSize: prev.size, newSize: newMap.size });
                return newMap;
            });

            console.log('Proposal session started:', proposalKey);
        } catch (error) {
            console.error('Failed to start proposal session:', error);
        }
    };

    // Function to handle proposal clicks and update reservations
    const handleProposalClick = async (proposal: Proposal, messageId: string) => {
        const proposalKey = makeProposalKey(proposal.date, proposal.duration);
        
        // Mark proposal as clicked
        setClickedProposals(prev => {
            const newSet = new Set(prev);
            newSet.add(proposalKey);
            return newSet;
        });

        try {
            // Try to find existing reservation to update
            let reservationToUpdate = null;
            
            if (chatInfo?.reservation_id) {
                // If chat has a reservation_id, try to get it
                reservationToUpdate = guestReservations.find((res: any) => 
                    res.id === chatInfo.reservation_id
                );
                
                if (!reservationToUpdate) {
                    // Fetch from API if not in local data
                    reservationToUpdate = await getReservationDetails(chatInfo.reservation_id);
                }
            }

            // If no existing reservation, try to find by date matching
            if (!reservationToUpdate) {
                reservationToUpdate = guestReservations.find((res: any) => {
                    if (!res.scheduled_at || !chatInfo?.guest?.id) return false;
                    
                    const proposalDate = dayjs(proposal.date);
                    const reservationDate = dayjs(res.scheduled_at);
                    
                    return res.guest_id === chatInfo.guest.id &&
                        reservationDate.isSame(proposalDate, 'day');
                });
            }

            // Update reservation with proposal context if found
            if (reservationToUpdate) {
                const updateData: any = {
                    // Add proposal context to reservation details
                    details: JSON.stringify({
                        ...JSON.parse(reservationToUpdate.details || '{}'),
                        proposal_context: {
                            message_id: messageId,
                            clicked_at: new Date().toISOString(),
                            cast_id: castId,
                            proposal_data: {
                                date: proposal.date,
                                people: proposal.people,
                                duration: proposal.duration,
                                totalPoints: proposal.totalPoints,
                                extensionPoints: proposal.extensionPoints
                            }
                        }
                    })
                };

                // Update the reservation
                await updateReservation(reservationToUpdate.id, updateData);
                console.log('Reservation updated with proposal context:', {
                    reservationId: reservationToUpdate.id,
                    proposalKey,
                    updateData
                });

                // Invalidate queries to refresh data
                if (chatInfo?.guest?.id) {
                    await queryClient.invalidateQueries({
                        queryKey: queryKeys.cast.guestReservations(chatInfo.guest.id)
                    });
                }
            } else {
                console.log('No reservation found to update with proposal context');
            }
        } catch (error) {
            console.error('Failed to update reservation with proposal context:', error);
        }

        // Show proposal modal
        setSelectedProposal(proposal);
        setShowProposalModal(true);
    };

    const exitProposalSession = async (proposal: Proposal) => {
        const proposalKey = makeProposalKey(proposal.date, proposal.duration);
        const session = proposalSessions.get(proposalKey);

        if (!session) {
            console.error('No session found for proposal');
            return;
        }

        try {
            // If session is active, stop it first
            if (session.isActive && castId && session.reservationId) {
                await stopReservation(session.reservationId, castId);
            }

            // Update the reservation status to cancelled/exited
            if (session.reservationId) {
                await updateReservation(session.reservationId, {
                    ended_at: new Date().toISOString(),
                    // Add a status field if your API supports it
                });
            }

            // Update local session to inactive instead of removing it
            setProposalSessions(prev => {
                const newMap = new Map(prev);
                newMap.set(proposalKey, {
                    ...session,
                    isActive: false,
                    startTime: null,
                    elapsedTime: 0
                });
                return newMap;
            });

            // Remove from accepted proposals
            setAcceptedProposals(prev => {
                const newSet = new Set(prev);
                newSet.delete(proposalKey);
                return newSet;
            });

        } catch (error) {
            console.error('Failed to exit proposal session:', error);
        }
    };

    // Timer effect for proposal sessions
    useEffect(() => {
        const interval = setInterval(() => {
            setProposalSessions(prev => {
                const newMap = new Map(prev);
                let hasChanges = false;

                newMap.forEach((session, key) => {
                    if (session.isActive && session.startTime) {
                        const elapsed = Math.floor((Date.now() - session.startTime.getTime()) / 1000);
                        if (elapsed !== session.elapsedTime) {
                            newMap.set(key, { ...session, elapsedTime: elapsed });
                            hasChanges = true;
                        }
                    }
                });

                return hasChanges ? newMap : prev;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);



    // Auto-stop sessions when they reach their duration limit
    useEffect(() => {
        const checkAndStopSessions = () => {
            console.log('Auto-stop check running, current sessions:', Array.from(proposalSessions.entries()));
            proposalSessions.forEach((session, key) => {
                if (session.isActive && session.startTime) {
                    const elapsed = Math.floor((Date.now() - session.startTime.getTime()) / 1000);
                    // Extract duration from session key (last part after the last dash)
                    const sessionKeyParts = key.split('-');
                    const durationInSeconds = Number(sessionKeyParts[sessionKeyParts.length - 1]) * 60;

                    console.log('Session check:', { key, elapsed, durationInSeconds, willStop: elapsed >= durationInSeconds });

                    if (elapsed >= durationInSeconds) {
                        console.log('Auto-stopping session:', key);
                        // Auto-stop the session - reconstruct the proposal date properly
                        const duration = sessionKeyParts[sessionKeyParts.length - 1];
                        const datePart = sessionKeyParts.slice(0, -1).join('-');
                        const proposal = {
                            date: datePart,
                            duration: duration
                        };
                        exitProposalSession(proposal as Proposal);
                    }
                }
            });
        };

        // Check every 30 seconds instead of on every proposalSessions change
        const interval = setInterval(checkAndStopSessions, 30000);
        return () => clearInterval(interval);
    }, [proposalSessions]);

    // Format elapsed time for display
    const formatElapsedTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Format remaining time for display
    const formatRemainingTime = (elapsed: number, duration: number): string => {
        const totalSeconds = duration * 60;
        const remaining = Math.max(0, totalSeconds - elapsed);
        const hours = Math.floor(remaining / 3600);
        const minutes = Math.floor((remaining % 3600) / 60);
        const secs = remaining % 60;

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Check if session is about to end (within 5 minutes)
    const isSessionEndingSoon = (elapsed: number, duration: number): boolean => {
        const totalSeconds = duration * 60;
        const remaining = totalSeconds - elapsed;
        return remaining <= 300 && remaining > 0; // 5 minutes = 300 seconds
    };

    // Camera functionality
    const handleOpenCamera = async () => {
        setCameraError('');
        setShowCamera(true);
        setShowFile(false);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
        } catch (err: any) {
            setCameraError('カメラを利用できません。ブラウザの設定やアクセス権限を確認してください。');
        }
    };

    const handleTakePhoto = () => {
        if (!videoRef.current) return;
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        const width = video.videoWidth;
        const height = video.videoHeight;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, width, height);
        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
                setAttachedFile(file);
                const reader = new FileReader();
                reader.onload = (ev) => setImagePreview(ev.target?.result as string);
                reader.readAsDataURL(file);
                setShowCamera(false);
                // Stop the stream
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach((track) => track.stop());
                    streamRef.current = null;
                }
            }
        }, 'image/jpeg');
    };

    const handleCloseCamera = () => {
        setShowCamera(false);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
    };

    const handleAvatarClick = () => {
        if (chatInfo?.guest?.id) {
            navigate(`/guest/${chatInfo.guest.id}`);
        }
    };

    // Helper function to get reservation details
    const getReservationDetails = async (reservationId: number) => {
        try {
            const reservation = await getReservationById(reservationId);
            console.log('Fetched reservation details:', reservation);
            return reservation;
        } catch (error) {
            console.error('Failed to fetch reservation details:', error);
            return null;
        }
    };

    // Helper function to extract pending amount from reservation details
    const extractPendingAmount = (reservation: any): number => {
        if (!reservation) return 0;

        // First try to get from details.使用ポイント field
        if (reservation.details) {
            try {
                // Try to parse as JSON first
                let details;
                if (typeof reservation.details === 'string') {
                    try {
                        details = JSON.parse(reservation.details);
                    } catch (jsonError) {
                        // If JSON parsing fails, treat as plain text
                        console.log('Details is not JSON, treating as plain text:', reservation.details);

                        // Look for patterns like "使用ポイント: 18,000P" or "使用ポイント：18,000P" in plain text
                        const text = reservation.details;
                        const patterns = [
                            /使用ポイント[：:]\s*([\d,]+)P?/,  // 使用ポイント: 18,000P or 使用ポイント：18,000P
                            /usage_points[：:]\s*([\d,]+)P?/,   // usage_points: 18,000P
                            /([\d,]+)\s*ポイント/,             // 18,000 ポイント
                            /([\d,]+)\s*P/,                    // 18,000 P
                            /([\d,]+)P/                        // 18,000P
                        ];

                        for (const pattern of patterns) {
                            const match = text.match(pattern);
                            if (match && match[1]) {
                                // Remove commas and parse as integer
                                const cleanAmount = match[1].replace(/,/g, '');
                                const amount = parseInt(cleanAmount, 10);
                                if (amount > 0) {
                                    console.log('Extracted pending amount from plain text:', {
                                        text: reservation.details,
                                        pattern: pattern.toString(),
                                        rawMatch: match[1],
                                        cleanAmount,
                                        extractedAmount: amount
                                    });
                                    return amount;
                                }
                            }
                        }

                        // If no pattern matches, return 0
                        console.log('No amount pattern found in plain text details');
                        return 0;
                    }
                } else {
                    details = reservation.details;
                }

                // If we have parsed JSON details, try to extract the amount
                if (details && typeof details === 'object') {
                    let pendingAmount = details.使用ポイント || details.usage_points || 0;

                    // Handle formatted strings like "18,000P"
                    if (typeof pendingAmount === 'string') {
                        // Remove commas and "P" suffix, then parse as integer
                        const cleanAmount = pendingAmount.replace(/,/g, '').replace(/P$/, '');
                        pendingAmount = parseInt(cleanAmount, 10) || 0;
                    }

                    if (pendingAmount > 0) {
                        console.log('Extracted pending amount from JSON details:', {
                            details,
                            extractedAmount: pendingAmount,
                            fieldUsed: details.使用ポイント ? '使用ポイント' : 'usage_points'
                        });
                        return pendingAmount;
                    }
                }
            } catch (error) {
                console.error('Failed to extract pending amount from details:', error);
            }
        }

        // Fallback to total_points if details parsing fails
        let fallbackAmount = reservation.total_points || 0;

        // Handle formatted strings like "18,000P" in total_points as well
        if (typeof fallbackAmount === 'string') {
            // Remove commas and "P" suffix, then parse as integer
            const cleanAmount = fallbackAmount.replace(/,/g, '').replace(/P$/, '');
            fallbackAmount = parseInt(cleanAmount, 10) || 0;
        }

        console.log('Using fallback total_points:', fallbackAmount);
        return fallbackAmount;
    };

    // Simplified session start function that works without database reservations
    const startSimpleSession = (proposal: Proposal) => {
        const proposalKey = makeProposalKey(proposal.date, proposal.duration);
        console.log('Starting simple session for proposal:', proposal);
        console.log('Current proposalSessions before:', Array.from(proposalSessions.entries()));

        setProposalSessions(prev => {
            const newMap = new Map(prev);
            const newSession = {
                isActive: true,
                startTime: new Date(),
                elapsedTime: 0,
                reservationId: null
            };
            newMap.set(proposalKey, newSession);
            console.log('Simple session created:', { proposalKey, newSession });
            console.log('New proposalSessions after:', Array.from(newMap.entries()));
            return newMap;
        });
    };

    if (messageProposal) return <MessageProposalPage
        chatId={Number(message.id)}
        onBack={() => setMessageProposal(false)}
        onProposalSend={async (proposal) => {
            try {
                // use castId from component scope
                if (!castId) return;
                const payload: any = {
                    chat_id: Number(message.id),
                    sender_cast_id: castId,
                    message: JSON.stringify({ type: 'proposal', ...proposal }),
                };
                await sendMessageMutation.mutateAsync(payload);
            } finally {
                setMessageProposal(false);
            }
        }}
    />;


    return (
        <div className="min-h-screen bg-gradient-to-b from-primary via-primary to-secondary relative pb-24 md:pb-28 max-w-md md:max-w-2xl lg:max-w-3xl">
            {/* Header (fixed) */}
            <div className="fixed left-0 right-0 mx-auto w-full max-w-md h-16 flex items-center px-4 py-3 border-b border-secondary bg-primary">
                <button onClick={onBack} className="mr-2 text-white hover:text-secondary cursor-pointer">
                    <ChevronLeft size={24} />
                </button>
                <div className="flex items-center">
                    <img
                        src={`${message.avatar}`}
                        alt={message.name}
                        className="w-8 h-8 rounded-full mr-2 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={handleAvatarClick}
                    />
                    <span className="text-lg font-bold text-white">{message.name}</span>
                </div>
            </div>

            {/* Fixed Timer - Only visible when chat has reservation_id */}
            {chatInfo?.reservation_id && (
            <div className="fixed left-0 right-0 top-16 mx-auto w-full max-w-md z-20 px-4 py-2 bg-primary border-b border-secondary">
                <div className="p-4 bg-gradient-to-r from-green-900 to-blue-900 rounded-lg border border-green-400">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-white text-sm font-bold">⏱️ セッションタイマー</span>
                        {(() => {
                            let hasActiveSession = false;
                            proposalSessions.forEach((session) => { if (session.isActive) hasActiveSession = true; });
                            return (
                                <div className="flex items-center space-x-2">
                                    <div className={`w-2 h-2 rounded-full ${hasActiveSession ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                                    <span className={`${hasActiveSession ? 'text-green-300' : 'text-gray-300'} text-xs`}>{hasActiveSession ? 'アクティブ' : '待機中'}</span>
                                </div>
                            );
                        })()}
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-white text-xs">経過時間</span>
                        <div className="text-2xl font-mono font-bold text-green-400">
                            {(() => {
                                let displayTime = '00:00';
                                proposalSessions.forEach((session) => {
                                    if (session.isActive) displayTime = formatElapsedTime(session.elapsedTime);
                                    else if (!session.isActive && session.elapsedTime > 0) displayTime = formatElapsedTime(session.elapsedTime);
                                });
                                return displayTime;
                            })()}
                        </div>
                    </div>

                    {/* Control Buttons (always accessible) */}
                    <div className="flex space-x-2 mt-3">
                        {(!buttonUsage.meetUpUsed) && (
                            <button
                                onClick={() => {
                                    const testProposal: any = { type: 'proposal', date: new Date().toISOString().split('T')[0], duration: 60 };
                                    startSimpleSession(testProposal);
                                    setButtonUsage(prev => ({ ...prev, meetUpUsed: true }));
                                }}
                                disabled={(() => { let active = false; proposalSessions.forEach(s => { if (s.isActive) active = true; }); return active; })()}
                                className={`flex-1 px-4 py-2 rounded-lg font-bold text-sm transition-all disabled:opacity-50 ${(() => { let active = false; proposalSessions.forEach(s => { if (s.isActive) active = true; }); return active ? 'bg-gray-400 text-white' : 'bg-green-500 hover:bg-green-600 text-white'; })()}`}
                            >
                                🤝 合流する
                            </button>
                        )}

                        {(!buttonUsage.dismissUsed) && (
                            <button
                                onClick={async () => {
                                    const newMap = new Map(proposalSessions);
                                    const activeSessions = Array.from(newMap.entries()).filter(([_, s]) => s.isActive);
                                    if (activeSessions.length === 0) return;
                                    for (const [key, session] of activeSessions) {
                                        const finalElapsedTime = Math.floor((Date.now() - (session.startTime as Date).getTime()) / 1000);
                                        let totalPoints = 0, castPoints = 0, guestPoints = 0, pendingAmount = 0;
                                        try {
                                            const parts = key.split('-');
                                            const datePart = parts.length >= 4 ? parts.slice(0, -1).join('-') : parts[0];
                                            let matchingReservation = guestReservations.find((res: any) => {
                                                if (!res.scheduled_at || !chatInfo?.guest?.id) return false;
                                                return res.guest_id === chatInfo.guest.id && dayjs(res.scheduled_at).isSame(dayjs(datePart), 'day');
                                            });
                                            if (!matchingReservation && chatInfo?.reservation_id) {
                                                matchingReservation = guestReservations.find((res: any) => res.id === chatInfo.reservation_id) || await getReservationDetails(chatInfo.reservation_id);
                                            }
                                            if (!matchingReservation && guestReservations.length > 0) {
                                                matchingReservation = guestReservations.find((res: any) => res.guest_id === chatInfo?.guest?.id);
                                                if (matchingReservation) pendingAmount = 1000;
                                            }
                                            if (!matchingReservation) {
                                                if (chatInfo?.reservation_id) throw new Error('No matching reservation');
                                                pendingAmount = 1000;
                                                matchingReservation = { id: 0, guest_id: chatInfo?.guest?.id, scheduled_at: new Date().toISOString(), total_points: pendingAmount } as any;
                                            }
                                            pendingAmount = pendingAmount || extractPendingAmount(matchingReservation);
                                            const castProfile = await getCastProfileById(castId);
                                            if (!castProfile || typeof castProfile.cast.grade_points !== 'number') throw new Error('Invalid cast grade');
                                            const pointsPerMinute = castProfile.cast.grade_points / 30;
                                            totalPoints = Math.max(1, Math.floor(pointsPerMinute * (finalElapsedTime / 60)));
                                            if (totalPoints > pendingAmount) totalPoints = pendingAmount;
                                            castPoints = totalPoints;
                                            guestPoints = Math.max(0, pendingAmount - totalPoints);
                                            if (!chatInfo?.guest?.id) throw new Error('Missing guest');
                                            await completeSession({
                                                chat_id: Number(message.id),
                                                cast_id: castId,
                                                guest_id: chatInfo.guest.id,
                                                session_duration: finalElapsedTime,
                                                total_points: totalPoints,
                                                cast_points: castPoints,
                                                guest_points: guestPoints,
                                                session_key: key
                                            });
                                            newMap.set(key, { ...session, isActive: false, startTime: null, elapsedTime: finalElapsedTime, totalPoints, castPoints, guestPoints });
                                        } catch (e) {
                                            const fallback = Math.max(1, Math.ceil(finalElapsedTime / 60));
                                            totalPoints = fallback; castPoints = fallback; guestPoints = Math.max(0, pendingAmount - fallback);
                                            newMap.set(key, { ...session, isActive: false, startTime: null, elapsedTime: finalElapsedTime, totalPoints, castPoints, guestPoints });
                                        }
                                    }
                                    setProposalSessions(newMap);
                                    setButtonUsage(prev => ({ ...prev, dismissUsed: true }));
                                }}
                                disabled={(() => { let active = false; proposalSessions.forEach(s => { if (s.isActive) active = true; }); return !active; })()}
                                className={`flex-1 px-4 py-2 rounded-lg font-bold text-sm transition-all disabled:opacity-50 ${(() => { let active = false; proposalSessions.forEach(s => { if (s.isActive) active = true; }); return active ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-400 text-white'; })()}`}
                            >
                                🚪 解散
                            </button>
                        )}
                    </div>
                </div>
            </div>
            )}

            <div
                className="overflow-y-auto px-4 pt-4 scrollbar-hidden"
                style={{
                    marginTop: chatInfo?.reservation_id ? '13rem' : '4rem',
                    height: `calc(100vh - 8rem - ${inputBarHeight}px)`,
                    paddingBottom: '4rem'
                }}
            >

                {/* Standalone Timer Section - moved to fixed header area */}
                <div className="hidden">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-white text-lg font-bold">⏱️ セッションタイマー</span>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-green-300 text-xs">アクティブ</span>
                        </div>
                    </div>

                    {/* Timer Display */}
                    <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-4 border border-blue-400 mb-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-white text-sm font-medium">経過時間</span>
                            <div className="text-3xl font-mono font-bold text-green-400">
                                {(() => {
                                    // Check if there's any active session or stopped session with elapsed time
                                    let displayTime = '00:00';
                                    proposalSessions.forEach((session, key) => {
                                        if (session.isActive) {
                                            displayTime = formatElapsedTime(session.elapsedTime);
                                        } else if (!session.isActive && session.elapsedTime > 0) {
                                            displayTime = formatElapsedTime(session.elapsedTime);
                                        }
                                    });
                                    return displayTime;
                                })()}
                            </div>
                        </div>

                        {/* Session Status */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                                {(() => {
                                    let hasActiveSession = false;
                                    proposalSessions.forEach((session) => {
                                        if (session.isActive) hasActiveSession = true;
                                    });

                                    if (hasActiveSession) {
                                        return (
                                            <>
                                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                                <span className="text-green-300 text-sm">セッション進行中</span>
                                            </>
                                        );
                                    }
                                    return (
                                        <>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                            <span className="text-gray-300 text-sm">待機中</span>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Session Results Display */}
                    {(() => {
                        // Find completed session with elapsed time
                        const sessions = Array.from(proposalSessions.entries());
                        const completedSessionEntry = sessions.find(([key, session]) =>
                            !session.isActive && session.elapsedTime > 0
                        );

                        if (completedSessionEntry) {
                            const [key, session] = completedSessionEntry;
                            const hours = Math.floor(session.elapsedTime / 3600);
                            const minutes = Math.floor((session.elapsedTime % 3600) / 60);
                            const seconds = session.elapsedTime % 60;

                            let timeString = '';
                            if (hours > 0) {
                                timeString = `${hours}時間${minutes}分${seconds}秒`;
                            } else {
                                timeString = `${minutes}分${seconds}秒`;
                            }

                            return (
                                <div className="mb-3 p-3 bg-gradient-to-r from-green-800 to-blue-800 rounded-lg border border-green-400">
                                    <div className="text-center">
                                        <div className="text-white text-sm font-bold mb-2">✅ セッション完了</div>
                                        <div className="grid grid-cols-4 gap-2 text-center">
                                            <div className="bg-green-700/50 rounded-lg p-2">
                                                <div className="text-xs text-green-300 mb-1">経過時間</div>
                                                <div className="text-sm font-mono font-bold text-green-300">{timeString}</div>
                                            </div>
                                            <div className="bg-blue-700/50 rounded-lg p-2">
                                                <div className="text-xs text-blue-300 mb-1">総ポイント</div>
                                                <div className="text-sm font-mono font-bold text-blue-300">
                                                    {session.totalPoints?.toLocaleString() || 0}P
                                                </div>
                                            </div>
                                            <div className="bg-purple-700/50 rounded-lg p-2">
                                                <div className="text-xs text-purple-300 mb-1">キャスト獲得</div>
                                                <div className="text-sm font-mono font-bold text-purple-300">
                                                    {session.castPoints?.toLocaleString() || 0}P
                                                </div>
                                            </div>
                                            <div className="bg-yellow-700/50 rounded-lg p-2">
                                                <div className="text-xs text-yellow-300 mb-1">ゲスト返金</div>
                                                <div className="text-sm font-mono font-bold text-yellow-300">
                                                    {session.guestPoints?.toLocaleString() || 0}P
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-2 text-center">
                                            <div className="text-xs text-yellow-300 mb-1">ゲスト支払い済み</div>
                                            <div className="text-sm font-mono font-bold text-yellow-300">
                                                予約時に支払い完了
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    })()}

                    {/* Control Buttons */}
                    <div className="flex space-x-2">
                        {!buttonUsage.meetUpUsed && (
                            <button
                                onClick={() => {
                                    // Create a test proposal and start session
                                    const testProposal = {
                                        type: 'proposal',
                                        date: new Date().toISOString().split('T')[0], // Use just the date part
                                        duration: 60
                                    };
                                    startSimpleSession(testProposal);
                                    // Mark button as used
                                    setButtonUsage(prev => ({ ...prev, meetUpUsed: true }));
                                }}
                                disabled={(() => {
                                    let hasActiveSession = false;
                                    proposalSessions.forEach((session) => {
                                        if (session.isActive) hasActiveSession = true;
                                    });
                                    return hasActiveSession;
                                })()}
                                className={`flex-1 px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${(() => {
                                    let hasActiveSession = false;
                                    proposalSessions.forEach((session) => {
                                        if (session.isActive) hasActiveSession = true;
                                    });
                                    if (!hasActiveSession) {
                                        return 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50';
                                    } else {
                                        return 'bg-gray-400 text-white cursor-not-allowed';
                                    }
                                })()
                                    }`}
                            >
                                🤝 合流する
                            </button>
                        )}


                        {!buttonUsage.dismissUsed && (
                            <button
                                onClick={async () => {
                                    // Mark button as used first
                                    setButtonUsage(prev => ({ ...prev, dismissUsed: true }));

                                    // Stop all active sessions and calculate points
                                    const newMap = new Map(proposalSessions);

                                    // Process all active sessions sequentially
                                    const activeSessions = Array.from(newMap.entries()).filter(([key, session]) => session.isActive);

                                    if (activeSessions.length === 0) {
                                        console.log('No active sessions to resolve');
                                        return;
                                    }

                                    // Process sessions sequentially using for...of loop
                                    for (const [key, session] of activeSessions) {

                                        // Calculate final elapsed time
                                        const finalElapsedTime = Math.floor((Date.now() - session.startTime!.getTime()) / 1000);
                                        console.log('Final elapsed time:', finalElapsedTime, 'seconds');

                                        // Declare variables outside try block for access in catch block
                                        let totalPoints = 0;
                                        let castPoints = 0;
                                        let guestPoints = 0;
                                        let pendingAmount = 0;

                                        try {
                                            // Find the matching reservation to get the pending amount
                                            // The session key format is: ${proposal.date}-${proposal.duration}
                                            // We need to reconstruct the original proposal date from the session
                                            const sessionKeyParts = key.split('-');
                                            const duration = sessionKeyParts[sessionKeyParts.length - 1];

                                            // Handle different session key formats
                                            let datePart: string;
                                            let isTestSession = false;

                                            if (sessionKeyParts.length >= 4) {
                                                // Standard format: date-duration
                                                datePart = sessionKeyParts.slice(0, -1).join('-');
                                            } else if (sessionKeyParts.length === 2) {
                                                // Simple format: date-duration
                                                datePart = sessionKeyParts[0];
                                            } else {
                                                throw new Error(`Invalid session key format: ${key}`);
                                            }

                                            console.log('Session key parsing:', {
                                                originalKey: key,
                                                sessionKeyParts,
                                                reconstructedDate: datePart,
                                                duration,
                                                isTestSession,
                                                chatReservationId: chatInfo?.reservation_id,
                                                guestReservationsCount: guestReservations.length
                                            });

                                            // First try to find matching reservation by comparing the reconstructed date with scheduled_at
                                            let matchingReservation = guestReservations.find((res: any) => {
                                                if (!res.scheduled_at || !chatInfo?.guest?.id) return false;

                                                const proposalDate = dayjs(datePart);
                                                const reservationDate = dayjs(res.scheduled_at);

                                                // Check if dates match and guest IDs match
                                                return res.guest_id === chatInfo.guest.id &&
                                                    reservationDate.isSame(proposalDate, 'day');
                                            });

                                            // If no reservation found by date matching, try to get the reservation from chat info
                                            if (!matchingReservation) {
                                                console.log('No exact date match found, trying to get reservation from chat info...');

                                                // Get reservationId from chat info if available
                                                if (chatInfo?.reservation_id) {
                                                    console.log('Found reservation_id in chat info:', chatInfo.reservation_id);

                                                    // Find reservation by ID in local guestReservations first
                                                    matchingReservation = guestReservations.find((res: any) =>
                                                        res.id === chatInfo.reservation_id
                                                    );

                                                    if (matchingReservation) {
                                                        console.log('Found reservation by ID in local data:', matchingReservation);
                                                    } else {
                                                        console.log('Reservation not found in local data, fetching from API...');
                                                        // Fetch reservation details directly from API
                                                        const apiReservation = await getReservationDetails(chatInfo.reservation_id);
                                                        if (apiReservation) {
                                                            matchingReservation = apiReservation;
                                                            console.log('Fetched reservation from API:', matchingReservation);
                                                        } else {
                                                            console.error('Failed to fetch reservation from API');
                                                        }
                                                    }
                                                }

                                                // If still no reservation found, try fallback matching
                                                if (!matchingReservation && guestReservations.length > 0) {
                                                    console.log('Trying fallback reservation matching...');
                                                    matchingReservation = guestReservations.find((res: any) =>
                                                        res.guest_id === chatInfo?.guest?.id
                                                    );
                                                    if (matchingReservation) {
                                                        isTestSession = true;
                                                        console.log('Using fallback reservation for test session:', matchingReservation);
                                                    }
                                                }
                                            }

                                            if (!matchingReservation) {
                                                console.error('Reservation matching failed:', {
                                                    sessionKey: key,
                                                    reconstructedDate: datePart,
                                                    guestId: chatInfo?.guest?.id,
                                                    chatReservationId: chatInfo?.reservation_id,
                                                    availableReservations: guestReservations.length,
                                                    reservationSource: matchingReservation?.id === chatInfo?.reservation_id ? 'chat_info' : 'guest_reservations'
                                                });

                                                // For test sessions without reservations, try to get amount from chat info
                                                if (isTestSession || guestReservations.length === 0) {
                                                    console.log('No reservation found, checking if this is a real session with chat reservation...');

                                                    // Check if chat has a reservation_id (real session)
                                                    if (chatInfo?.reservation_id) {
                                                        throw new Error(`Chat has reservation_id ${chatInfo.reservation_id} but no matching reservation found. Please check reservation data.`);
                                                    } else {
                                                        // This is truly a test session without any reservation
                                                        console.log('Using default pending amount for test session');
                                                        pendingAmount = 1000; // Default test amount
                                                        matchingReservation = {
                                                            id: 0,
                                                            guest_id: chatInfo?.guest?.id,
                                                            scheduled_at: new Date().toISOString(),
                                                            total_points: pendingAmount
                                                        };
                                                    }
                                                } else {
                                                    throw new Error('No matching reservation found for session');
                                                }
                                            }

                                            // Get the pending amount from the reservation details (使用ポイント field)
                                            pendingAmount = extractPendingAmount(matchingReservation);
                                            console.log('Reservation details:', {
                                                reservation: matchingReservation,
                                                pendingAmount,
                                                guestId: chatInfo?.guest?.id,
                                                proposalDate: datePart,
                                                scheduledAt: matchingReservation.scheduled_at,
                                                isTestSession,
                                                availableReservations: guestReservations.length,
                                                chatReservationId: chatInfo?.reservation_id,
                                                reservationSource: matchingReservation.id === chatInfo?.reservation_id ? 'chat_info' : 'guest_reservations'
                                            });

                                            // Additional validation for pending amount
                                            if (pendingAmount <= 0) {
                                                console.error('Pending amount is 0 or negative:', {
                                                    reservationId: matchingReservation.id,
                                                    totalPoints: matchingReservation.total_points,
                                                    isTestSession
                                                });

                                                if (isTestSession) {
                                                    console.warn('Using fallback amount for test session');
                                                    pendingAmount = 1000; // Fallback amount for test sessions only
                                                } else {
                                                    throw new Error(`Invalid pending amount: ${pendingAmount}. Reservation ID: ${matchingReservation.id}`);
                                                }
                                            }

                                            // Get cast grade points for calculation
                                            const castProfile = await getCastProfileById(castId);
                                            if (!castProfile || typeof castProfile.cast.grade_points !== 'number') {
                                                throw new Error(`Invalid cast grade response: ${JSON.stringify(castProfile)}`);
                                            }

                                            const castGradePoints = castProfile.cast.grade_points;

                                            // Calculate points based on cast grade: grade_points/30 * elapsed_time
                                            const pointsPerMinute = castGradePoints / 30;
                                            const minutesElapsed = finalElapsedTime / 60;
                                            totalPoints = Math.floor(pointsPerMinute * minutesElapsed);

                                            // Ensure minimum points
                                            if (totalPoints < 1) {
                                                totalPoints = 1;
                                            }

                                            console.log('Point calculation:', {
                                                pendingAmount,
                                                castGradePoints,
                                                pointsPerMinute,
                                                minutesElapsed,
                                                finalElapsedTime,
                                                totalPoints
                                            });

                                            // Cast gets the calculated points based on their grade and time
                                            castPoints = totalPoints;

                                            // Guest gets the remaining pending amount minus what cast earned
                                            // This represents the refund for unused time
                                            guestPoints = Math.max(0, pendingAmount - totalPoints);

                                            // Debug: Log the guest points calculation
                                            console.log('Guest points calculation:', {
                                                pendingAmount,
                                                totalPoints,
                                                calculatedGuestPoints: pendingAmount - totalPoints,
                                                finalGuestPoints: guestPoints,
                                                refundPercentage: ((pendingAmount - totalPoints) / pendingAmount * 100).toFixed(2) + '%'
                                            });

                                            // Validate required data
                                            if (!chatInfo?.guest?.id) {
                                                throw new Error('Guest ID not available');
                                            }

                                            // Validate calculated points
                                            if (totalPoints < 1) {
                                                throw new Error(`Invalid total points calculated: ${totalPoints}. Must be at least 1.`);
                                            }

                                            // Validate guest points calculation
                                            if (guestPoints < 0) {
                                                throw new Error(`Invalid guest points calculated: ${guestPoints}. Cannot be negative.`);
                                            }

                                            // Ensure total points don't exceed pending amount
                                            if (totalPoints > pendingAmount) {
                                                console.warn(`Total points (${totalPoints}) exceed pending amount (${pendingAmount}). Adjusting...`);
                                                totalPoints = pendingAmount;
                                                castPoints = pendingAmount;
                                                guestPoints = 0;
                                            }

                                            // Additional validation: ensure points are reasonable
                                            if (totalPoints > 1000000) { // Cap at 1 million points
                                                totalPoints = 1000000;
                                                castPoints = 1000000;
                                                console.warn('Total points capped at 1,000,000 for safety');
                                            }

                                            // Recalculate guest points after any capping to ensure accuracy
                                            guestPoints = Math.max(0, pendingAmount - totalPoints);

                                            console.log('Final point calculations after validation:', {
                                                pendingAmount,
                                                totalPoints,
                                                castPoints,
                                                guestPoints,
                                                refundAmount: pendingAmount - totalPoints,
                                                refundPercentage: ((pendingAmount - totalPoints) / pendingAmount * 100).toFixed(2) + '%'
                                            });

                                            // API call to handle point transactions
                                            console.log('Calling completeSession API with:', {
                                                chat_id: Number(message.id),
                                                cast_id: castId,
                                                guest_id: chatInfo.guest.id,
                                                session_duration: finalElapsedTime,
                                                total_points: totalPoints,
                                                cast_points: castPoints,
                                                guest_points: guestPoints,
                                                session_key: key
                                            });

                                            const result = await completeSession({
                                                chat_id: Number(message.id),
                                                cast_id: castId,
                                                guest_id: chatInfo.guest.id,
                                                session_duration: finalElapsedTime,
                                                total_points: totalPoints,
                                                cast_points: castPoints,
                                                guest_points: guestPoints,
                                                session_key: key
                                            });

                                            // Update local session with calculated points
                                            newMap.set(key, {
                                                ...session,
                                                isActive: false,
                                                startTime: null,
                                                elapsedTime: finalElapsedTime,
                                                totalPoints: totalPoints,
                                                castPoints: castPoints,
                                                guestPoints: guestPoints
                                            });
                                        } catch (error) {
                                            console.error('Error completing session:', error);

                                            // Fallback point calculation if API fails
                                            if (totalPoints < 1) {
                                                const fallbackPoints = Math.max(1, Math.ceil(finalElapsedTime / 60));
                                                totalPoints = fallbackPoints;
                                                castPoints = fallbackPoints;
                                                guestPoints = Math.max(0, pendingAmount - fallbackPoints);
                                            }

                                            // Update local session even if API fails
                                            newMap.set(key, {
                                                ...session,
                                                isActive: false,
                                                startTime: null,
                                                elapsedTime: finalElapsedTime,
                                                totalPoints: totalPoints,
                                                castPoints: castPoints,
                                                guestPoints: guestPoints
                                            });
                                        }
                                    }

                                    console.log('All sessions processed. Updating state...');
                                    setProposalSessions(newMap);
                                    console.log('Updated proposalSessions:', Array.from(newMap.entries()));
                                }}
                                disabled={(() => {
                                    let hasActiveSession = false;
                                    proposalSessions.forEach((session) => {
                                        if (session.isActive) hasActiveSession = true;
                                    });
                                    return !hasActiveSession;
                                })()}
                                className={`flex-1 px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${(() => {
                                    let hasActiveSession = false;
                                    proposalSessions.forEach((session) => {
                                        if (session.isActive) hasActiveSession = true;
                                    });
                                    if (hasActiveSession) {
                                        return 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50';
                                    } else {
                                        return 'bg-gray-400 text-white cursor-not-allowed';
                                    }
                                })()
                                    }`}
                            >
                                🚪 解散
                            </button>
                        )}
                    </div>
                </div>

                {(sortedMessages || []).map((msg: any, idx: number) => {
                    // Date separator
                    const currentDate = msg.created_at ? dayjs(msg.created_at).format('YYYY-MM-DD') : '';
                    const prev = (sortedMessages || [])[idx - 1];
                    const prevDate = prev && prev.created_at ? dayjs(prev.created_at).format('YYYY-MM-DD') : '';
                    let proposal: Proposal | null = null;
                    try {
                        const parsed = typeof msg.message === 'string' ? JSON.parse(msg.message) : null;
                        if (parsed && parsed.type === 'proposal') proposal = parsed;
                    } catch (e) { }
                    if (proposal) {
                        // Create a non-null proposal reference for use in the JSX
                        const currentProposal = { ...proposal, type: proposal.type || 'proposal' };

                        // Only rely on explicit local acceptance to avoid false positives
                        const proposalKey = makeProposalKey(currentProposal.date, currentProposal.duration);
                        const isAccepted = acceptedProposals.has(proposalKey);
                        const isDenied = deniedProposalMsgIds.has(Number(msg.id));
                        
                        // Check if proposal has been clicked by cast member
                        const isClicked = clickedProposals.has(proposalKey);
                        
                        // Check if this proposal was sent by the current cast member
                        const isSentByCast = castId && String(msg.sender_cast_id) === String(castId);
                        
                        // Auto-mark accepted proposals as clicked to prevent re-clicking after refresh
                        if (isAccepted && !isClicked) {
                            setClickedProposals(prev => {
                                const newSet = new Set(prev);
                                newSet.add(proposalKey);
                                return newSet;
                            });
                        }

                        return (
                            <React.Fragment key={msg.id || `p-${idx}`}>
                                {(idx === 0 || currentDate !== prevDate) && (
                                    <div className="flex justify-center my-2">
                                        <span className="text-xs text-gray-300 bg-black/20 px-3 py-1 rounded-full">
                                            {/* {msg.created_at ? dayjs(msg.created_at).format('YYYY年M月D日 ddd') : ''} */}
                                            {formatTime(msg.created_at)}
                                        </span>
                                    </div>
                                )}
                                <div className={`${isSentByCast ? 'flex justify-end' : 'flex justify-start'} mb-4`}>
                                    <div
                                        className={`${isClicked ? 'bg-blue-600 shadow-lg shadow-blue-500/30' : 'bg-orange-500'} text-white rounded-lg px-4 py-3 max-w-[85%] md:max-w-[70%] text-sm shadow-md relative transition-all duration-300 `}
                                        onClick={() => {
                                            // Non-clickable for cast-sent proposals; guest can open modal
                                            if (isSentByCast) return;
                                            setSelectedProposal(currentProposal);
                                            setSelectedProposalMsgId(Number(msg.id));
                                            setShowProposalModal(true);
                                        }}
                                        style={isSentByCast ? { cursor: 'default' } : { cursor: 'pointer' }}
                                    >
                                        {/* Do not show clicked indicator on proposal tap */}
                                        <div>日程：{currentProposal.date ? new Date(currentProposal.date).toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}～</div>
                                        <div>人数：{currentProposal.people?.replace(/名$/, '')}人</div>
                                        <div>時間：{currentProposal.duration}</div>
                                        <div>消費ポイント：{currentProposal.totalPoints?.toLocaleString()}P</div>
                                        <div>（延長：{currentProposal.extensionPoints?.toLocaleString()}P / 15分）</div>
                                        {isAccepted && (
                                            <span className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">承認済み</span>
                                        )}
                                        {!isAccepted && isDenied && (
                                            <span className="absolute top-2 right-2 bg-gray-600 text-white text-xs px-2 py-1 rounded">却下</span>
                                        )}
                                        {/* Hide clicked badge; only show accepted status */}
                                    </div>



                                    {/* Session Management Controls for Accepted Proposals */}
                                    {/* {isAccepted && (
                                        <div className="mt-3 w-full max-w-[100%]">
                                            {(() => {
                                                const proposalKey = makeProposalKey(currentProposal.date, currentProposal.duration);
                                                const session = proposalSessions.get(proposalKey);
                                                if (session && !session.isActive && session.elapsedTime > 0) {
                                                    return (
                                                        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-4 border border-gray-600 mb-3">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <span className="text-white text-sm font-medium">セッション完了</span>
                                                                <div className="flex items-center space-x-2">
                                                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                                                    <span className="text-green-300 text-xs">完了</span>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-3 gap-4 text-center mb-3">
                                                                <div className="bg-gray-700/50 rounded-lg p-2">
                                                                    <div className="text-xs text-gray-300 mb-1">総時間</div>
                                                                    <div className="text-lg font-mono font-bold text-green-300">
                                                                        {formatElapsedTime(session.elapsedTime)}
                                                                    </div>
                                                                </div>
                                                                <div className="bg-gray-700/50 rounded-lg p-2">
                                                                    <div className="text-xs text-gray-300 mb-1">予定時間</div>
                                                                    <div className="text-lg font-mono font-bold text-blue-300">
                                                                        {currentProposal.duration}分
                                                                    </div>
                                                                </div>
                                                                <div className="bg-gray-700/50 rounded-lg p-2">
                                                                    <div className="text-xs text-gray-300 mb-1">ゲスト返金</div>
                                                                    <div className="text-lg font-mono font-bold text-yellow-300">
                                                                        {session.guestPoints?.toLocaleString() || 0}P
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="text-center">
                                                                <span className="text-gray-300 text-sm">
                                                                    セッションが正常に完了しました
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>
                                    )} */}
                                </div>
                            </React.Fragment>
                        );
                    }

                    // Handle matching confirmation system message
                    // if (msg.isSystemMessage) {
                    //     return (
                    //         <React.Fragment key={msg.id || `matching-${idx}`}>
                    //             {(idx === 0 || currentDate !== prevDate) && (
                    //                 <div className="flex justify-center my-2">
                    //                     <span className="text-xs text-gray-300 bg-black/20 px-3 py-1 rounded-full">
                    //                         {formatTime(msg.created_at)}
                    //                     </span>
                    //                 </div>
                    //             )}
                    //             <div className="flex justify-center mb-4">
                    //                 <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg px-6 py-4 text-center max-w-[90%] shadow-lg border border-green-400">
                    //                     <div className="flex items-center justify-center mb-2">
                    //                         <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse mr-2"></div>
                    //                         <span className="font-semibold text-sm">システムメッセージ</span>
                    //                     </div>
                    //                     <div className="text-sm leading-relaxed">{msg.message}</div>
                    //                 </div>
                    //             </div>
                    //         </React.Fragment>
                    //     );
                    // }
                    const isSentByCast = castId && String(msg.sender_cast_id) === String(castId);
                    const isFromGuest = msg.sender_guest_id && !msg.sender_cast_id;
                    const isSent = isSentByCast && !isFromGuest;
                    const senderAvatar = msg?.guest?.avatar || msg?.cast?.avatar;
                    const senderName = msg?.guest?.nickname || msg?.cast?.nickname || 'ゲスト/キャスト';

                    {
                        // Pre-filter internal markers and guest-only system messages so we don't render empty rows
                        let hide = false;
                        let displayText: string | null = null;
                        try {
                            const parsed = typeof msg.message === 'string' ? JSON.parse(msg.message) : null;
                            if (parsed && (parsed.type === 'proposal_accept' || parsed.type === 'proposal_reject')) {
                                hide = true;
                            } else if (parsed && parsed.type === 'system') {
                                if (parsed.target !== 'cast') {
                                    hide = true;
                                } else {
                                    displayText = parsed.text || parsed.content || '';
                                }
                            }
                        } catch (_) {}
                        if (hide) return null;
                        if (displayText !== null) {
                            msg = { ...msg, message: displayText };
                        }
                    }

                    return (
                        <React.Fragment key={msg.id || idx}>
                            {(idx === 0 || currentDate !== prevDate) && (
                                <div className="flex justify-center my-2">
                                    <span className="text-xs text-gray-300 bg-black/20 px-3 py-1 rounded-full">
                                        {formatTime(msg.created_at)}
                                    </span>
                                </div>
                            )}
                            <div className={isSent ? 'flex justify-end mb-4' : 'flex justify-start mb-4'}>
                                {!isSent && (
                                    <img
                                        src={buildAvatarUrl(senderAvatar)}
                                        alt="avatar"
                                        className="w-8 h-8 rounded-full mr-2 border border-secondary mt-1"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = '/assets/avatar/1.jpg';
                                        }}
                                    />
                                )}
                                <div className="flex flex-col">
                                    {!isSent && (
                                        <div className="text-xs text-gray-400 mb-1 flex items-center">
                                            <span>{senderName}</span>
                                        </div>
                                    )}
                                    {(() => {
                                        try {
                                            const parsed = typeof msg.message === 'string' ? JSON.parse(msg.message) : null;
                                            if (parsed && parsed.type === 'proposal_accept') return null;
                                            if (parsed && parsed.type === 'system' && parsed.target === 'guest') return null;
                                        } catch (_) {}
                                        return (
                                    <div className={`${isSent ? 'w-full bg-secondary text-white rounded-lg px-4 py-2' : 'w-full bg-white text-black rounded-lg px-4 py-2'} ${msg.isOptimistic ? 'opacity-70' : ''}`}>
                                        {/* Gift display */}
                                        {msg.gift_id && msg.gift && (
                                            <div className="flex items-center mb-1">
                                                <span className="text-3xl mr-2">
                                                    {msg.gift.icon}
                                                </span>
                                                <span className="font-bold">{msg.gift.name}</span>
                                                <span className="ml-2 text-xs text-primary font-bold">{msg.gift.points?.toLocaleString()}P</span>
                                                {msg.isOptimistic && (
                                                    <span className="ml-2 text-xs text-yellow-300">送信中...</span>
                                                )}
                                            </div>
                                        )}
                                        {(() => {
                                            if (!msg.image) return null;
                                            if (typeof msg.image !== 'string') return null;
                                            const isAbsolute = msg.image.startsWith('http') || msg.image.startsWith('data:') || msg.image.startsWith('blob:');
                                            const src = isAbsolute ? msg.image : `${IMAGE_BASE_URL}/storage/${msg.image}`;
                                            return (
                                                <img
                                                    src={src}
                                                    alt="sent"
                                                    className="max-w-full max-h-40 md:max-h-80 rounded mb-2 cursor-zoom-in"
                                                    onClick={() => setLightboxUrl(src)}
                                                />
                                            );
                                        })()}
                                        {(() => {
                                            try {
                                                const parsed = typeof msg.message === 'string' ? JSON.parse(msg.message) : null;
                                                if (parsed && parsed.type === 'system' && parsed.target === 'cast') {
                                                    return parsed.text || parsed.content || '';
                                                }
                                            } catch (_) {}
                                            return msg.message;
                                        })()}
                                        {msg.isOptimistic && !msg.gift_id && (
                                            <div className="text-xs text-yellow-300 mt-1">送信中...</div>
                                        )}
                                    </div>
                                        );
                                    })()}
                                    <div className={`text-xs text-gray-400 mt-1 ${isSent ? 'text-right' : 'text-left'}`}>
                                        {formatTime(msg.created_at)}
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>



            {/* Input bar (always fixed at bottom) */}
            <div ref={inputBarRef} className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-md  bg-primary border-t border-secondary flex flex-col px-4 py-2 z-20"
            >
                {/* Image preview */}
                {imagePreview && (
                    <div className="flex items-center mt-2 p-2 bg-gray-800 rounded-lg">
                        <img src={imagePreview} alt="preview" className="h-20 w-20 object-cover rounded border border-gray-300" />
                        <div className="ml-3 flex-1">
                            <div className="text-white text-sm font-medium">画像が選択されました</div>
                            <div className="text-gray-400 text-xs">{attachedFile?.name || 'photo.jpg'}</div>
                        </div>
                        <button
                            type="button"
                            className="ml-2 text-white bg-red-500 hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                            onClick={() => {
                                setAttachedFile(null);
                                setImagePreview(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                                if (fileSelectInputRef.current) fileSelectInputRef.current.value = '';
                            }}
                        >
                            ×
                        </button>
                    </div>
                )}
                <div className="flex items-center w-full relative gap-2 flex-wrap">
                    <span className="text-white cursor-pointer flex-shrink-0" onClick={() => setMessageProposal(true)}>
                        <Calendar size={30} />
                    </span>
                    <input
                        type="text"
                        className="flex-1 min-w-0 px-4 py-2 rounded-full border border-secondary text-sm bg-primary text-white"
                        placeholder="メッセージを入力..."
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={async (e) => {
                            if (e.key === 'Enter' && (newMessage.trim() || attachedFile) && !sendMessageMutation.isPending) {
                                try {
                                    if (!castId) return;

                                    // Store values before clearing
                                    const messageText = newMessage.trim();
                                    const imageFile = attachedFile;

                                    // Clear input immediately for optimistic UI
                                    setNewMessage('');
                                    setAttachedFile(null);
                                    setImagePreview(null);

                                    const payload: any = {
                                        chat_id: Number(message.id),
                                        sender_cast_id: castId,
                                    };
                                    if (messageText) payload.message = messageText;
                                    if (imageFile) payload.image = imageFile;

                                    await sendMessageMutation.mutateAsync(payload);
                                } catch (error) {
                                    console.error('Failed to send message:', error);
                                }
                            }
                        }}
                    />

                    <span className="text-white cursor-pointer flex-shrink-0" onClick={handleImageButtonClick}>
                        <Image size={30} />
                    </span>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleImageChange}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileSelectInputRef}
                        style={{ display: 'none' }}
                        onChange={handleImageChange}
                    />
                    
                    <button
                        onClick={async () => {
                            if ((newMessage.trim() || attachedFile) && !sendMessageMutation.isPending) {
                                try {
                                    if (!castId) return;

                                    // Store values before clearing
                                    const messageText = newMessage.trim();
                                    const imageFile = attachedFile;

                                    // Clear input immediately for optimistic UI
                                    setNewMessage('');
                                    setAttachedFile(null);
                                    setImagePreview(null);

                                    const payload: any = {
                                        chat_id: Number(message.id),
                                        sender_cast_id: castId,
                                    };
                                    if (messageText) payload.message = messageText;
                                    if (imageFile) payload.image = imageFile;

                                    await sendMessageMutation.mutateAsync(payload);
                                } catch (error) {
                                    console.error('Failed to send message:', error);
                                }
                            }
                        }}
                        disabled={(!newMessage.trim() && !attachedFile) || sendMessageMutation.isPending}
                        className={`flex-shrink-0 px-6 py-2 rounded-full text-sm font-medium disabled:opacity-50 transition-colors ${(newMessage.trim() || attachedFile) && !sendMessageMutation.isPending
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-blue-500 text-gray-300 cursor-not-allowed'
                            }`}
                    >
                        {sendMessageMutation.isPending ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                            </div>
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </button>
                    {/* Popover absolutely inside input bar */}
                    {showFile && (
                        <div
                            ref={popoverRef}
                            className="absolute bottom-full mb-2 right-0 w-80 bg-primary rounded-xl shadow-lg border border-secondary z-50 animate-fade-in"
                        >
                            <button
                                className="flex items-center justify-between w-full px-4 py-3 pt-6 hover:bg-secondary text-white text-base border-b border-secondary"
                                onClick={() => {
                                    setShowFile(false);
                                    fileInputRef.current?.click();
                                }}
                            >
                                <span>写真ライブラリ</span>
                                <Image />
                            </button>
                            <button
                                className="flex items-center justify-between w-full px-4 py-3 hover:bg-secondary text-white text-base border-b border-secondary"
                                onClick={handleOpenCamera}
                            >
                                <span>写真またはビデオを撮る</span>
                                <Camera />
                            </button>
                            <button
                                className="flex items-center justify-between w-full px-4 py-3 hover:bg-secondary text-white text-base"
                                onClick={() => {
                                    setShowFile(false);
                                    fileSelectInputRef.current?.click();
                                }}
                            >
                                <span>ファイルを選択</span>
                                <FolderClosed />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Camera Modal */}
            {showCamera && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50">
                    <div className="bg-primary p-6 rounded-lg flex flex-col items-center max-w-sm w-full mx-4">
                        <h3 className="text-white text-lg font-bold mb-4">カメラ</h3>
                        <div className="relative">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-64 h-64 rounded-md bg-black object-cover"
                            />
                            {cameraError && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 rounded-md">
                                    <div className="text-red-400 text-center p-4">
                                        <div className="text-sm mb-2">カメラエラー</div>
                                        <div className="text-xs">{cameraError}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                        {cameraError && (
                            <div className="text-red-400 mt-2 text-center text-sm">{cameraError}</div>
                        )}
                        <div className="flex mt-4 space-x-4">
                            <button
                                onClick={handleTakePhoto}
                                className="bg-secondary text-white px-6 py-2 rounded-md font-bold disabled:opacity-50"
                                disabled={!!cameraError}
                            >
                                撮影
                            </button>
                            <button
                                onClick={handleCloseCamera}
                                className="bg-gray-400 text-white px-6 py-2 rounded-md font-bold"
                            >
                                キャンセル
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Image Lightbox */}
            {lightboxUrl && (
                <div
                    className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
                    onClick={() => setLightboxUrl(null)}
                >
                    <img src={lightboxUrl} alt="preview" className="max-w-[90vw] max-h-[90vh] rounded shadow-lg" />
                </div>
            )}

            {/* Proposal Modal */}
            {showProposalModal && selectedProposal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center min-w-[320px] max-w-[90vw]">
                        <h2 className="font-bold text-lg mb-4 text-black">予約提案の確認</h2>
                        <div className="mb-4 text-black">
                            <div>日程：{selectedProposal.date ? new Date(selectedProposal.date).toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '未設定'}～</div>
                            <div>人数：{selectedProposal.people?.replace(/名$/, '') || '未設定'}人</div>
                            <div>時間：{selectedProposal.duration || '未設定'}</div>
                            <div>消費ポイント：{selectedProposal.totalPoints?.toLocaleString() || '0'}P</div>
                            <div>（延長：{selectedProposal.extensionPoints?.toLocaleString() || '0'}P / 15分）</div>
                        </div>
                        {sessionError && <div className="text-red-500 mb-2">{sessionError}</div>}
                        <div className="flex gap-4 w-full flex-col sm:flex-row">
                            <button
                                className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded font-bold disabled:opacity-50"
                                disabled={sessionLoading}
                                onClick={async () => {
                                    if (!selectedProposal || !chatInfo?.guest?.id || !selectedProposal.date) {
                                        console.error('Missing required data for proposal acceptance');
                                        console.log('Debug info:', { selectedProposal, chatInfo, castId });
                                        return;
                                    }

                                    try {
                                        // Prepare proposal data for acceptance
                                        const duration = parseInt(selectedProposal.duration?.toString() || '0', 10);
                                        if (isNaN(duration) || duration <= 0) {
                                            console.error('Invalid duration for proposal acceptance');
                                            return;
                                        }

                                        const proposalData = {
                                            guest_id: chatInfo.guest.id,
                                            cast_id: castId,
                                            date: selectedProposal.date,
                                            duration: duration,
                                            reservation_id: selectedProposal.reservationId
                                        };

                                        console.log('Sending proposal data:', proposalData);
                                        console.log('chatInfo:', chatInfo);
                                        console.log('selectedProposal:', selectedProposal);

                                        // Accept the proposal
                                        await acceptProposal(proposalData);

                                        // Add to local accepted state for immediate UI feedback
                                        const proposalKey = makeProposalKey(selectedProposal.date, duration);
                                        console.log('Adding proposal to accepted set:', proposalKey);
                                        
                                        setAcceptedProposals(prev => {
                                            const newSet = new Set(Array.from(prev));
                                            newSet.add(proposalKey);
                                            console.log('Updated accepted proposals:', Array.from(newSet));
                                            return newSet;
                                        });
                                        
                                        // Also mark as clicked to prevent re-clicking after refresh
                                        setClickedProposals(prev => {
                                            const newSet = new Set(prev);
                                            newSet.add(proposalKey);
                                            console.log('Updated clicked proposals:', Array.from(newSet));
                                            return newSet;
                                        });

                                        // Persist acceptance marker and send role-targeted auto messages
                                        try {
                                            if (selectedProposalMsgId) {
                                                await sendMessageMutation.mutateAsync({
                                                    chat_id: Number(message.id),
                                                    sender_cast_id: castId,
                                                    message: JSON.stringify({
                                                        type: 'proposal_accept',
                                                        proposalMsgId: selectedProposalMsgId,
                                                        proposalKey: proposalKey
                                                    })
                                                });
                                            }
                                            // Guest-facing auto message
                                            await sendMessageMutation.mutateAsync({
                                                chat_id: Number(message.id),
                                                sender_cast_id: castId,
                                                message: JSON.stringify({
                                                    type: 'system',
                                                    target: 'guest',
                                                    text: '合流の仮予約が確定しました。合流後にキャストがタイマーを押下し、合流スタートとなります。そこからは自動課金となりますので、解散をご希望になる場合はキャスト側に解散の旨、お伝えください。'
                                                })
                                            });
                                            // Cast-facing auto message
                                            await sendMessageMutation.mutateAsync({
                                                chat_id: Number(message.id),
                                                sender_cast_id: castId,
                                                message: JSON.stringify({
                                                    type: 'system',
                                                    target: 'cast',
                                                    text: '合流の仮予約が確定しました。合流直前にタイマーの押下を必ず行ってください。推し忘れが起きた場合、売上対象にならない可能性がありますので、ご注意ください。'
                                                })
                                            });
                                        } catch (e) {
                                            console.error('Failed to send acceptance system messages:', e);
                                        }

                                        // Close modal and reset state
                                        setShowProposalModal(false);
                                        setSelectedProposal(null);
                                        setSelectedProposalMsgId(null);
                                    } catch (e: any) {
                                        console.error('Error accepting proposal:', e);
                                    }
                                }}
                            >承認</button>
                            <button
                                className="w-full sm:w-auto px-4 py-2 bg-gray-400 text-white rounded font-bold"
                                onClick={async () => {
                                    try {
                                        // Send rejection notice to guest only and persist marker
                                        await sendMessageMutation.mutateAsync({
                                            chat_id: Number(message.id),
                                            sender_cast_id: castId,
                                            message: JSON.stringify({
                                                type: 'system',
                                                target: 'guest',
                                                text: 'スケジュール提案は却下されました。別日や別時間帯で再調整をお願いします。'
                                            })
                                        });
                                        if (selectedProposalMsgId) {
                                            await sendMessageMutation.mutateAsync({
                                                chat_id: Number(message.id),
                                                sender_cast_id: castId,
                                                message: JSON.stringify({
                                                    type: 'proposal_reject',
                                                    proposalMsgId: selectedProposalMsgId
                                                })
                                            });
                                        }
                                    } catch (e) {
                                        console.error('Failed to send rejection system messages:', e);
                                    } finally {
                                        setShowProposalModal(false);
                                        setSelectedProposal(null);
                                        setSelectedProposalMsgId(null);
                                    }
                                }}
                            >キャンセル</button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

interface MessagePageProps {
    setIsMessageDetailOpen?: (open: boolean) => void;
    onConciergeStateChange?: (isShown: boolean) => void;
}

const MessagePage: React.FC<MessagePageProps> = ({ setIsMessageDetailOpen, onConciergeStateChange }) => {
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [filterNickname, setFilterNickname] = useState('');
    const [filterAge, setFilterAge] = useState('');
    const [showConcierge, setShowConcierge] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const { castId } = useCast() as any;

    // React Query hooks
    const { data: chats = [], isLoading: loading } = useCastChats(castId);

    // Real-time: keep cast chats up-to-date without polling
    useCastChatsRealtime(castId || 0);

    // Real-time group chat updates for cast
    useGroupChatsRealtime(castId || 0, 'cast', (groupChat) => {
        console.log('MessagePage: Real-time group chat created:', groupChat);
        // The hook automatically updates the React Query cache
    });

    useEffect(() => {
        if (setIsMessageDetailOpen) setIsMessageDetailOpen(!!selectedMessage);
    }, [selectedMessage, setIsMessageDetailOpen]);

    // Listen for external request to open a specific chat by ID
    useEffect(() => {
        const handler = (e: any) => {
            const chatId = e?.detail?.chatId;
            if (!chatId) return;
            const target = (chats || []).find((c: any) => c.id === chatId);
            if (target) {
                const mapped: Message = {
                    id: target.id,
                    avatar: buildAvatarUrl(target.avatar),
                    name: target.name,
                    lastMessage: target.last_message || '',
                    timestamp: target.updated_at ? new Date(target.updated_at) : new Date(),
                    unread: false,
                    guestAge: target.guest_age,
                    is_group_chat: Boolean(target.group_id),
                    group_id: target.group_id,
                    group_name: target.group_name,
                } as any;
                setSelectedMessage(mapped);
            }
        };
        window.addEventListener('open-cast-chat', handler as any);
        return () => window.removeEventListener('open-cast-chat', handler as any);
    }, [castId, chats]);

    // Notify parent when concierge state changes
    useEffect(() => {
        onConciergeStateChange?.(showConcierge);
    }, [showConcierge, onConciergeStateChange]);

    // Map chat data to Message interface
    const messages = (chats || []).map((chat: any) => ({
        id: chat.id,
        avatar: buildAvatarUrl(chat.avatar),
        name: chat.guest_nickname || `ゲスト ${chat.guest_id}`,
        lastMessage: chat.last_message || '',
        timestamp: chat.updated_at ? new Date(chat.updated_at) : new Date(),
        unread: !!chat.unread,
        guestAge: chat.guest_age || '', // Backend returns 'guest_age' but it contains birth year
        is_group_chat: !!chat.is_group_chat,
        group_id: chat.group_id,
        group_name: chat.group_name,
    }));

    // Filter messages based on nickname and age
    const filteredMessages = messages.filter((message: Message) => {
        const nicknameMatch = !filterNickname ||
            message.name.toLowerCase().includes(filterNickname.toLowerCase());

        // Calculate age from birth year if available
        let guestAge = null;
        if (message.guestAge) {
            const currentYear = new Date().getFullYear();
            guestAge = currentYear - Number(message.guestAge);
        }

        const ageMatch = !filterAge ||
            (guestAge && guestAge.toString().includes(filterAge));

        return nicknameMatch && ageMatch;
    })
    // Sort by last activity (timestamp desc)
    .sort((a: Message, b: Message) => {
        const ta = a?.timestamp ? new Date(a.timestamp).getTime() : 0;
        const tb = b?.timestamp ? new Date(b.timestamp).getTime() : 0;
        return tb - ta;
    });

    if (selectedMessage) {
        // If it's a group chat, show CastGroupChatScreen
        if (selectedMessage.is_group_chat && selectedMessage.group_id) {
            return (
                <CastGroupChatScreen
                    groupId={selectedMessage.group_id}
                    onBack={() => setSelectedMessage(null)}
                />
            );
        }
        // Otherwise show regular MessageDetail
        return <MessageDetail message={selectedMessage} onBack={() => setSelectedMessage(null)} />;
    }
    if (showConcierge) {
        return <CastConciergeDetailPage onBack={() => setShowConcierge(false)} />;
    }

    return (
        <div
            className="max-w-md min-h-screen bg-gradient-to-b from-primary via-primary to-secondary py-28 overflow-y-auto scrollbar-hidden"
        >
            {/* Fixed Header */}
            <div className="fixed top-0 left-0 right-0 max-w-md mx-auto bg-primary z-20 border-b border-secondary">
                <h1 className="text-lg font-bold text-center py-3 text-white">メッセージ</h1>
            </div>

            {/* Filter Bar - Fixed under header */}
            <div className="fixed top-16 left-0 right-0 max-w-md mx-auto bg-primary z-10 border-b border-secondary">
                <div className="flex items-center px-4 py-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="ニックネームで検索..."
                            value={filterNickname}
                            onChange={(e) => setFilterNickname(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-secondary text-white rounded-lg border-none outline-none placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                        />
                        {filterNickname && (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                    {filteredMessages.length}/{messages.length}
                                </span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`ml-2 p-2 rounded-lg transition-colors ${showFilters || filterAge ? 'bg-secondary text-white' : 'bg-secondary/50 text-gray-400'
                            }`}
                        title="フィルター"
                    >
                        <Filter size={20} />
                    </button>
                </div>

                {/* Age Filter - Expandable */}
                {showFilters && (
                    <div className="px-4 pb-2">
                        <div className="flex items-center">
                            <input
                                type="text"
                                placeholder="年齢で検索 (例: 20, 30)"
                                value={filterAge}
                                onChange={(e) => setFilterAge(e.target.value)}
                                className="flex-1 px-3 py-2 bg-secondary text-white rounded-lg border-none outline-none placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                            />
                            {(filterNickname || filterAge) && (
                                <button
                                    onClick={() => {
                                        setFilterNickname('');
                                        setFilterAge('');
                                    }}
                                    className="ml-2 px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                                    title="フィルターをクリア"
                                >
                                    クリア
                                </button>
                            )}
                        </div>
                        {filterAge && (
                            <div className="mt-2 text-xs text-gray-400">
                                年齢フィルター: {filterAge} ({filteredMessages.length}件)
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Content with top margin to account for fixed header and filter bar */}
            <div className="px-4 mt-3">

                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <Spinner size="lg" />
                    </div>
                ) : (
                    <div className="divide-y divide-secondary">
                        <ConciergeChat
                            onClick={() => setShowConcierge(true)}
                        />


                        {filteredMessages.length === 0 ? (
                            <div className="text-center text-gray-400 py-10">
                                {messages.length === 0 ? 'メッセージがありません' : '検索結果がありません'}
                                {(filterNickname || filterAge) && (
                                    <div className="mt-2 text-sm">
                                        フィルターを変更してください
                                    </div>
                                )}
                            </div>
                        ) : (
                            filteredMessages.map((message: Message) => {
                                // Check if this chat has any clicked proposals
                                const hasClickedProposals = (() => {
                                    try {
                                        const clickedProposalsKey = `clicked_proposals_${message.id}`;
                                        const saved = localStorage.getItem(clickedProposalsKey);
                                        if (saved) {
                                            const parsed = JSON.parse(saved);
                                            return parsed.length > 0;
                                        }
                                    } catch (error) {
                                        console.error('Failed to check clicked proposals for chat:', message.id, error);
                                    }
                                    return false;
                                })();

                                return (
                                    <div
                                        key={message.id}
                                        className="flex items-center p-3 cursor-pointer bg-white/10 hover:bg-secondary/10 border border-secondary"
                                        onClick={() => {
                                            setSelectedMessage(message);
                                        }}
                                    >
                                        <img src={message.avatar} alt={message.name} className="w-12 h-12 rounded-full mr-4" />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <div className="flex items-center">
                                                    <span className="font-bold text-white text-base mr-2">
                                                        {message.is_group_chat ? message.group_name || 'Group Chat' : message.name}
                                                    </span>
                                                    {hasClickedProposals && (
                                                        <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full mr-2" title="提案確認済み">
                                                            📋
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-gray-400">
                                                    {dayjs(message.timestamp).tz(userTz).format('YYYY-MM-DD HH:mm')}
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                {message.unread && (
                                                    <span className="ml-2 bg-secondary text-white text-xs font-bold rounded-full px-2 py-0.5">
                                                        NEW
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagePage;
