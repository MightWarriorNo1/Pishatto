import api from './api';

export interface PaymentData {
  user_id: number;
  user_type: 'guest' | 'cast';
  amount: number;
  payment_method?: string;
  payment_method_type?: string;
  description?: string;
}

export interface CardData {
  number: string;
  cvc: string;
  exp_month: number;
  exp_year: number;
}

export interface PaymentResponse {
  success: boolean;
  payment?: any;
  payment_intent?: any;
  error?: string;
}

export interface PaymentMethodResponse {
  success: boolean;
  payment_method?: string;
  error?: string;
}

export interface CastConnectRequirements {
  currently_due: string[];
  eventually_due: string[];
  past_due: string[];
  pending_verification: string[];
  disabled_reason?: string | null;
}

export interface CastConnectStatus {
  id?: string | null;
  email?: string | null;
  payouts_enabled: boolean;
  charges_enabled?: boolean;
  details_submitted?: boolean;
  requirements: CastConnectRequirements;
  needs_attention?: boolean;
  last_requirement_refresh?: string;
}

export interface CastConnectAccountPayload {
  email?: string;
  country?: string;
  business_type?: 'individual' | 'company';
  metadata?: Record<string, string>;
  product_description?: string;
  support_email?: string;
  support_phone?: string;
  force_sync?: boolean;
}

export interface CastOnboardingLinkPayload {
  refresh_url?: string;
  return_url?: string;
  type?: 'account_onboarding' | 'account_update';
}

export interface CastConnectAccountResponse {
  success: boolean;
  account: CastConnectStatus;
  cast?: any;
}

export interface CastOnboardingLinkResponse {
  success: boolean;
  link: {
    url: string;
    expires_at?: number;
  };
}

export interface CastPayoutPayload {
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
  description?: string;
}

export interface CastPayoutResponse {
  success: boolean;
  payout: any;
  payment: any;
}

export interface CastPayoutRecord {
  id: number;
  type: 'scheduled' | 'instant';
  closing_month: string;
  period_start: string;
  period_end: string;
  total_points: number;
  gross_amount_yen: number;
  net_amount_yen: number;
  fee_amount_yen: number;
  fee_rate: number;
  status: string;
  scheduled_payout_date: string | null;
  paid_at?: string | null;
}

export interface CastPayoutSummaryResponse {
  success: boolean;
  summary: {
    conversion_rate: number;
    scheduled_fee_rate: number;
    instant_fee_rate: number;
    unsettled_points: number;
    unsettled_amount_yen: number;
    instant_available_points: number;
    instant_available_amount_yen: number;
    upcoming_payout: CastPayoutRecord | null;
    recent_history: CastPayoutRecord[];
  };
}

export class StripeService {
  /**
   * Create a payment method for card information
   */
  static async createPaymentMethod(cardData: CardData): Promise<PaymentMethodResponse> {
    try {
      // Create payment method on the backend
      const response = await api.post('/payments/create-payment-method', {
        number: cardData.number,
        exp_month: cardData.exp_month,
        exp_year: cardData.exp_year,
        cvc: cardData.cvc,
      });
      
      return {
        success: true,
        payment_method: response.data.payment_method_id,
      };
    } catch (error: any) {
      console.error('Payment method creation failed:', error);
      const backendError = error.response?.data?.error || error.response?.data?.message || error.response?.data?.detail;
      return {
        success: false,
        error: backendError || 'カード情報の処理中にエラーが発生しました',
      };
    }
  }

  /**
   * Process payment using Stripe
   */
  static async processPayment(paymentData: PaymentData): Promise<PaymentResponse> {
    try {
      const response = await api.post('/payments/purchase', paymentData);
      return response.data;
    } catch (error: any) {
      console.error('Payment processing failed:', error);
      const backendError = error.response?.data?.error || error.response?.data?.message || error.response?.data?.detail;
      return {
        success: false,
        error: backendError || '決済処理中にエラーが発生しました',
      };
    }
  }

  /**
   * Process payment using direct Stripe payment intent approach
   */
  static async processPaymentDirect(
    payment_method: string, 
    amount: number, 
    currency: string = 'jpy',
    user_id?: number,
    user_type?: 'guest' | 'cast'
  ): Promise<PaymentResponse> {
    try {
      const response = await api.post('/payments/payment-intent-direct', {
        payment_method,
        amount,
        currency,
        user_id,
        user_type,
      });
      
      const data = response.data;
      
      // If payment requires 3DS authentication, handle it
      if (data.requires_action && data.client_secret) {
        return await this.handle3DSAuthentication(data.client_secret, data.payment_intent);
      }
      
      return data;
    } catch (error: any) {
      console.error('Direct payment processing failed:', error);
      const backendError = error.response?.data?.error || error.response?.data?.message || error.response?.data?.detail;
      return {
        success: false,
        error: backendError || '決済処理中にエラーが発生しました',
      };
    }
  }

  /**
   * Handle 3DS authentication
   */
  static async handle3DSAuthentication(client_secret: string, payment_intent: any): Promise<PaymentResponse> {
    try {
      // For now, we'll complete the payment intent on the backend
      // In a real implementation, you'd use Stripe.js to handle 3DS
      const response = await api.post('/payments/complete-payment-intent', {
        payment_intent_id: payment_intent.id,
      });
      
      return response.data;
    } catch (error: any) {
      console.error('3DS authentication failed:', error);
      const backendError = error.response?.data?.error || error.response?.data?.message || error.response?.data?.detail;
      return {
        success: false,
        error: backendError || '3D Secure認証中にエラーが発生しました',
      };
    }
  }

