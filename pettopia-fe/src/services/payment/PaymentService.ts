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
};
