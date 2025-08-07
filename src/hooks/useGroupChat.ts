import { useEffect, useState } from 'react';

interface Message {
  id: number;
  message?: string;
  image?: string;
  gift_id?: number;
  sender_guest_id?: number;
  sender_cast_id?: number;
  created_at: string;
  guest?: {
    id: number;
    nickname: string;
    avatar?: string;
  };
  cast?: {
    id: number;
    nickname: string;
    avatar?: string;
  };
  gift?: {
    id: number;
    name: string;
    image?: string;
  };
}

interface UseGroupChatProps {
  groupId: number;
  onNewMessage?: (message: Message) => void;
}

export const useGroupChat = ({ groupId, onNewMessage }: UseGroupChatProps) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize Echo if not already done
    if (typeof window !== 'undefined' && (window as any).Echo) {
      const echo = (window as any).Echo;
      
      // Listen for group messages
      const channel = echo.channel(`group.${groupId}`);
      
      channel.listen('GroupMessageSent', (e: any) => {
        console.log('Received group message:', e);
        if (onNewMessage && e.message) {
          onNewMessage(e.message);
        }
      });

      setIsConnected(true);

      return () => {
        channel.stopListening('GroupMessageSent');
        setIsConnected(false);
      };
    }
  }, [groupId, onNewMessage]);

  return { isConnected };
}; 