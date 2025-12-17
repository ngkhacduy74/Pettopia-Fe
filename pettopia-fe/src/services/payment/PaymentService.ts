const API_URL = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/payments`;

interface PaymentRequest {
  amount: number;
  description: string;
}

interface PaymentResponse {
  code: string;
  desc: string;
  data: {
    bin: string;
    accountNumber: string;
    accountName: string;
    amount: number;
    description: string;
    orderCode: number;
    currency: string;
    paymentLinkId: string;
    status: string;
    expiredAt: string | null;
    checkoutUrl: string;
    qrCode: string;
  };
  signature: string;
  userId: string;
  orderId: string;
}

interface PaymentStatusResponse {
  success: boolean;
  message: string;
  status: string;
  orderCode: number;
}

export const PaymentService = {
  async createPayment(payload: PaymentRequest): Promise<PaymentResponse> {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
      throw new Error('Token not found');
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        token: `${authToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Payment API error: ${response.statusText}`);
    }

    const data: PaymentResponse = await response.json();

    if (data.code !== '00') {
      throw new Error(data.desc || 'Payment creation failed');
    }

    return data;
  },

  async getPaymentStatus(orderCode: string): Promise<PaymentStatusResponse> {
    const authToken = localStorage.getItem('authToken');

    console.log('getPaymentStatus - orderCode:', orderCode);
    console.log('getPaymentStatus - authToken exists:', !!authToken);

    if (!authToken) {
      throw new Error('Token not found');
    }

    const statusUrl = `http://localhost:3333/api/v1/payments/${orderCode}/status`;
    console.log('Fetching from:', statusUrl);

    try {
      const response = await fetch(statusUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          token: `${authToken}`,
        },
      });

      console.log('Payment status API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Payment status API error:', response.statusText, errorText);
        throw new Error(`Payment status API error: ${response.statusText}`);
      }

      const data: PaymentStatusResponse = await response.json();
      console.log('Payment status API response data:', data);

      // Check if the response is successful based on 'success' field
      if (!data.success) {
        throw new Error(data.message || 'Payment status check failed');
      }

      return data;
    } catch (error: any) {
      console.error('getPaymentStatus error:', error);
      throw error;
    }
  },
};
