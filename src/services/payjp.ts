import api from './api';

export interface PaymentData {
  user_id: number;
  user_type: 'guest' | 'cast';
  amount: number;
  token: string;
  payment_method?: string;
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
  charge?: any;
  error?: string;
}

export interface TokenResponse {
  success: boolean;
  token?: string;
  error?: string;
}

export class PayJPService {
  /**
   * Create a token for card information via backend
   */
  static async createToken(cardData: CardData): Promise<TokenResponse> {
    try {
      const response = await api.post('/payments/token', cardData);
      return response.data;
    } catch (error: any) {
      console.error('Token creation failed:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'カード情報の処理中にエラーが発生しました',
      };
    }
  }

  /**
   * Process payment using PAY.JP
   */
  static async processPayment(paymentData: PaymentData): Promise<PaymentResponse> {
    try {
      const response = await api.post('/payments/purchase', paymentData);
      return response.data;
    } catch (error: any) {
      console.error('Payment processing failed:', error);
      return {
        success: false,
        error: error.response?.data?.error || '決済処理中にエラーが発生しました',
      };
    }
  }

  /**
   * Process payment using direct PayJP charge approach
   */
  static async processPaymentDirect(
    card: string, 
    amount: number, 
    currency: string = 'jpy',
    user_id?: number,
    user_type?: 'guest' | 'cast'
  ): Promise<PaymentResponse> {
    try {
      const response = await api.post('/payments/charge-direct', {
        card,
        amount,
        currency,
        user_id,
        user_type,
      });
      return response.data;
    } catch (error: any) {
      console.error('Direct payment processing failed:', error);
      return {
        success: false,
        error: error.response?.data?.error || '決済処理中にエラーが発生しました',
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
    try {
      const response = await api.post(`/casts/${castId}/stripe/payouts`, {
        amount,
      });
      return response.data;
    } catch (error: any) {
      console.error('Payout request failed:', error);
      throw error;
    }
  }
}

export default PayJPService; 