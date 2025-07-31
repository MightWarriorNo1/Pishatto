import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface RegisterData {
  email: string;
  password: string;
  nickname: string;
  profilePhoto: File | null;
}

export interface GuestInterest {
  category: string;
  tag: string;
}

export interface GuestRegisterData {
  phone: string;
  verificationCode: string;
  nickname: string;
  location: string;
  favorite_area: string;
  profilePhoto: File | null;
  interests: GuestInterest[];
  age: string;
  shiatsu: string;
}

export interface GuestProfileUpdateData {
  phone: string;
  nickname?: string;
  favorite_area?: string;
  profilePhoto?: File | null;
  birth_year?: number;
  height?: number;
  residence?: string;
  birthplace?: string;
  annual_income?: string;
  education?: string;
  occupation?: string;
  alcohol?: 'never' | 'sometimes' | 'often';
  tobacco?: 'never' | 'sometimes' | 'often';
  siblings?: string;
  cohabitant?: string;
  pressure?: 'weak' | 'medium' | 'strong';
}

export interface GuestProfile {
    id: number;
    phone: string;
    line_id?: string;
    nickname: string;
    age: string;
    shiatsu: string;
    location: string;
    avatar?: string;
    birth_year?: number;
    height?: number;
    residence?: string;
    birthplace?: string;
    annual_income?: string;
    education?: string;
    occupation?: string;
    alcohol?: 'never' | 'sometimes' | 'often';
    tobacco?: 'never' | 'sometimes' | 'often';
    siblings?: string;
    cohabitant?: string;
    pressure?: 'weak' | 'medium' | 'strong';
    favorite_area?: string;
    interests?: GuestInterest[];
    points?: number;
    payment_info?: string;
    identity_verification_completed?: 'pending' | 'success' | 'failed';
    created_at: string;
    updated_at: string;
}

export interface Notification {
    id: number;
    user_id: number;
    user_type: 'guest' | 'cast';
    type: string;
    reservation_id?: number;
    cast_id?: number;
    message: string;
    read: boolean;
    created_at: string;
    updated_at: string;
    cast?: {
        id: number;
        nickname: string;
        avatar?: string;
    };
}

export interface Reservation {
  id?: number;
  guest_id: number;
  time?:string;
  type?: 'free' | 'pishatto';
  scheduled_at: string;
  location?: string;
  duration?: number;
  details?: string;
  created_at?: string;
  started_at?: string;
  ended_at?: string;
  points_earned?: number;
  // Feedback fields
  feedback_text?: string;
  feedback_rating?: number;
  feedback_badge_id?: number;
}

export interface CastProfile {
  id: number;
  phone?: string;
  nickname: string;
  avatar?: string;
  birth_year?: number;
  height?: number;
  residence?: string;
  birthplace?: string;
  profile_text?: string;
  created_at?: string;
  updated_at?: string;
  reservations?: Reservation[];
}

export interface RepeatGuest {
  id: number;
  nickname: string;
  avatar?: string;
  reservations_count: number;
}

export const register = async (data: RegisterData) => {
  const formData = new FormData();
  formData.append('email', data.email);
  formData.append('password', data.password);
  formData.append('nickname', data.nickname);
  if (data.profilePhoto) {
    formData.append('profile_photo', data.profilePhoto);
  }

  const response = await api.post('/register', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    withCredentials: true,
  });
  return response.data;
};

export const guestRegister = async (data: GuestRegisterData) => {
  const formData = new FormData();
  formData.append('phone', data.phone);
  formData.append('verification_code', data.verificationCode);
  formData.append('nickname', data.nickname);
  formData.append('location', data.location);
  if (data.profilePhoto) {
    formData.append('profile_photo', data.profilePhoto);
  }
  if (data.interests.length > 0) {
    formData.append('interests', JSON.stringify(data.interests));
  }
  if (data.age) {
    formData.append('age', data.age);
  }
  if (data.shiatsu) {
    formData.append('shiatsu', data.shiatsu);
  }

  const response = await api.post('/guest/register', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    withCredentials: true,
  });
  return response.data;
};

export const guestLogin = async (phone: string) => {
  const response = await api.post('/guest/login', { phone }, { withCredentials: true });
  return response.data;
};

export const getGuestProfile = async (phone: string): Promise<{ guest: GuestProfile, interests: GuestInterest[] }> => {
  const response = await api.get(`/guest/profile/${phone}`);
  return { guest: response.data.guest, interests: response.data.guest.interests || [] };
};

export const getGuestProfileById = async (id: number) => {
  const response = await api.get(`/guest/profile/id/${id}`);
  console.log("RESPONSE", response.data);
  return response.data.guest;
};

