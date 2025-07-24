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
  created_at: string;
  updated_at: string;
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

export const getCastReservations = async () => {
  const response = await api.get(`/cast/reservations`);
  return response.data.reservations;
};

export const castUpdateProfile = async (data: any) => {
  const response = await api.post('/cast/profile', data);
  return response.data;
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

export const getGuestChats = async (guestId: number) => {
  const response = await api.get(`/chats/guest/${guestId}`);
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

export const getChatMessages = async (chatId: number) => {
  const response = await api.get(`/chats/${chatId}/messages`);
  return response.data.messages;
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

export const recordCastVisit = async (guest_id: number, cast_id: number) => {
  const response = await api.post('/casts/visit', { guest_id, cast_id });
  return response.data;
};

export const getCastVisitHistory = async (guest_id: number) => {
  const response = await api.get(`/casts/visit-history/${guest_id}`);
  return response.data;
};

export const getCastProfileWithExtras = async (castId: number) => {
  const response = await api.get(`/cast/profile/${castId}`);
  return response.data;
};


export const getNotifications = async (userType: 'guest' | 'cast', userId: number) => {
  const response = await api.get(`/notifications/${userType}/${userId}`);
  console.log(response.data.notifications);
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

export const purchasePoints = async (user_id: number, user_type: 'guest' | 'cast', amount: number, payment_info?: string) => {
  const response = await api.post('/payments/purchase', { user_id, user_type, amount, payment_info });
  return response.data;
};

export const getPointHistory = async (user_type: 'guest' | 'cast', user_id: number) => {
  const response = await api.get(`/payments/history/${user_type}/${user_id}`);
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

export const getPaymentInfo = async (user_type: 'guest' | 'cast', user_id: number) => {
  const response = await api.get(`/payments/info/${user_type}/${user_id}`);
  return response.data.payment_info;
};

export const requestPayout = async (cast_id: number, amount: number) => {
  const response = await api.post('/payouts/request', { cast_id, amount });
  return response.data.payout;
};

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
  return api.post('/reservation/match', { reservation_id, cast_id });
};

export const fetchAllGifts = async () => {
  const response = await api.get('/gifts');
  return response.data.gifts;
};

export const fetchCastReceivedGifts = async (castId: number) => {
  const response = await api.get(`/cast/${castId}/received-gifts`);
  return response.data.gifts;
};

export default api; 