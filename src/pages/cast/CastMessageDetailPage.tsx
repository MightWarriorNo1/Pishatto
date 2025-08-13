import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CastChatScreen from '../../components/cast/dashboard/CastChatScreen';

const CastMessageDetailPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const chatId = Number(id);
    if (!chatId || Number.isNaN(chatId)) return null;
    return (
        <CastChatScreen chatId={chatId} onBack={() => navigate(-1)} />
    );
};

export default CastMessageDetailPage;