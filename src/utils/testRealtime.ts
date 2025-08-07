// Test utility for real-time messaging functionality
import echo from '../services/echo';

export const testRealtimeConnection = () => {
  console.log('Testing real-time connection...');
  
  // Test individual chat channel
  const testChatChannel = echo.channel('chat.1');
  testChatChannel.listen('MessageSent', (e: any) => {
    console.log('✅ Individual chat message received:', e.message);
  });
  
  // Test group chat channel
  const testGroupChannel = echo.channel('group.1');
  testGroupChannel.listen('GroupMessageSent', (e: any) => {
    console.log('✅ Group chat message received:', e.message);
  });
  
  // Test connection status
  console.log('✅ WebSocket connection test initialized');
  
  return {
    testChatChannel,
    testGroupChannel,
    disconnect: () => {
      testChatChannel.stopListening('MessageSent');
      testGroupChannel.stopListening('GroupMessageSent');
    }
  };
};

export const testMessageSending = async (groupId: number, message: string) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/chats/group-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        group_id: groupId,
        message: message,
        sender_guest_id: 1, // Test user ID
      }),
    });
    
    if (response.ok) {
      console.log('✅ Test message sent successfully');
      return true;
    } else {
      console.error('❌ Failed to send test message:', response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending test message:', error);
    return false;
  }
};

export const testGroupMessages = async (groupId: number) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/chats/group/${groupId}/messages?user_type=guest&user_id=1`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Group messages retrieved:', data.messages?.length || 0, 'messages');
      return data;
    } else {
      console.error('❌ Failed to retrieve group messages:', response.statusText);
      return null;
    }
  } catch (error) {
    console.error('❌ Error retrieving group messages:', error);
    return null;
  }
};

export const testGroupParticipants = async (groupId: number) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/chats/group/${groupId}/participants`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Group participants retrieved:', data.participants?.length || 0, 'participants');
      return data;
    } else {
      console.error('❌ Failed to retrieve group participants:', response.statusText);
      return null;
    }
  } catch (error) {
    console.error('❌ Error retrieving group participants:', error);
    return null;
  }
};

// Run all tests
export const runRealtimeTests = async () => {
  console.log('🧪 Starting real-time messaging tests...');
  
  // Test connection
  const connectionTest = testRealtimeConnection();
  
  // Wait for connection
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test group messages
  await testGroupMessages(1);
  
  // Test group participants
  await testGroupParticipants(1);
  
  // Test sending a message
  await testMessageSending(1, 'Test message from real-time test utility');
  
  console.log('🧪 Real-time messaging tests completed');
  
  // Cleanup
  setTimeout(() => {
    connectionTest.disconnect();
    console.log('🧹 Test cleanup completed');
  }, 5000);
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testRealtime = {
    testRealtimeConnection,
    testMessageSending,
    testGroupMessages,
    testGroupParticipants,
    runRealtimeTests,
  };
} 