  /**
   * Get payment status
   */
  static async getPaymentStatus(paymentId: number): Promise<any> {
    try {
      const response = await api.get(`/payments/status/${paymentId}`);
      return response.data;
    } catch (error: any) {
      console.error('Payment status check failed:', error);
      throw error;
    }
  }

  /**
   * Refund payment
   */
  static async refundPayment(paymentId: number, amount?: number): Promise<any> {
    try {
      const response = await api.post(`/payments/refund/${paymentId}`, { amount });
      return response.data;
    } catch (error: any) {
      console.error('Payment refund failed:', error);
      throw error;
    }
  }

  /**
   * Get payment history
   */
  static async getPaymentHistory(userType: 'guest' | 'cast', userId: number): Promise<any> {
    try {
      const response = await api.get(`/payments/history/${userType}/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('Payment history fetch failed:', error);
      throw error;
    }
  }

  /**
   * Get receipts
   */
  static async getReceipts(userType: 'guest' | 'cast', userId: number): Promise<any> {
    try {
      const response = await api.get(`/receipts/${userType}/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('Receipts fetch failed:', error);
      throw error;
    }
  }

  /**
   * Request payout (for casts)
   */
  static async requestPayout(castId: number, amount: number): Promise<any> {
    return this.requestCastPayout(castId, { amount });
  }

  static async ensureCastConnectAccount(
    castId: number,
    payload: CastConnectAccountPayload = {}
  ): Promise<CastConnectAccountResponse> {
    try {
      const response = await api.post(`/casts/${castId}/stripe/connect`, payload);
      return response.data;
    } catch (error: any) {
      this.throwStripeError(error, 'Stripe Connectアカウントの作成に失敗しました。');
    }
  }

  static async getCastConnectAccount(
    castId: number,
    params?: { force?: boolean }
  ): Promise<{ success: boolean; account: CastConnectStatus }> {
    try {
      const response = await api.get(`/casts/${castId}/stripe/account`, {
        params,
      });
      return response.data;
    } catch (error: any) {
      this.throwStripeError(error, 'Stripe Connectステータスの取得に失敗しました。');
    }
  }

  static async getCastAccountBalance(
    castId: number
  ): Promise<{ success: boolean; balance: any }> {
    try {
      const response = await api.get(`/casts/${castId}/stripe/balance`);
      return response.data;
    } catch (error: any) {
      this.throwStripeError(error, '残高情報の取得に失敗しました。');
    }
  }

  static async createCastOnboardingLink(
    castId: number,
    payload: CastOnboardingLinkPayload = {}
  ): Promise<CastOnboardingLinkResponse> {
    try {
      const response = await api.post(`/casts/${castId}/stripe/onboarding-link`, payload);
      return response.data;
    } catch (error: any) {
      this.throwStripeError(error, 'Stripe Connectオンボーディングリンクの生成に失敗しました。');
    }
  }

  static async createCastLoginLink(
    castId: number
  ): Promise<{ success: boolean; link: any }> {
    try {
      const response = await api.post(`/casts/${castId}/stripe/login-link`);
      return response.data;
    } catch (error: any) {
      this.throwStripeError(error, 'Stripeダッシュボードリンクの生成に失敗しました。');
    }
  }

  static async requestCastPayout(
    castId: number,
    payload: CastPayoutPayload
  ): Promise<CastPayoutResponse> {
    try {
      const response = await api.post(`/casts/${castId}/stripe/payouts`, payload);
      return response.data;
    } catch (error: any) {
      this.throwStripeError(error, '振込リクエストの作成に失敗しました。');
    }
  }

  static async getCastPayoutSummary(castId: number): Promise<CastPayoutSummaryResponse> {
    try {
      const response = await api.get(`/casts/${castId}/payouts/summary`);
      return response.data;
    } catch (error: any) {
      this.throwStripeError(error, '振込サマリーの取得に失敗しました。');
    }
  }

  static async requestInstantCastPayout(
    castId: number,
    payload: { amount: number; memo?: string }
  ): Promise<any> {
    try {
      const response = await api.post(`/casts/${castId}/payouts/instant`, payload);
      return response.data;
    } catch (error: any) {
      this.throwStripeError(error, '即時振込の申請に失敗しました。');
    }
  }

  /**
   * Register a payment method for a user
   */
  static async registerPaymentMethod(
    userId: number, 
    userType: 'guest' | 'cast', 
    paymentMethod: string
  ): Promise<any> {
    try {
      const response = await api.post('/payments/register-card', {
        user_id: userId,
        user_type: userType,
        payment_method: paymentMethod,
      });
      return response.data;
    } catch (error: any) {
      console.error('Payment method registration failed:', error);
      throw error;
    }
  }

  /**
   * Get customer payment methods
   */
  static async getCustomerPaymentMethods(
    userType: 'guest' | 'cast', 
    userId: number
  ): Promise<any> {
    try {
      const response = await api.get(`/payments/info/${userType}/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('Customer payment methods fetch failed:', error);
      throw error;
    }
  }

  /**
   * Delete a payment method
   */
  static async deletePaymentMethod(
    userType: 'guest' | 'cast', 
    userId: number, 
    paymentMethodId: string
  ): Promise<any> {
    try {
      const response = await api.delete(`/payments/info/${userType}/${userId}/${paymentMethodId}`);
      return response.data;
    } catch (error: any) {
      console.error('Payment method deletion failed:', error);
      throw error;
    }
  }

  private static throwStripeError(error: any, fallbackMessage: string): never {
    const message =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      fallbackMessage;
    const err = new Error(message) as Error & { status?: number };
    err.status = error?.response?.status;
    throw err;
  }
}

export default StripeService;
