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
  phone?: string;
  line_id?: string;
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
    grade?: string;
    grade_points?: number;
    grade_updated_at?: string;
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
  type?: 'free' | 'Pishatto';
  scheduled_at: string;
  location?: string;
  meeting_location?: string;
  reservation_name?: string;
  duration?: number;
  details?: string;
  created_at?: string;
  started_at?: string;
  ended_at?: string;
  points_earned?: number;
  calculated_points?: number;
  // Selected cast(s)
  cast_id?: number;
  cast_ids?: number[];
  // Feedback fields
  feedback_text?: string;
  feedback_rating?: number;
  feedback_badge_id?: number;
  // Free call result fields
  selected_casts?: any[];
  cast_counts?: {
    royal_vip: number;
    vip: number;
    premium: number;
  };
}

export interface CastProfile {
  id: number;
  phone?: string;
  line_id?: string;
  nickname: string;
  avatar?: string;
  birth_year?: number;
  height?: number;
  residence?: string;
  birthplace?: string;
  profile_text?: string;
  category?: 'プレミアム' | 'VIP' | 'ロイヤルVIP';
  created_at?: string;
  updated_at?: string;
  reservations?: Reservation[];
}

export interface RepeatGuest {
  id: number;
  nickname: string;
  avatar?: string;
  birth_year?: number;
  residence?: string;
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

export const guestLogin = async (phone: string, verificationCode?: string) => {
  const payload: any = { phone };
  if (verificationCode) payload.verification_code = verificationCode;
  const response = await api.post('/guest/login', payload, { withCredentials: true });
  return response.data;
};

export const checkGuestAuth = async () => {
  const response = await api.get('/guest/check-auth', { withCredentials: true });
  return response.data;
};

export const checkCastAuth = async () => {
  const response = await api.get('/cast/check-auth', { withCredentials: true });
  return response.data;
};

export const getGuestProfile = async (phone: string): Promise<{ guest: GuestProfile, interests: GuestInterest[] }> => {
  const response = await api.get(`/guest/profile/${phone}`);
  return { guest: response.data.guest, interests: response.data.guest.interests || [] };
};

export const getGuestProfileByLineId = async (line_id: string): Promise<{ guest: GuestProfile, interests: GuestInterest[] }> => {
  const response = await api.get(`/guest/profile/line/${line_id}`);
  return { guest: response.data.guest, interests: response.data.guest.interests || [] };
};

export const getGuestProfileById = async (id: number) => {
  const response = await api.get(`/guest/profile/id/${id}`);
  return response.data.guest;
};

export const guestUpdateProfile = async (data: GuestProfileUpdateData) => {
  const formData = new FormData();
  
  // Include phone or line_id for identification
  if (data.phone) {
    formData.append('phone', data.phone);
  }
  if (data.line_id) {
    formData.append('line_id', data.line_id);
  }
  
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

export const createFreeCall = async (data: {
  guest_id: number;
  scheduled_at: string;
  location?: string;
  meeting_location?: string;
  reservation_name?: string;
  duration?: number;
  custom_duration_hours?: number;
  details?: string;
  time?: string;
  cast_counts: {
    royal_vip: number;
    vip: number;
    premium: number;
  };
}) => {
  const response = await api.post('/guest/free-call', data);
  return response.data;
};

export const createFreeCallReservation = async (data: {
  guest_id: number;
  scheduled_at: string;
  timezone?: string;
  location?: string;
  address?: string;
  name?: string;
  duration?: number;
  custom_duration_hours?: number;
  details?: string;
  time?: string;
  total_cost?: number;
  cast_counts: {
    royal_vip: number;
    vip: number;
    premium: number;
  };
}) => {
  const response = await api.post('/guest/free-call-reservation', data);
  return response.data;
};

export const getAvailableCasts = async (params?: { location?: string; limit?: number }) => {
  const response = await api.get('/casts/available', { params });
  return response.data;
};

export const getCastCountsByLocation = async () => {
  const response = await api.get('/casts/counts-by-location');
  return response.data;
};

export const cancelReservation = async (reservationId: number) => {
  const response = await api.post(`/reservations/${reservationId}/cancel`);
  return response.data;
};

export const updateReservation = async (reservationId: number, data: Partial<Reservation>) => {
  const response = await api.put(`/reservations/${reservationId}`, data);
  return response.data.reservation;
};

export const getCastReservations = async () => {
  const response = await api.get(`/cast/reservations`);
  return response.data.reservations;
};

export const castUpdateProfile = async (data: any) => {
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
  const response = await api.post('/cast/register', data, { withCredentials: true });
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

export const castLogin = async (phone: string, verificationCode?: string) => {
  const payload: { phone: string; verification_code?: string } = { phone };
  if (verificationCode) {
    payload.verification_code = verificationCode;
  }
  const response = await api.post('/cast/login', payload, { withCredentials: true });
  return response.data;
};

export const checkCastExists = async (phone: string) => {
  const response = await api.post('/cast/check-exists', { phone });
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

export const getUnreadNotificationCount = async (userType: 'guest' | 'cast', userId: number): Promise<number> => {
  const response = await api.get(`/notifications/${userType}/${userId}/unread-count`);
  return response.data.count;
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

export interface AdminNews {
  id: number;
  title: string;
  content: string;
  target_type: 'all' | 'guest' | 'cast';
  published_at: string;
  created_at: string;
}

export const getAdminNews = async (userType: 'guest' | 'cast', userId?: number): Promise<AdminNews[]> => {
  const url = userId ? `/admin-news/${userType}/${userId}` : `/admin-news/${userType}`;
  const response = await api.get(url);
  return response.data.news;
};

export const createPaymentIntentDirect = async (
  payment_method: string, 
  amount: number, 
  currency: string = 'jpy', 
  user_id?: number,
  user_type?: 'guest' | 'cast'
) => {
  const payload: any = {
    payment_method,
    amount,
    currency,
  };
  
  if (user_id) payload.user_id = user_id;
  if (user_type) payload.user_type = user_type;
  
  const response = await api.post('/payments/payment-intent-direct', payload);
  return response.data;
};

export const debugStripeResponse = async (payment_method: string, amount: number) => {
  const response = await api.post('/payments/debug-response', {
    payment_method,
    amount,
  });
  return response.data;
};

export const purchasePoints = async (user_id: number, user_type: 'guest' | 'cast', amount: number, payment_method?: string, payment_method_type?: string) => {
  const payload: any = { user_id, user_type, amount };
  if (payment_method) payload.payment_method = payment_method;
  if (payment_method_type) payload.payment_method_type = payment_method_type;
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

export interface Receipt {
  id: number;
  receipt_number: string;
  user_type: 'guest' | 'cast';
  user_id: number;
  payment_id?: number;
  recipient_name: string;
  amount: number;
  tax_amount: number;
  tax_rate: number;
  total_amount: number;
  purpose: string;
  transaction_created_at?: string;
  issued_at: string;
  company_name: string;
  company_address: string;
  company_phone: string;
  registration_number: string;
  status: 'draft' | 'issued' | 'cancelled';
  pdf_url?: string;
  html_content?: string;
  created_at: string;
  updated_at: string;
}

export const getReceipts = async (user_type: 'guest' | 'cast', user_id: number): Promise<Receipt[]> => {
  const response = await api.get(`/receipts/${user_type}/${user_id}`);
  return response.data.receipts;
};

export const createReceipt = async (data: {
  user_type: 'guest' | 'cast';
  user_id: number;
  payment_id?: number;
  recipient_name: string;
  amount: number;
  purpose: string;
  transaction_created_at?: string;
}): Promise<Receipt> => {
  const response = await api.post('/receipts', data);
  return response.data.receipt;
};

export const getReceipt = async (receiptId: number): Promise<Receipt> => {
  const response = await api.get(`/receipts/${receiptId}`);
  return response.data.receipt;
};

export const getReceiptByNumber = async (receiptNumber: string): Promise<{ success: boolean; receipt?: Receipt; error?: string }> => {
  const response = await api.get(`/receipts/by-number/${receiptNumber}`);
  return response.data;
};

export const registerPaymentInfo = async (user_id: number, user_type: 'guest' | 'cast', payment_info: string) => {
  const response = await api.post('/payments/info', { user_id, user_type, payment_info });
  return response.data;
};

export const registerCard = async (user_id: number, user_type: 'guest' | 'cast', payment_method: string) => {
  const response = await api.post('/payments/register-card', { user_id, user_type, payment_method });
  return response.data;
};

export const getPaymentInfo = async (user_type: 'guest' | 'cast', user_id: number) => {
  const response = await api.get(`/payments/info/${user_type}/${user_id}`);
  return response.data;
};

export const deletePaymentInfo = async (user_type: 'guest' | 'cast', user_id: number, card_id: string) => {
  const response = await api.delete(`/payments/info/${user_type}/${user_id}/${card_id}`);
  return response.data;
};

export const processAutomaticPayment = async (data: {
  guest_id: number;
  required_points: number;
  reservation_id?: number;
  description?: string;
}) => {
  const response = await api.post('/payments/automatic', data);
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
  const phones: Array<string | null | undefined> = response.data.phones || [];
  return phones.map((p) => (p ?? ''));
};

export const applyReservation = async (reservation_id: number, cast_id: number) => {
  console.log("applyReservation", reservation_id, cast_id);
  return api.post('/reservation-applications/apply', { reservation_id, cast_id });
};

export const approveReservationApplication = async (applicationId: number, adminId: number) => {
  return api.post(`/reservation-applications/${applicationId}/approve`, { admin_id: adminId });
};

export const rejectReservationApplication = async (applicationId: number, adminId: number, rejectionReason?: string) => {
  return api.post(`/reservation-applications/${applicationId}/reject`, { 
    admin_id: adminId, 
    rejection_reason: rejectionReason 
  });
};

export const getPendingApplications = async () => {
  return api.get('/reservation-applications/pending');
};

export const getReservationApplications = async (reservationId: number) => {
  return api.get(`/reservation-applications/reservation/${reservationId}`);
};

export const getCastApplications = async (castId: number) => {
  const response = await api.get(`/reservation-applications/cast/${castId}`);
  return response.data.applications;
};

export const getAllCastApplications = async (castId: number) => {
  const response = await api.get(`/reservation-applications/cast/${castId}/all`);
  return response.data.applications;
};

export const startReservation = async (reservation_id: number, cast_id: number) => {
  const response = await api.post('/reservation/start', { reservation_id, cast_id });
  return response.data.reservation;
};

export const stopReservation = async (reservation_id: number, cast_id: number) => {
  const response = await api.post('/reservation/stop', { reservation_id, cast_id });
  return response.data;
};

export const getCastSessionStatus = async (reservation_id: number, cast_id: number) => {
  const response = await api.get('/reservation/cast-session-status', {
    params: { reservation_id, cast_id }
  });
  return response.data;
};

export const getReservationCastSessions = async (reservation_id: number) => {
  const response = await api.get('/reservation/cast-sessions', {
    params: { reservation_id }
  });
  return response.data;
};

export const getPointTransactions = async (userType: 'guest' | 'cast', userId: number) => {
  const response = await api.get(`/point-transactions/${userType}/${userId}`);
  return response.data;
};

export const createPointTransaction = async (data: {
  user_type: 'guest' | 'cast';
  user_id: number;
  amount: number;
  type: 'pending' | 'transfer' | 'convert' | 'gift' | 'buy';
  reservation_id?: number;
  description?: string;
  gift_type?: string;
}) => {
  const response = await api.post('/point-transactions', data);
  return response.data;
};

export const createPointTransactionWithCalculation = async (data: {
  user_type: 'guest' | 'cast';
  user_id: number;
  amount: number;
  type: 'pending' | 'transfer' | 'convert' | 'gift' | 'buy';
  reservation_id?: number;
  description?: string;
  gift_type?: string;
  calculated_points?: number;
  night_time_bonus?: number;
  extension_fee?: number;
  total_points?: number;
  unused_points?: number;
  shortfall_points?: number;
}) => {
  const response = await api.post('/point-transactions/with-calculation', data);
  return response.data;
};

export const createPendingPointTransaction = async (data: {
  guest_id: number;
  cast_id: number;
  amount: number;
  reservation_id: number;
  description?: string;
}) => {
  const response = await api.post('/point-transactions/pending', data);
  return response.data;
};

export const createTransferPointTransaction = async (data: {
  guest_id: number;
  cast_id: number;
  amount: number;
  reservation_id: number;
  description?: string;
  calculated_points?: number;
  night_time_bonus?: number;
  extension_fee?: number;
  total_points?: number;
}) => {
  const response = await api.post('/point-transactions/transfer', data);
  return response.data;
};

export const createRefundPointTransaction = async (data: {
  guest_id: number;
  cast_id: number;
  amount: number;
  reservation_id: number;
  description?: string;
}) => {
  const response = await api.post('/point-transactions/refund', data);
  return response.data;
};

export const createGiftPointTransaction = async (data: {
  guest_id: number;
  cast_id: number;
  amount: number;
  reservation_id?: number;
  description?: string;
  gift_type?: string;
}) => {
  const response = await api.post('/point-transactions/gift', data);
  return response.data;
};

export const deductPoints = async (guest_id: number, amount: number) => {
  const response = await api.post('/guests/deduct-points', { guest_id, amount });
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
  const response = await api.post('/cast/avatar-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const uploadGuestAvatar = async (file: File, identifier: { phone?: string; line_id?: string }) => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  if (identifier.phone) {
    formData.append('phone', identifier.phone);
  }
  if (identifier.line_id) {
    formData.append('line_id', identifier.line_id);
  }
  
  const response = await api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteGuestAvatar = async (identifier: { phone?: string; line_id?: string }) => {
  const data: any = {};
  
  if (identifier.phone) {
    data.phone = identifier.phone;
  }
  if (identifier.line_id) {
    data.line_id = identifier.line_id;
  }
  
  const response = await api.delete('/users/avatar', {
    data,
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
  const response = await api.post('/guests/like', { cast_id, guest_id });
  return response.data;
};

export const createChat = async (cast_id: number, guest_id: number, reservation_id?: number) => {
  const response = await api.post('/chats/create', { cast_id, guest_id, reservation_id });
  return response.data;
};

export const createChatGroup = async (data: {
  name: string;
  guest_id: number;
  cast_ids: number[];
  reservation_id?: number;
}) => {
  console.log("createChatGroup", data);
  const response = await api.post('/chats/create-group', data);
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
  const response = await api.get(`/tweets/${tweet_id}/like-count`);
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
  const response = await api.get(`/chats-guest/favorites/${guestId}`);
  return response.data;
};

export const isChatFavorited = async (chatId: number, guestId: number) => {
  const response = await api.get(`/chats/${chatId}/favorited/${guestId}`);
  return response.data;
};

export const fetchAllBadges = async () => {
  const response = await api.get('/badges');
  return response.data.badges;
};

export const getCastBadges = async (castId: number) => {
  const response = await api.get(`/badges/${castId}`);
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

export const getTopSatisfactionCasts = async () => {
  const response = await api.get('/feedback/top-satisfaction');
  return response.data.casts;
};

export const getAllSatisfactionCasts = async () => {
  const response = await api.get('/feedback/all-satisfaction');
  return response.data.casts;
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

export const completeSession = async (sessionData: {
  chat_id: number;
  cast_id: number;
  guest_id: number;
  session_duration: number;
  total_points: number;
  cast_points: number;
  guest_points: number;
  session_key: string;
}) => {
  const response = await api.post('/sessions/complete', sessionData);
  return response.data;
};

export const getPointBreakdown = async (reservationId: number) => {
  const response = await api.get(`/reservations/${reservationId}/point-breakdown`);
  return response.data;
};

export const getCastImmediatePaymentData = async (castId: number) => {
  const response = await api.get(`/casts/${castId}/immediate-payment`);
  return response.data;
};

export const processCastImmediatePayment = async (castId: number, data: {
  amount: number;
  payment_method: string;
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

// Concierge API functions
export interface ConciergeMessage {
  id: number;
  text: string;
  is_concierge: boolean;
  timestamp: string;
  created_at: string;
}

export interface ConciergeInfo {
  welcome_message: {
    title: string;
    subtitle: string;
    content: string[];
  };
  concierge_info: {
    name: string;
    age: string;
    avatar: string;
  };
}

export const getConciergeMessages = async (userId: number, userType: 'guest' | 'cast') => {
  try {
    const response = await api.get('/concierge/messages', {
      params: {
        user_id: userId,
        user_type: userType
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching concierge messages:', error);
    throw error;
  }
};

export const sendConciergeMessage = async (userId: number, userType: 'guest' | 'cast', message: string) => {
  try {
    const response = await api.post('/concierge/messages', {
      user_id: userId,
      user_type: userType,
      message: message
    });
    return response.data;
  } catch (error) {
    console.error('Error sending concierge message:', error);
    throw error;
  }
};

export const sendSystemConciergeMessage = async (userId: number, userType: 'guest' | 'cast', message: string, messageType: string = 'system', category: string = 'system_notification') => {
  try {
    const response = await api.post('/concierge/system-message', {
      user_id: userId,
      user_type: userType,
      message: message,
      message_type: messageType,
      category: category
    });
    return response.data;
  } catch (error) {
    console.error('Error sending system concierge message:', error);
    throw error;
  }
};

export const markConciergeAsRead = async (userId: number, userType: 'guest' | 'cast') => {
  try {
    const response = await api.post('/concierge/mark-read', {
      user_id: userId,
      user_type: userType
    });
    return response.data;
  } catch (error) {
    console.error('Error marking concierge as read:', error);
    throw error;
  }
};export const getConciergeInfo = async (): Promise<ConciergeInfo> => {
  try {
    const response = await api.get('/concierge/info');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching concierge info:', error);
    throw error;
  }
};

export const sendGroupMessage = async (data: {
  group_id: number;
  message?: string;
  image?: File;
  gift_id?: number;
  sender_guest_id?: number;
  sender_cast_id?: number;
  receiver_cast_id?: number; // optional: target cast in the group when sending a gift
}) => {
  const formData = new FormData();
  formData.append('group_id', data.group_id.toString());
  
  if (data.message) formData.append('message', data.message);
  if (data.image) formData.append('image', data.image);
  if (data.gift_id) formData.append('gift_id', data.gift_id.toString());
  if (data.sender_guest_id) formData.append('sender_guest_id', data.sender_guest_id.toString());
  if (data.sender_cast_id) formData.append('sender_cast_id', data.sender_cast_id.toString());
  if (data.receiver_cast_id) formData.append('receiver_cast_id', data.receiver_cast_id.toString());

  const response = await api.post('/chats/group-message', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  console.log('sendGroupMessage API response:', response.data);
  
  // The backend returns { message: Message, group_id: number }
  // We want to return just the message object
  return response.data.message;
};

export const getGroupMessages = async (groupId: number, userType: string, userId: number) => {
  const response = await api.get(`/chats/group/${groupId}/messages`, {
    params: { user_type: userType, user_id: userId }
  });
  return response.data;
};

export const getGroupParticipants = async (groupId: number) => {
  const response = await api.get(`/chats/group/${groupId}/participants`);
  return response.data;
};

// Notification settings API functions
export interface NotificationSettings {
  footprints: boolean;
  likes: boolean;
  messages: boolean;
  concierge_messages: boolean;
  meetup_dissolution: boolean;
  auto_extension: boolean;
  tweet_likes: boolean;
  admin_notices: boolean;
}

export const getNotificationSettings = async (userType: 'guest' | 'cast', userId: number): Promise<NotificationSettings> => {
  const response = await api.get('/notification-settings', {
    params: { user_id: userId, user_type: userType }
  });
  return response.data.settings;
};

export const updateNotificationSettings = async (
  userType: 'guest' | 'cast', 
  userId: number, 
  settings: Partial<NotificationSettings>
): Promise<{ message: string; settings: Partial<NotificationSettings> }> => {
  const response = await api.post('/notification-settings', {
    user_id: userId,
    user_type: userType,
    settings
  });
  return response.data;
};

export const checkNotificationEnabled = async (
  userType: 'guest' | 'cast', 
  userId: number, 
  settingKey: string
): Promise<{ enabled: boolean }> => {
  const response = await api.get('/notification-settings/check', {
    params: { user_id: userId, user_type: userType, setting_key: settingKey }
  });
  return response.data;
};

export const markChatMessagesRead = async (chatId: number, userId: number, userType: string) => {
  try {
    const response = await api.post(`/chats/${chatId}/mark-read`, {
      user_id: userId,
      user_type: userType
    });
    return response.data;
  } catch (error) {
    console.error('Error marking chat messages as read:', error);
    throw error;
  }
};

// Grade-related interfaces and functions
export interface GradeInfo {
  current_grade: string;
  current_grade_name: string;
  grade_points: number;
  next_grade?: string;
  next_grade_name?: string;
  points_to_next_grade: number;
  benefits: {
    chat_background?: boolean;
    tweet_grade_display?: boolean;
    grade_gift?: boolean;
    birthday_gift?: boolean;
    private_settings_expansion?: boolean;
    dedicated_concierge?: boolean;
    class_up_rights?: boolean;
    // Cast-specific benefits
    easy_message?: boolean;
    suspension_system?: boolean;
    auto_goodbye_message?: boolean;
    welcome_message?: boolean;
    transfer_fee_discount?: boolean;
  };
  all_benefits: Record<string, any>;
  grade_names: Record<string, string>;
  fp_breakdown?: {
    repeat_points: number;
    gift_points: number;
    extension_count: number;
    want_to_meet_again_count: number;
    new_guest_count: number;
    repeater_count: number;
  };
}

export interface GradeUpdateResult {
  old_grade: string;
  new_grade: string;
  grade_points: number;
  upgraded: boolean;
}

export const getGuestGrade = async (guestId: number): Promise<GradeInfo> => {
  try {
    const response = await api.get(`/grades/guest/${guestId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching guest grade:', error);
    throw error;
  }
};

export const getCastGrade = async (castId: number): Promise<GradeInfo> => {
  try {
    console.log("CASTID", castId);
    const response = await api.get(`/grades/cast/${castId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching cast grade:', error);
    throw error;
  }
};

// New: Monthly earned ranking based on point_transactions
export interface MonthlyRankingItem {
  user_id: number;
  name: string;
  avatar: string;
  points: number;
  rank: number;
}

export interface MonthlyRankingResponse {
  data: MonthlyRankingItem[];
  summary: {
    month: 'current' | 'last';
    period_start: string;
    period_end: string;
    cast_id: number | null;
    my_points: number | null;
    my_rank: number | null;
  };
}

export const getMonthlyEarnedRanking = async (
  params: { limit?: number; castId?: number; month?: 'current' | 'last' } = {}
): Promise<MonthlyRankingResponse> => {
  const response = await api.get('/ranking/monthly-earned', { params });
  return response.data as MonthlyRankingResponse;
};

export const updateGuestGrade = async (guestId: number): Promise<GradeUpdateResult> => {
  try {
    const response = await api.post('/grades/guest/update', { guest_id: guestId });
    return response.data.data;
  } catch (error) {
    console.error('Error updating guest grade:', error);
    throw error;
  }
};

export const updateCastGrade = async (castId: number): Promise<GradeUpdateResult> => {
  try {
    const response = await api.post('/grades/cast/update', { cast_id: castId });
    return response.data.data;
  } catch (error) {
    console.error('Error updating cast grade:', error);
    throw error;
  }
};

export const getAllGradesInfo = async (): Promise<{
  thresholds: Record<string, number>;
  names: Record<string, string>;
  benefits: Record<string, any>;
}> => {
  try {
    const response = await api.get('/grades/info');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching all grades info:', error);
    throw error;
  }
};

export const getGradeBenefits = async (grade: string): Promise<{
  grade: string;
  benefits: Record<string, boolean>;
}> => {
  try {
    const response = await api.get(`/grades/${grade}/benefits`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching grade benefits:', error);
    throw error;
  }
};

export default api; 

export const checkLineAuth = async () => {
  const response = await api.get('/line/check-auth', { withCredentials: true });
  return response.data;
};

export const checkLineAuthGuest = async () => {
  const response = await api.get('/line/check-auth/guest', { withCredentials: true });
  return response.data;
};

export const checkLineAuthCast = async () => {
  const response = await api.get('/line/check-auth/cast', { withCredentials: true });
  return response.data;
};

export const lineLogout = async () => {
  const response = await api.post('/line/logout', {}, { withCredentials: true });
  return response.data;
};

export const registerWithLine = async (lineData: any, additionalData: any) => {
  const response = await api.post('/line/register', {
    user_type: lineData.user_type || 'guest',
    line_id: lineData.line_id,
    line_email: lineData.line_email,
    line_name: lineData.line_name,
    line_avatar: lineData.line_avatar,
    additional_data: additionalData
  }, { withCredentials: true });
  return response.data;
};

export const linkAccountWithLine = async (userType: 'guest' | 'cast', userId: number, lineId: string) => {
  const response = await api.post('/line/link-account', {
    user_type: userType,
    user_id: userId,
    line_id: lineId
  }, { withCredentials: true });
  return response.data;
}; 



