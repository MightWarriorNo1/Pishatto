import React, { useEffect, useState } from 'react';
import { fetchUserChats, getCastProfileById } from '../../services/api';
import { useUser } from '../../contexts/UserContext';
import ChatScreen from './ChatScreen';
import { MessageSquare } from 'lucide-react';

const API_BASE_URL=process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const HistorySection: React.FC = () => {
  const { user } = useUser();
  const [chats, setChats] = useState<any[]>([]);
  const [castProfiles, setCastProfiles] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [chatScreen, setChatScreen]=useState(false);

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchUserChats('guest', user.id).then(async (chats) => {
        setChats(chats || []);
        // Fetch all cast profiles in parallel
        const profiles: any = {};
        await Promise.all(
          (chats || []).map(async (chat: any) => {
            if (chat.cast_id) {
              const data = await getCastProfileById(chat.cast_id);
              profiles[chat.cast_id] = data.cast || data;
            }
          })
        );
        setCastProfiles(profiles);
        setLoading(false);
      });
    }
  }, [user]);

  if(chatScreen){
    return <ChatScreen chatId={chats[0].id} onBack={() => setChatScreen(false)} />;
  }
  return (
    <div className="space-y-4 p-4">
      {loading ? (
        <div className="text-white">ローディング...</div>
      ) : chats.length === 0 ? (
        <div className="text-white">履歴がありません</div>
      ) : (
        <>
          {chats.map((chat) => {
            const cast = castProfiles[chat.cast_id];
            if (!cast) return null;
            return (
              <div key={chat.id} className="bg-primary rounded-lg shadow p-4 border border-secondary">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 flex-shrink-0">
                    <img
                      src={cast.avatar ? `${API_BASE_URL}/${cast.avatar}` : '/assets/avatar/female.png'}
                      alt={cast.nickname || ''}
                      className="w-full h-full object-cover rounded border border-secondary"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mt-1 space-x-2">
                      <span className="font-medium text-white">👤 {cast.nickname || ''}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-white">{cast.profile_text || ''}</span>
                    </div>
                    <button
                      className="w-full mt-3 flex items-center justify-center space-x-2 bg-secondary text-white py-2 rounded-lg"
                      onClick={() => setChatScreen(true)}
                    >
            
                      <span className='flex items-center gap-2'>
                      <MessageSquare />メッセージを送る</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

export default HistorySection; 