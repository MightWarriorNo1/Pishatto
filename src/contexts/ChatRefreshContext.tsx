import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChatRefreshContextType {
  refreshKey: number;
  refreshChats: () => void;
}

const ChatRefreshContext = createContext<ChatRefreshContextType | undefined>(undefined);

export const ChatRefreshProvider = ({ children }: { children: ReactNode }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const refreshChats = () => setRefreshKey(k => k + 1);
  return (
    <ChatRefreshContext.Provider value={{ refreshKey, refreshChats }}>
      {children}
    </ChatRefreshContext.Provider>
  );
};

export const useChatRefresh = () => {
  const ctx = useContext(ChatRefreshContext);
  if (!ctx) throw new Error('useChatRefresh must be used within a ChatRefreshProvider');
  return ctx;
}; 