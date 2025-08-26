import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { useCast } from '../contexts/CastContext';
import { useGuestChatsRealtime, useCastChatsRealtime, useGroupChatsRealtime } from '../hooks/useRealtime';
import { useGuestChats, useCastChats } from '../hooks/useQueries';
import { queryClient } from '../lib/react-query';
import { queryKeys } from '../lib/react-query';
import echo from '../services/echo';

const RealtimeTestPanel: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useUser();
  const { cast } = useCast();
  
  const userId = user?.id || 0;
  const castId = cast?.id || 0;
  
  // Test real-time hooks
  useGuestChatsRealtime(userId, (chat) => {
    addTestResult(`✅ Guest chat update received: ${chat.id} - ${chat.name || chat.guest_nickname}`);
  });
  
  useCastChatsRealtime(castId, (chat) => {
    addTestResult(`✅ Cast chat update received: ${chat.id} - ${chat.name || chat.guest_nickname}`);
  });
  
  useGroupChatsRealtime(userId, 'guest', (groupChat) => {
    addTestResult(`✅ Guest group chat created: ${groupChat.id} - ${groupChat.name}`);
  });
  
  useGroupChatsRealtime(castId, 'cast', (groupChat) => {
    addTestResult(`✅ Cast group chat created: ${groupChat.id} - ${groupChat.name}`);
  });
  
  // React Query data
  const { data: guestChats = [] } = useGuestChats(userId);
  const { data: castChats = [] } = useCastChats(castId);
  
  const addTestResult = (result: string) => {
    setTestResults(prev => [`[${new Date().toLocaleTimeString()}] ${result}`, ...prev.slice(0, 19)]);
  };
  
  const testEchoConnection = () => {
    if (echo.connector && 'pusher' in echo.connector) {
      const pusherConnector = echo.connector as any;
      const state = pusherConnector.pusher?.connection?.state;
      addTestResult(`🔍 Echo connection state: ${state}`);
      return state === 'connected';
    }
    addTestResult('❌ Echo connection not available');
    return false;
  };
  
  const testChatCreation = async () => {
    try {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
      const fullUrl = `${apiUrl}/chats/create`;
      
      addTestResult(`🔗 Testing chat creation at: ${fullUrl}`);
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          cast_id: castId || 1,
          guest_id: userId || 1,
        }),
      });
      
      const result = await response.json();
      if (result.created) {
        addTestResult(`✅ Chat created successfully: ${result.chat.id}`);
      } else {
        addTestResult(`ℹ️ Chat already exists: ${result.chat.id}`);
      }
    } catch (error) {
      addTestResult(`❌ Failed to create chat: ${error}`);
    }
  };
  
  const testGroupChatCreation = async () => {
    try {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
      const fullUrl = `${apiUrl}/chats/create-group`;
      
      addTestResult(`🔗 Testing group chat creation at: ${fullUrl}`);
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: `Test Group ${Date.now()}`,
          guest_id: userId || 1,
          cast_ids: [castId || 1],
        }),
      });
      
      const result = await response.json();
      if (response.ok) {
        addTestResult(`✅ Group chat created successfully: ${result.chat_group.id}`);
      } else {
        addTestResult(`❌ Failed to create group chat: ${result.message}`);
      }
    } catch (error) {
      addTestResult(`❌ Failed to create group chat: ${error}`);
    }
  };
  
  const clearCache = () => {
    queryClient.clear();
    addTestResult('🧹 React Query cache cleared');
  };
  
  const checkCacheData = () => {
    const guestChatsData = queryClient.getQueryData(queryKeys.guest.chats(userId));
    const castChatsData = queryClient.getQueryData(queryKeys.cast.chats(castId));
    
    addTestResult(`📊 Guest chats in cache: ${Array.isArray(guestChatsData) ? guestChatsData.length : 'N/A'}`);
    addTestResult(`📊 Cast chats in cache: ${Array.isArray(castChatsData) ? castChatsData.length : 'N/A'}`);
  };
  
  const testChannelSubscription = () => {
    if (userId) {
      const guestChannel = echo.channel(`guest.${userId}`);
      addTestResult(`🔌 Guest channel subscription: ${guestChannel ? 'Available' : 'Not available'}`);
    }
    
    if (castId) {
      const castChannel = echo.channel(`cast.${castId}`);
      addTestResult(`🔌 Cast channel subscription: ${castChannel ? 'Available' : 'Not available'}`);
    }
  };
  
  const checkEnvironmentVariables = () => {
    addTestResult(`🌍 REACT_APP_API_URL: ${process.env.REACT_APP_API_URL || 'Not set'}`);
    addTestResult(`🌍 REACT_APP_REVERB_HOST: ${process.env.REACT_APP_REVERB_HOST || 'Not set'}`);
    addTestResult(`🌍 REACT_APP_REVERB_PORT: ${process.env.REACT_APP_REVERB_PORT || 'Not set'}`);
    addTestResult(`🌍 REACT_APP_REVERB_SCHEME: ${process.env.REACT_APP_REVERB_SCHEME || 'Not set'}`);
    addTestResult(`🌍 REACT_APP_REVERB_CLUSTER: ${process.env.REACT_APP_REVERB_CLUSTER || 'Not set'}`);
    
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
    addTestResult(`🔗 Constructed API base URL: ${apiUrl}`);
  };
  
  const testApiHealth = async () => {
    try {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
      const healthUrl = `${apiUrl}/chats`;
      
      addTestResult(`🏥 Testing API health at: ${healthUrl}`);
      
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        addTestResult(`✅ API is accessible (Status: ${response.status})`);
      } else {
        addTestResult(`⚠️ API responded with status: ${response.status}`);
      }
    } catch (error) {
      addTestResult(`❌ API health check failed: ${error}`);
    }
  };
  
  const testRealtimeCacheUpdates = async () => {
    addTestResult('🧪 Testing real-time cache updates...');
    
    // Check initial cache state
    const initialGuestChats = queryClient.getQueryData(queryKeys.guest.chats(userId));
    const initialCastChats = queryClient.getQueryData(queryKeys.cast.chats(castId));
    
    addTestResult(`📊 Initial cache - Guest: ${Array.isArray(initialGuestChats) ? initialGuestChats.length : 'N/A'}, Cast: ${Array.isArray(initialCastChats) ? initialCastChats.length : 'N/A'}`);
    
    // Create a test chat
    try {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
      const fullUrl = `${apiUrl}/chats/create`;
      
      addTestResult(`🔗 Creating test chat for cache update test...`);
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          cast_id: castId || 1,
          guest_id: userId || 1,
        }),
      });
      
      const result = await response.json();
      
      if (result.created) {
        addTestResult(`✅ Test chat created: ${result.chat.id}`);
        
        // Wait a moment for real-time events to process
        setTimeout(() => {
          // Check cache after real-time update
          const updatedGuestChats = queryClient.getQueryData(queryKeys.guest.chats(userId));
          const updatedCastChats = queryClient.getQueryData(queryKeys.cast.chats(castId));
          
          addTestResult(`📊 Cache after real-time update - Guest: ${Array.isArray(updatedGuestChats) ? updatedGuestChats.length : 'N/A'}, Cast: ${Array.isArray(updatedCastChats) ? updatedCastChats.length : 'N/A'}`);
          
          // Verify cache was updated
          if (Array.isArray(updatedGuestChats) && updatedGuestChats.length > (Array.isArray(initialGuestChats) ? initialGuestChats.length : 0)) {
            addTestResult(`✅ Guest cache updated successfully via real-time`);
          } else {
            addTestResult(`❌ Guest cache not updated via real-time`);
          }
          
          if (Array.isArray(updatedCastChats) && updatedCastChats.length > (Array.isArray(initialCastChats) ? initialCastChats.length : 0)) {
            addTestResult(`✅ Cast cache updated successfully via real-time`);
          } else {
            addTestResult(`❌ Cast cache not updated via real-time`);
          }
        }, 1000);
        
      } else {
        addTestResult(`ℹ️ Test chat already exists: ${result.chat.id}`);
      }
    } catch (error) {
      addTestResult(`❌ Failed to create test chat: ${error}`);
    }
  };
  
  const testRealtimeDataRefetch = async () => {
    addTestResult('🔄 Testing real-time data refetching...');
    
    // Check initial cache state
    const initialGuestChats = queryClient.getQueryData(queryKeys.guest.chats(userId));
    const initialCastChats = queryClient.getQueryData(queryKeys.cast.chats(castId));
    
    addTestResult(`📊 Initial cache state - Guest: ${Array.isArray(initialGuestChats) ? initialGuestChats.length : 'N/A'}, Cast: ${Array.isArray(initialCastChats) ? initialCastChats.length : 'N/A'}`);
    
    // Create a test chat to trigger real-time events
    try {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
      const fullUrl = `${apiUrl}/chats/create`;
      
      addTestResult(`🔗 Creating test chat to trigger real-time refetch...`);
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          cast_id: castId || 1,
          guest_id: userId || 1,
        }),
      });
      
      const result = await response.json();
      
      if (result.created) {
        addTestResult(`✅ Test chat created: ${result.chat.id}`);
        
        // Wait for real-time events and refetching to complete
        setTimeout(() => {
          // Check if queries were invalidated and refetched
          const queryCache = queryClient.getQueryCache();
          const guestQuery = queryCache.find({ queryKey: queryKeys.guest.chats(userId) });
          const castQuery = queryCache.find({ queryKey: queryKeys.cast.chats(castId) });
          
          addTestResult(`📊 Query state after real-time event:`);
          addTestResult(`   Guest query: ${guestQuery ? `State: ${guestQuery.state.status}, Updated: ${guestQuery.state.dataUpdatedAt}` : 'Not found'}`);
          addTestResult(`   Cast query: ${castQuery ? `State: ${castQuery.state.status}, Updated: ${castQuery.state.dataUpdatedAt}` : 'Not found'}`);
          
          // Check final cache state
          const finalGuestChats = queryClient.getQueryData(queryKeys.guest.chats(userId));
          const finalCastChats = queryClient.getQueryData(queryKeys.cast.chats(castId));
          
          addTestResult(`📊 Final cache state - Guest: ${Array.isArray(finalGuestChats) ? finalGuestChats.length : 'N/A'}, Cast: ${Array.isArray(finalCastChats) ? finalCastChats.length : 'N/A'}`);
          
          // Verify data was refetched
          if (Array.isArray(finalGuestChats) && finalGuestChats.length > (Array.isArray(initialGuestChats) ? initialGuestChats.length : 0)) {
            addTestResult(`✅ Guest data successfully refetched via real-time`);
          } else {
            addTestResult(`❌ Guest data not refetched via real-time`);
          }
          
          if (Array.isArray(finalCastChats) && finalCastChats.length > (Array.isArray(initialCastChats) ? initialCastChats.length : 0)) {
            addTestResult(`✅ Cast data successfully refetched via real-time`);
          } else {
            addTestResult(`❌ Cast data not refetched via real-time`);
          }
        }, 2000); // Wait longer for refetching to complete
        
      } else {
        addTestResult(`ℹ️ Test chat already exists: ${result.chat.id}`);
      }
    } catch (error) {
      addTestResult(`❌ Failed to create test chat: ${error}`);
    }
  };
  
  const debugRealtimeIssues = () => {
    addTestResult('🔍 Debugging real-time issues...');
    
    // Check Echo connection
    if (echo.connector && 'pusher' in echo.connector) {
      const pusherConnector = echo.connector as any;
      const state = pusherConnector.pusher?.connection?.state;
      addTestResult(`🔌 Echo connection state: ${state}`);
      
      if (state === 'connected') {
        addTestResult('✅ Echo is connected');
      } else {
        addTestResult('❌ Echo is not connected - this is the problem!');
      }
    } else {
      addTestResult('❌ Echo connector not available');
    }
    
    // Check channel subscriptions
    if (userId) {
      const guestChannel = echo.channel(`guest.${userId}`);
      addTestResult(`🔌 Guest channel (guest.${userId}): ${guestChannel ? 'Available' : 'Not available'}`);
    }
    
    if (castId) {
      const castChannel = echo.channel(`cast.${castId}`);
      addTestResult(`🔌 Cast channel (cast.${castId}): ${castChannel ? 'Available' : 'Not available'}`);
    }
    
    // Check React Query cache
    const guestChatsData = queryClient.getQueryData(queryKeys.guest.chats(userId));
    const castChatsData = queryClient.getQueryData(queryKeys.cast.chats(castId));
    
    addTestResult(`📊 Cache status:`);
    addTestResult(`   Guest chats: ${guestChatsData ? 'Loaded' : 'Not loaded'} (${Array.isArray(guestChatsData) ? guestChatsData.length : 'N/A'} items)`);
    addTestResult(`   Cast chats: ${castChatsData ? 'Loaded' : 'Not loaded'} (${Array.isArray(castChatsData) ? castChatsData.length : 'N/A'} items)`);
    
    // Check if real-time hooks are active
    addTestResult(`🎯 Real-time hook status:`);
    addTestResult(`   useGuestChatsRealtime: Active for guest ${userId}`);
    addTestResult(`   useCastChatsRealtime: Active for cast ${castId}`);
    addTestResult(`   useGroupChatsRealtime: Active for both guest and cast`);
    
    // Check environment variables
    addTestResult(`🌍 Environment check:`);
    addTestResult(`   REACT_APP_API_URL: ${process.env.REACT_APP_API_URL || 'Not set'}`);
    addTestResult(`   REACT_APP_REVERB_HOST: ${process.env.REACT_APP_REVERB_HOST || 'Not set'}`);
    addTestResult(`   REACT_APP_REVERB_PORT: ${process.env.REACT_APP_REVERB_PORT || 'Not set'}`);
    addTestResult(`   REACT_APP_REVERB_SCHEME: ${process.env.REACT_APP_REVERB_SCHEME || 'Not set'}`);
    addTestResult(`   REACT_APP_REVERB_CLUSTER: ${process.env.REACT_APP_REVERB_CLUSTER || 'Not set'}`);
    
    // Check browser console for errors
    addTestResult(`📱 Browser console check:`);
    addTestResult('   Check browser console for any error messages');
    addTestResult('   Look for "useGuestChatsRealtime: Setting up..." messages');
    addTestResult('   Look for "Successfully subscribed to..." messages');
    
    // Check backend events
    addTestResult(`🔧 Backend check:`);
    addTestResult('   Verify Reverb server is running on port 8080');
    addTestResult('   Check Laravel logs for event broadcasting');
    addTestResult('   Verify ChatCreated, ChatListUpdated events are being sent');
  };
  
  const testWebSocketConnection = () => {
    addTestResult('🔌 Testing WebSocket connection directly...');
    
    // Get Echo configuration
    const REVERB_HOST = process.env.REACT_APP_REVERB_HOST || '127.0.0.1';
    const REVERB_PORT = process.env.REACT_APP_REVERB_PORT || '8080';
    const REVERB_SCHEME = process.env.REACT_APP_REVERB_SCHEME || 'http';
    
    const wsUrl = `${REVERB_SCHEME === 'https' ? 'wss' : 'ws'}://${REVERB_HOST}:${REVERB_PORT}`;
    addTestResult(`🔗 Attempting WebSocket connection to: ${wsUrl}`);
    
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        addTestResult('✅ WebSocket connection successful!');
        addTestResult('🔧 This means the Reverb server is accessible');
        ws.close();
      };
      
      ws.onerror = (error) => {
        addTestResult('❌ WebSocket connection failed!');
        addTestResult('🔧 This means the Reverb server is not accessible');
        addTestResult(`💡 Check if Reverb server is running on port ${REVERB_PORT}`);
        addTestResult(`💡 Check if port ${REVERB_PORT} is open and accessible`);
      };
      
      ws.onclose = () => {
        addTestResult('🔌 WebSocket connection closed');
      };
      
      // Timeout after 5 seconds
      setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          addTestResult('⏰ WebSocket connection timeout');
          addTestResult('🔧 The Reverb server is not responding');
          ws.close();
        }
      }, 5000);
      
    } catch (error) {
      addTestResult(`❌ Failed to create WebSocket: ${error}`);
    }
  };
  
  const monitorUIUpdates = () => {
    addTestResult('👁️ Starting UI update monitoring...');
    
    // Monitor React Query cache changes
    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      const currentGuestChats = queryClient.getQueryData(queryKeys.guest.chats(userId));
      const currentCastChats = queryClient.getQueryData(queryKeys.cast.chats(castId));
      
      addTestResult(`🔄 Cache change detected - Guest: ${Array.isArray(currentGuestChats) ? currentGuestChats.length : 'N/A'}, Cast: ${Array.isArray(currentCastChats) ? currentCastChats.length : 'N/A'}`);
    });
    
    // Store unsubscribe function for cleanup
    (window as any).unsubscribeCacheMonitor = unsubscribe;
    
    addTestResult('👁️ UI update monitoring active - cache changes will be logged');
    addTestResult('💡 Use "Stop UI Monitoring" to stop monitoring');
  };
  
  const stopUIMonitoring = () => {
    if ((window as any).unsubscribeCacheMonitor) {
      (window as any).unsubscribeCacheMonitor();
      (window as any).unsubscribeCacheMonitor = null;
      addTestResult('🛑 UI update monitoring stopped');
    } else {
      addTestResult('ℹ️ No active monitoring to stop');
    }
  };
  
  useEffect(() => {
    addTestResult('🚀 RealtimeTestPanel initialized');
    testEchoConnection();
  }, []);
  
  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg z-50"
        title="Open Real-time Test Panel"
      >
        🔧
      </button>
    );
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-96 max-h-96 overflow-hidden z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Real-time Test Panel</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={testEchoConnection}
          className="w-full bg-blue-500 text-white p-2 rounded text-sm"
        >
          Test Echo Connection
        </button>
        
        <button
          onClick={testChatCreation}
          className="w-full bg-green-500 text-white p-2 rounded text-sm"
        >
          Create Test Chat
        </button>
        
        <button
          onClick={testGroupChatCreation}
          className="w-full bg-purple-500 text-white p-2 rounded text-sm"
        >
          Create Test Group Chat
        </button>
        
        <button
          onClick={clearCache}
          className="w-full bg-red-500 text-white p-2 rounded text-sm"
        >
          Clear Cache
        </button>
        
        <button
          onClick={checkCacheData}
          className="w-full bg-yellow-500 text-white p-2 rounded text-sm"
        >
          Check Cache Data
        </button>
        
        <button
          onClick={testChannelSubscription}
          className="w-full bg-indigo-500 text-white p-2 rounded text-sm"
        >
          Test Channel Subscription
        </button>
        
        <button
          onClick={checkEnvironmentVariables}
          className="w-full bg-gray-500 text-white p-2 rounded text-sm"
        >
          Check Environment Variables
        </button>

        <button
          onClick={testApiHealth}
          className="w-full bg-orange-500 text-white p-2 rounded text-sm"
        >
          Test API Health
        </button>

        <button
          onClick={testRealtimeCacheUpdates}
          className="w-full bg-teal-500 text-white p-2 rounded text-sm"
        >
          Test Real-time Cache Updates
        </button>

        <button
          onClick={testRealtimeDataRefetch}
          className="w-full bg-purple-500 text-white p-2 rounded text-sm"
        >
          Test Real-time Data Refetch
        </button>

        <button
          onClick={debugRealtimeIssues}
          className="w-full bg-red-500 text-white p-2 rounded text-sm"
        >
          Debug Real-time Issues
        </button>

        <button
          onClick={testWebSocketConnection}
          className="w-full bg-cyan-500 text-white p-2 rounded text-sm"
        >
          Test WebSocket Connection
        </button>

        <button
          onClick={monitorUIUpdates}
          className="w-full bg-pink-500 text-white p-2 rounded text-sm"
        >
          Start UI Monitoring
        </button>

        <button
          onClick={stopUIMonitoring}
          className="w-full bg-red-500 text-white p-2 rounded text-sm"
        >
          Stop UI Monitoring
        </button>
      </div>
      
      <div className="text-xs text-gray-600 mb-2">
        User ID: {userId} | Cast ID: {castId}
      </div>
      
      <div className="text-xs text-gray-600 mb-2">
        Guest Chats: {guestChats.length} | Cast Chats: {castChats.length}
      </div>
      
      <div className="bg-gray-100 p-2 rounded text-xs font-mono max-h-32 overflow-y-auto">
        {testResults.length === 0 ? (
          <div className="text-gray-500">No test results yet...</div>
        ) : (
          testResults.map((result, index) => (
            <div key={index} className="mb-1">
              {result}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RealtimeTestPanel;

