import React, { useState, useEffect } from 'react';
import { useCast } from '../contexts/CastContext';
import { useCastChats } from '../hooks/useQueries';
import { useCastChatsRealtime, useGroupChatsRealtime } from '../hooks/useRealtime';

const CastRealtimeTest: React.FC = () => {
  const { castId } = useCast();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Use the cast chats query
  const { data: chats = [], isLoading, error } = useCastChats(castId || 0);

  // Use real-time hooks
  useCastChatsRealtime(castId || 0, (chat) => {
    addLog(`✅ Real-time chat update received: ${chat.id}`);
  });

  useGroupChatsRealtime(castId || 0, 'cast', (groupChat) => {
    addLog(`✅ Real-time group chat created: ${groupChat.id}`);
  });

  const addLog = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    if (castId) {
      addLog(`🔧 Cast ID: ${castId}`);
      addLog(`📊 Total chats loaded: ${chats.length}`);
      setIsConnected(true);
    }
  }, [castId, chats.length]);

  useEffect(() => {
    if (error) {
      addLog(`❌ Error loading chats: ${error}`);
    }
  }, [error]);

  const testCreateChat = async () => {
    if (!castId) {
      addLog('❌ No cast ID available');
      return;
    }

    try {
      addLog('🚀 Testing chat creation...');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chats/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          cast_id: castId,
          guest_id: 1, // Test guest ID
        }),
      });

      if (response.ok) {
        const result = await response.json();
        addLog(`✅ Chat created successfully: ${result.chat?.id || 'N/A'}`);
      } else {
        const errorData = await response.json();
        addLog(`❌ Failed to create chat: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      addLog(`❌ Error creating chat: ${error}`);
    }
  };

  const testCreateGroupChat = async () => {
    if (!castId) {
      addLog('❌ No cast ID available');
      return;
    }

    try {
      addLog('🚀 Testing group chat creation...');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chats/create-group`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          guest_id: 1, // Test guest ID
          cast_ids: [castId, 2], // Test cast IDs
          name: 'Test Group Chat',
        }),
      });

      if (response.ok) {
        const result = await response.json();
        addLog(`✅ Group chat created successfully: ${result.chat_group?.id || 'N/A'}`);
      } else {
        const errorData = await response.json();
        addLog(`❌ Failed to create group chat: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      addLog(`❌ Error creating group chat: ${error}`);
    }
  };

  const clearLogs = () => {
    setTestResults([]);
  };

  return (
    <div className="fixed bottom-4 left-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Cast Real-time Test</h3>
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
      </div>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={testCreateChat}
          disabled={!castId}
          className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Create Chat
        </button>
        
        <button
          onClick={testCreateGroupChat}
          disabled={!castId}
          className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Create Group Chat
        </button>
        
        <button
          onClick={clearLogs}
          className="w-full px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Logs
        </button>
      </div>
      
      <div className="mb-2">
        <p className="text-sm text-gray-600">
          Cast ID: {castId || 'Not available'}
        </p>
        <p className="text-sm text-gray-600">
          Chats loaded: {chats.length}
        </p>
        {isLoading && <p className="text-sm text-blue-600">Loading...</p>}
        {error && <p className="text-sm text-red-600">Error: {error.message}</p>}
      </div>
      
      <div className="max-h-64 overflow-y-auto">
        <h4 className="font-semibold mb-2">Test Logs:</h4>
        <div className="text-xs space-y-1">
          {testResults.length === 0 ? (
            <p className="text-gray-500">No test results yet...</p>
          ) : (
            testResults.map((log, index) => (
              <div key={index} className="p-1 bg-gray-100 rounded">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CastRealtimeTest;

