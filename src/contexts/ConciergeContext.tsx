import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getConciergeMessages, sendConciergeMessage, markConciergeAsRead, ConciergeMessage as ApiConciergeMessage } from '../services/api';

interface ConciergeMessage {
    id: number;
    text: string;
    isConcierge: boolean;
    timestamp: string;
}

interface ConciergeContextType {
    messages: ConciergeMessage[];
    unreadCount: number;
    addMessage: (message: Omit<ConciergeMessage, 'id' | 'timestamp'>) => void;
    markAsRead: () => void;
    getUnreadCount: () => number;
    loadMessages: (userId: number, userType: 'guest' | 'cast') => Promise<void>;
    sendMessage: (userId: number, userType: 'guest' | 'cast', message: string) => Promise<void>;
}

const ConciergeContext = createContext<ConciergeContextType | undefined>(undefined);

export const useConcierge = () => {
    const context = useContext(ConciergeContext);
    if (context === undefined) {
        throw new Error('useConcierge must be used within a ConciergeProvider');
    }
    return context;
};

interface ConciergeProviderProps {
    children: ReactNode;
}

export const ConciergeProvider: React.FC<ConciergeProviderProps> = ({ children }) => {
    const [messages, setMessages] = useState<ConciergeMessage[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [currentUserType, setCurrentUserType] = useState<'guest' | 'cast' | null>(null);

    const loadMessages = async (userId: number, userType: 'guest' | 'cast') => {
        try {
            setCurrentUserId(userId);
            setCurrentUserType(userType);
            
            const response = await getConciergeMessages(userId, userType);
            if (response.success) {
                const apiMessages = response.data.messages as ApiConciergeMessage[];
                const formattedMessages: ConciergeMessage[] = apiMessages.map(msg => ({
                    id: msg.id,
                    text: msg.text,
                    isConcierge: msg.is_concierge,
                    timestamp: msg.timestamp
                }));
                
                setMessages(formattedMessages);
                setUnreadCount(response.data.unread_count);
            }
        } catch (error) {
            console.error('Error loading concierge messages:', error);
        }
    };

    const sendMessage = async (userId: number, userType: 'guest' | 'cast', messageText: string) => {
        try {
            const response = await sendConciergeMessage(userId, userType, messageText);
            if (response.success) {
                // Add user message
                const userMessage: ConciergeMessage = {
                    id: response.data.user_message.id,
                    text: response.data.user_message.text,
                    isConcierge: false,
                    timestamp: response.data.user_message.timestamp
                };
                
                // Add concierge response
                const conciergeMessage: ConciergeMessage = {
                    id: response.data.concierge_message.id,
                    text: response.data.concierge_message.text,
                    isConcierge: true,
                    timestamp: response.data.concierge_message.timestamp
                };
                
                setMessages(prev => [...prev, userMessage, conciergeMessage]);
            }
        } catch (error) {
            console.error('Error sending concierge message:', error);
        }
    };

    const addMessage = (message: Omit<ConciergeMessage, 'id' | 'timestamp'>) => {
        const newMessage: ConciergeMessage = {
            ...message,
            id: messages.length + 1,
            timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
        };
        
        setMessages(prev => [...prev, newMessage]);
        
        // If it's a user message, increment unread count for concierge
        if (!message.isConcierge) {
            setUnreadCount(prev => prev + 1);
        }
    };

    const markAsRead = async () => {
        if (currentUserId && currentUserType) {
            try {
                await markConciergeAsRead(currentUserId, currentUserType);
                setUnreadCount(0);
            } catch (error) {
                console.error('Error marking concierge as read:', error);
            }
        }
    };

    const getUnreadCount = () => {
        return unreadCount;
    };

    const value: ConciergeContextType = {
        messages,
        unreadCount,
        addMessage,
        markAsRead,
        getUnreadCount,
        loadMessages,
        sendMessage
    };

    return (
        <ConciergeContext.Provider value={value}>
            {children}
        </ConciergeContext.Provider>
    );
}; 