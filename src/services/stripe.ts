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
      return {
        success: false,
        error: error.response?.data?.error || 'カード情報の処理中にエラーが発生しました',
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
      return {
        success: false,
        error: error.response?.data?.error || '決済処理中にエラーが発生しました',
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
      return {
        success: false,
        error: error.response?.data?.error || '決済処理中にエラーが発生しました',
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
      return {
        success: false,
        error: error.response?.data?.error || '3D Secure認証中にエラーが発生しました',
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
      const response = await api.post('/payouts/request', {
        cast_id: castId,
        amount: amount,
      });
      return response.data;
    } catch (error: any) {
      console.error('Payout request failed:', error);
      throw error;
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
}

export default StripeService;
