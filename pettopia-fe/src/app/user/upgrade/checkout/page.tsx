'use client'

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');

  useEffect(() => {
    // Check payment status from query params or localStorage
    const status = searchParams.get('status');
    if (status === 'success') {
      setPaymentStatus('success');
    } else if (status === 'failed') {
      setPaymentStatus('failed');
    }
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang xử lý...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/user/upgrade">
          <button className="mb-8 flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </button>
        </Link>

        <div className="bg-white rounded-2xl border-2 border-teal-200 p-8 max-w-2xl mx-auto">
          {paymentStatus === 'success' ? (
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Thanh toán thành công</h2>
              <p className="text-gray-600 mb-8">
                Cảm ơn bạn đã nâng cấp. Tài khoản của bạn sẽ được cập nhật ngay.
              </p>
              <Link href="/user/dashboard">
                <button className="px-8 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors">
                  Về trang chủ
                </button>
              </Link>
            </div>
          ) : paymentStatus === 'failed' ? (
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Thanh toán thất bại</h2>
              <p className="text-gray-600 mb-8">
                Đã xảy ra lỗi khi xử lý thanh toán của bạn. Vui lòng thử lại.
              </p>
              <Link href="/user/upgrade">
                <button className="px-8 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors">
                  Thử lại
                </button>
              </Link>
            </div>
          ) : (
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <svg className="w-16 h-16 text-blue-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Đang chuyển hướng thanh toán</h2>
              <p className="text-gray-600 mb-8">
                Bạn sẽ được chuyển đến trang thanh toán trong giây lát...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