export const guestUpdateProfile = async (data: GuestProfileUpdateData) => {
  const formData = new FormData();
  
  // Always include phone as it's required for identification
  formData.append('phone', data.phone);
  
  // Add other fields if they exist
  if (data.nickname) formData.append('nickname', data.nickname);
  if (data.favorite_area) formData.append('favorite_area', data.favorite_area);
  if (data.profilePhoto) formData.append('profile_photo', data.profilePhoto);
  if (data.birth_year) formData.append('birth_year', data.birth_year.toString());
  if (data.height) formData.append('height', data.height.toString());
  if (data.residence) formData.append('residence', data.residence);
  if (data.birthplace) formData.append('birthplace', data.birthplace);
  if (data.annual_income) formData.append('annual_income', data.annual_income);
  if (data.education) formData.append('education', data.education);
  if (data.occupation) formData.append('occupation', data.occupation);
  if (data.alcohol) formData.append('alcohol', data.alcohol);
  if (data.tobacco) formData.append('tobacco', data.tobacco);
  if (data.siblings) formData.append('siblings', data.siblings);
  if (data.cohabitant) formData.append('cohabitant', data.cohabitant);
  if (data.pressure) formData.append('pressure', data.pressure);
  const response = await api.post('/guest/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const createReservation = async (data: Reservation) => {
  const response = await api.post('/guest/reservation', data);
  return response.data;
};

export const cancelReservation = async (reservationId: number) => {
  const response = await api.post(`/reservations/${reservationId}/cancel`);
  return response.data;
};

export const updateReservation = async (reservationId: number, data: Partial<Reservation>) => {
  const response = await api.put(`/reservations/${reservationId}`, data);
  console.log("UPDATE RESERVATION RESPONSE", response.data);
  return response.data.reservation;
};

export const getCastReservations = async () => {
  const response = await api.get(`/cast/reservations`);
  return response.data.reservations;
};

export const castUpdateProfile = async (data: any) => {
  // expects data to include at least phone or id
  return api.post('/cast/profile', data).then(res => res.data);
};

export const getCastProfile = async (castId: number): Promise<{ cast: CastProfile, reservations: Reservation[] }> => {
  const response = await api.get(`/cast/profile/${castId}`);
  return { cast: response.data.cast, reservations: response.data.reservations };
};

export const getGuestReservations = async (guestId: number) => {
  const response = await api.get(`/guest/reservations/${guestId}`);
  return response.data.reservations;
};

export const getReservationById = async (id: number) => {
  const response = await api.get(`/reservations/${id}`);
  return response.data.reservation;
};

export const castRegister = async (data: { phone: string; nickname?: string; avatar?: string }) => {
  const response = await api.post('/cast/register', data);
  return response.data;
};

export const getAllReservations = async () => {
  const response = await api.get('/reservations/all');
  return response.data.reservations;
};

export const getAllChats = async () => {
  const response = await api.get('/chats/all');
  return response.data.chats;
};

export const getCastChats = async (castId: number) => {
  const response = await api.get(`/chats/cast/${castId}`);
  return response.data.chats;
};

export const getGuestChats = async (guestId: number, userType: string) => {
  const response = await api.get(`/chats/guest/${guestId}`, { params: { user_id: guestId, user_type: userType } });
  return response.data.chats;
};

export const sendMessage = async (data: {
  chat_id: number;
  sender_guest_id?: number;
  sender_cast_id?: number;
  message?: string;
  image?: string | File;
  gift_id?: number;
}) => {
  let response;
  if (data.image && typeof data.image !== 'string') {
    const formData = new FormData();
    formData.append('chat_id', String(data.chat_id));
    if (data.sender_guest_id) formData.append('sender_guest_id', String(data.sender_guest_id));
    if (data.sender_cast_id) formData.append('sender_cast_id', String(data.sender_cast_id));
    if (data.message) formData.append('message', data.message);
    if (data.gift_id) formData.append('gift_id', String(data.gift_id));
    formData.append('image', data.image);
    response = await api.post('/messages', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  } else {
    response = await api.post('/messages', data);
  }
  return response.data.message;
};

export const getChatMessages = async (chatId: number, userId: number, userType: string) => {
  const response = await api.get(`/chats/${chatId}/messages`, { params: { user_id: userId, user_type: userType } });
  return response.data.messages;
};

export const getChatById = async (chatId: number) => {
  const response = await api.get(`/chats/${chatId}`);
  return response.data.chat;
};

export const getRepeatGuests = async (): Promise<RepeatGuest[]> => {
  const response = await api.get('/guests/repeat');
  return response.data.guests;
};

export const castLogin = async (phone: string) => {
  const response = await api.post('/cast/login', { phone }, { withCredentials: true });
  return response.data;
};

export const getCastList = async (params?: { area?: string; sort?: string; search?: string }) => {
  const response = await api.get('/casts', { params });
  return response.data;
};

export const likeCast = async (guest_id: number, cast_id: number) => {
  const response = await api.post('/casts/like', { guest_id, cast_id });
  return response.data;
};

export const recordGuestVisit = async (cast_id: number, guest_id: number) => {
  const response = await api.post('/guests/visit', { cast_id, guest_id });
  return response.data;
};

export const getCastVisitHistory = async (guest_id: number) => {
  const response = await api.get(`/casts/visit-history/${guest_id}`);
  return response.data;
};

export const getFootprints = async (guestId: number) => {
  const response = await api.get(`/casts/visit-history/${guestId}`);
  return response.data;
};

export const getCastProfileWithExtras = async (castId: number) => {
  const response = await api.get(`/cast/profile/${castId}`);
  return response.data;
};

export const getCastProfileById = async (castId: number) => {
  const response = await api.get(`/casts/profile/${castId}`);
  return response.data;
};

export const getCastPointsData = async (castId: number) => {
  const response = await api.get(`/casts/points/${castId}`);
  return response.data;
};

export const getCastPassportData = async (castId: number) => {
  const response = await api.get(`/casts/passport/${castId}`);
  return response.data;
};

export const getNotifications = async (userType: 'guest' | 'cast', userId: number): Promise<Notification[]> => {
  const response = await api.get(`/notifications/${userType}/${userId}`);
  return response.data.notifications;
};

export const markNotificationRead = async (id: number) => {
  const response = await api.post(`/notifications/read/${id}`);
  return response.data;
};

export const markAllNotificationsRead = async (userType: 'guest' | 'cast', userId: number) => {
  const response = await api.post(`/notifications/read-all/${userType}/${userId}`);
  return response.data;
};

export const deleteNotification = async (id: number) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};

export const createChargeDirect = async (
  card: string, 
  amount: number, 
  currency: string = 'jpy', 
  tenant?: string,
  user_id?: number,
  user_type?: 'guest' | 'cast'
) => {
  const payload: any = {
    card,
    amount,
    currency,
  };
  
  if (tenant) payload.tenant = tenant;
  if (user_id) payload.user_id = user_id;
  if (user_type) payload.user_type = user_type;
  
  const response = await api.post('/payments/charge-direct', payload);
  return response.data;
};

export const debugPayJPResponse = async (card: string, amount: number) => {
  const response = await api.post('/payments/debug-response', {
    card,
    amount,
  });
  return response.data;
};

export const purchasePoints = async (user_id: number, user_type: 'guest' | 'cast', amount: number, token?: string, payment_method?: string) => {
  const payload: any = { user_id, user_type, amount };
  if (token && token.trim() !== '') payload.token = token;
  if (payment_method) payload.payment_method = payment_method;
  console.log("payload", payload);
  const response = await api.post('/payments/purchase', payload);
  return response.data;
};

export const getPaymentHistory = async (user_type: 'guest' | 'cast', user_id: number) => {
  const response = await api.get(`/payments/history/${user_type}/${user_id}`);
  if (response.data.success === false) {
    throw new Error(response.data.error || '支払い履歴の取得に失敗しました');
  }
  return response.data.payments;
};

export const getReceipts = async (user_type: 'guest' | 'cast', user_id: number) => {
  const response = await api.get(`/receipts/${user_type}/${user_id}`);
  return response.data.receipts;
};

export const registerPaymentInfo = async (user_id: number, user_type: 'guest' | 'cast', payment_info: string) => {
  const response = await api.post('/payments/info', { user_id, user_type, payment_info });
  return response.data;
};

export const registerCard = async (user_id: number, user_type: 'guest' | 'cast', token: string) => {
  const response = await api.post('/payments/register-card', { user_id, user_type, token });
  return response.data;
};

export const getPaymentInfo = async (user_type: 'guest' | 'cast', user_id: number) => {
  const response = await api.get(`/payments/info/${user_type}/${user_id}`);
  return response.data.payment_info;
};

export const deletePaymentInfo = async (user_type: 'guest' | 'cast', user_id: number, card_id: string) => {
  const response = await api.delete(`/payments/info/${user_type}/${user_id}/${card_id}`);
  return response.data;
};

export const requestPayout = async (cast_id: number, amount: number) => {
  const response = await api.post('/payouts/request', { cast_id, amount });
  return response.data.payout;
};

// PAY.JP related functions (handled through PayJPService)
// These functions are available in the PayJPService class for better organization

export const fetchAllTweets = async () => {
  const response = await api.get('/tweets');
  return response.data.tweets;
};

export const fetchUserTweets = async (userType: 'guest' | 'cast', userId: number) => {
  const response = await api.get(`/tweets/${userType}/${userId}`);
  return response.data.tweets;
};

export const createTweet = async (data: { content: string; guest_id?: number; cast_id?: number; image?: File | null }) => {
  const formData = new FormData();
  formData.append('content', data.content);
  if (data.guest_id) formData.append('guest_id', String(data.guest_id));
  if (data.cast_id) formData.append('cast_id', String(data.cast_id));
  if (data.image) formData.append('image', data.image);
  const response = await api.post('/tweets', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.tweet;
};

export const deleteTweet = async (id: number) => {
  const response = await api.delete(`/tweets/${id}`);
  return response.data.success;
};

export const fetchUserChats = async (userType: 'guest' | 'cast', userId: number) => {
  const response = await api.get(`/chats/${userType}/${userId}`);
  return response.data.chats;
};

export const fetchAllGuestPhones = async (): Promise<string[]> => {
  const response = await api.get('/guests/phones');
  return response.data.phones;
};

export const applyReservation = async (reservation_id: number, cast_id: number) => {
  console.log("applyReservation", reservation_id, cast_id);
  return api.post('/reservation/match', { reservation_id, cast_id });
};

export const startReservation = async (reservation_id: number, cast_id: number) => {
  const response = await api.post('/reservation/start', { reservation_id, cast_id });
  return response.data.reservation;
};

export const stopReservation = async (reservation_id: number, cast_id: number) => {
  const response = await api.post('/reservation/stop', { reservation_id, cast_id });
  return response.data.reservation;
};

export const getPointTransactions = async (userType: 'guest' | 'cast', userId: number) => {
  const response = await api.get(`/point-transactions/${userType}/${userId}`);
  return response.data;
};

export const fetchAllGifts = async () => {
  const response = await api.get('/gifts');
  return response.data.gifts;
};

export const fetchCastReceivedGifts = async (castId: number) => {
  const response = await api.get(`/cast/${castId}/received-gifts`);
  return response.data.gifts;
};

export const uploadCastAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append('avatar', file);
  // Adjust endpoint as needed; here we use /cast/avatar-upload
  const response = await api.post('/cast/avatar-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const uploadGuestAvatar = async (file: File, phone: string) => {
  const formData = new FormData();
  formData.append('avatar', file);
  formData.append('phone', phone);
  const response = await api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteGuestAvatar = async (phone: string) => {
  const response = await api.delete('/users/avatar', {
    data: { phone }
  });
  return response.data;
};

export const deleteCastAvatar = async (castId: number, avatarIndex: number) => {
  const response = await api.delete('/cast/avatar-delete', {
    data: {
      cast_id: castId,
      avatar_index: avatarIndex,
    },
  });
  return response.data;
};

export const likeGuest = async (cast_id: number, guest_id: number) => {
  console.log("likeGuest", cast_id, guest_id);
  const response = await api.post('/guests/like', { cast_id, guest_id });
  return response.data;
};

export const createChat = async (cast_id: number, guest_id: number) => {
  console.log("createChat", cast_id, guest_id);
  const response = await api.post('/chats/create', { cast_id, guest_id });
  return response.data;
};

export const sendCastMessage = async (chat_id: number, cast_id: number, message: string) => {
  const response = await api.post('/messages', {
    chat_id,
    sender_cast_id: cast_id,
    message,
  });
  return response.data;
};

export const sendGuestMessage = async (chat_id: number, guest_id: number, message: string) => {
  const response = await api.post('/messages', {
    chat_id,
    sender_guest_id: guest_id,
    message,
  });
  return response.data;
};

export const getLikeStatus = async (cast_id: number, guest_id: number) => {
  const response = await api.get(`/guests/like-status/${cast_id}/${guest_id}`);
  return response.data;
};

export const fetchRanking = async (params: { userType: string; timePeriod: string; category: string; area: string }) => {
  const response = await api.get('/ranking', { params });
  return response.data;
};

export const updateRanking = async (params: { userType: string; timePeriod: string; category: string; area: string }) => {
  const response = await api.post('/ranking/recalculate', { 
    period: params.timePeriod,
    region: params.area,
    category: params.category
  });
  return response.data;
};

export const likeTweet = async (tweet_id: number, guest_id?: number, cast_id?: number) => {
  const response = await api.post('/tweets/like', { tweet_id, guest_id, cast_id });
  return response.data;
};

export const getTweetLikeCount = async (tweet_id: number) => {
  console.log("GETTING TWEET LIKE COUNT", tweet_id);
  const response = await api.get(`/tweets/${tweet_id}/like-count`);
  console.log("RESPONSE", response.data);
  return response.data.count;
};

export const getTweetLikeStatus = async (tweet_id: number, guest_id?: number, cast_id?: number) => {
  const params: any = {};
  if (guest_id) params.guest_id = guest_id;
  if (cast_id) params.cast_id = cast_id;
  const response = await api.get(`/tweets/${tweet_id}/like-status`, { params });
  return { liked: response.data.liked, count: response.data.count };
};

export const getFavorites = async (guestId: number) => {
  const response = await api.get(`/casts/favorites/${guestId}`);
  return response.data;
};

export const favoriteCast = async (guest_id: number, cast_id: number) => {
  const response = await api.post('/casts/favorite', { guest_id, cast_id });
  return response.data;
};

export const unfavoriteCast = async (guest_id: number, cast_id: number) => {
  const response = await api.post('/casts/unfavorite', { guest_id, cast_id });
  return response.data;
};

// Chat favorites API functions
export const favoriteChat = async (guest_id: number, chat_id: number) => {
  const response = await api.post('/chats/favorite', { guest_id, chat_id });
  return response.data;
};

export const unfavoriteChat = async (guest_id: number, chat_id: number) => {
  const response = await api.post('/chats/unfavorite', { guest_id, chat_id });
  return response.data;
};

export const getFavoriteChats = async (guestId: number) => {
  const response = await api.get(`/chats/favorites/${guestId}`);
  return response.data;
};

export const isChatFavorited = async (chatId: number, guestId: number) => {
  console.log("IS CHAT FAVORITED", chatId, guestId);
  const response = await api.get(`/chats/${chatId}/favorited/${guestId}`);
  console.log("IS CHAT FAVORITED RESPONSE", response.data);
  return response.data;
};

export const fetchAllBadges = async () => {
  const response = await api.get('/badges');
  return response.data.badges;
};

export interface FeedbackData {
  reservation_id: number;
  cast_id: number;
  guest_id: number;
  comment?: string;
  rating?: number;
  badge_id?: number;
}

export const submitFeedback = async (feedbackData: FeedbackData) => {
  const response = await api.post('/feedback', feedbackData);
  return response.data;
};

export const getReservationFeedback = async (reservationId: number) => {
  const response = await api.get(`/feedback/reservation/${reservationId}`);
  return response.data.feedback;
};

export const getCastFeedback = async (castId: number) => {
  const response = await api.get(`/feedback/cast/${castId}`);
  return response.data;
};

export const getGuestFeedback = async (guestId: number) => {
  const response = await api.get(`/feedback/guest/${guestId}`);
  return response.data.feedback;
};

export const updateFeedback = async (feedbackId: number, feedbackData: Partial<FeedbackData>) => {
  const response = await api.put(`/feedback/${feedbackId}`, feedbackData);
  return response.data;
};

export const deleteFeedback = async (feedbackId: number) => {
  const response = await api.delete(`/feedback/${feedbackId}`);
  return response.data;
};

export const getCastFeedbackStats = async (castId: number) => {
  const response = await api.get(`/feedback/cast/${castId}/stats`);
  return response.data.stats;
};

export const completeReservation = async (reservationId: number, feedback: {
  feedback_text?: string;
  feedback_rating?: number;
  feedback_badge_id?: number;
}) => {
  const response = await api.post(`/reservations/${reservationId}/complete`, feedback);
  return response.data;
};

export const refundUnusedPoints = async (reservationId: number) => {
  const response = await api.post(`/reservations/${reservationId}/refund`);
  return response.data;
};

export const getCastImmediatePaymentData = async (castId: number) => {
  const response = await api.get(`/casts/${castId}/immediate-payment`);
  return response.data;
};

export const processCastImmediatePayment = async (castId: number, data: {
  amount: number;
  payjp_token: string;
}) => {
  const response = await api.post(`/casts/${castId}/immediate-payment`, data);
  return response.data;
};

export const uploadIdentity = async (file: File, user_id: number) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('user_id', String(user_id));
  const response = await api.post('/identity/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const sendSmsVerificationCode = async (phoneNumber: string) => {
  const response = await api.post('/sms/send-code', { phone: phoneNumber });
  return response.data;
};

export const verifySmsCode = async (phoneNumber: string, code: string) => {
  const response = await api.post('/sms/verify-code', { phone: phoneNumber, code });
  return response.data;
};

export default api; 