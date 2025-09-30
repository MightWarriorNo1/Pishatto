import api from './api';

export interface AutomaticPaymentResult {
  success: boolean;
  message: string;
  payment_id?: number;
  amount_yen?: number;
  points_added?: number;
  new_balance?: number;
  requires_card_registration?: boolean;
  error?: string;
}

export interface PaymentEligibilityResult {
  success: boolean;
  has_payment_method: boolean;
  payment_info?: any;
  eligible_for_automatic_payment: boolean;
  error?: string;
}

export class AutomaticPaymentService {
  /**
   * Process automatic payment for insufficient points
   */
  static async processAutomaticPayment(
    guestId: number,
    requiredPoints: number,
    reservationId?: number,
    description?: string
  ): Promise<AutomaticPaymentResult> {
    try {
      const response = await api.post('/payments/automatic', {
        guest_id: guestId,
        required_points: requiredPoints,
        reservation_id: reservationId,
        description: description
      });

      return response.data;
    } catch (error: any) {
      console.error('Automatic payment failed:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Automatic payment failed',
        error: error.response?.data?.error || error.message,
        requires_card_registration: error.response?.data?.requires_card_registration || false
      };
    }
  }

  /**
   * Check if guest is eligible for automatic payments
   */
  static async checkEligibility(guestId: number): Promise<PaymentEligibilityResult> {
    try {
      const response = await api.get(`/payments/automatic/eligibility/${guestId}`);
      return response.data;
    } catch (error: any) {
      console.error('Check eligibility failed:', error);
      return {
        success: false,
        has_payment_method: false,
        eligible_for_automatic_payment: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Convert points to yen amount
   */
  static pointsToYen(points: number): number {
    const YEN_PER_POINT = 1.2;
    return Math.ceil(points * YEN_PER_POINT);
  }

  /**
   * Convert yen amount to points
   */
  static yenToPoints(yen: number): number {
    const YEN_PER_POINT = 1.2;
    return Math.floor(yen / YEN_PER_POINT);
  }
}
