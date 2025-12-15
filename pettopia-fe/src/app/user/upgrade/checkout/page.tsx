'use client'

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');
  const billing = searchParams.get('billing');

  const planDetails = {
    plus: {
      name: 'Pettopia Plus',
      monthlyPrice: 49000,
      yearlyPrice: 490000,
    },
    premium: {
      name: 'Pettopia Premium',
      monthlyPrice: 99000,
      yearlyPrice: 990000,
    },
  };

  const currentPlan = planDetails[plan as keyof typeof planDetails];
  const price = billing === 'yearly' ? currentPlan?.yearlyPrice : currentPlan?.monthlyPrice;

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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border-2 border-teal-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Thanh toán</h2>

              {/* Plan Summary */}
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 mb-8">
                <p className="text-sm text-gray-600 mb-2">Gói được chọn</p>
                <p className="text-2xl font-bold text-gray-900">{currentPlan?.name}</p>
                <p className="text-sm text-gray-600 mt-2">
                  {billing === 'yearly' ? 'Thanh toán hàng năm' : 'Thanh toán hàng tháng'}
                </p>
              </div>

              {/* Payment Form */}
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="user@example.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    placeholder="+84 1234567890"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div className="border-t-2 border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin thanh toán</h3>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Số thẻ
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Ngày hết hạn
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        CVC
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <input type="checkbox" id="terms" className="mt-1" defaultChecked />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    Tôi đồng ý với các <a href="#" className="text-teal-600 hover:underline">điều khoản dịch vụ</a> và <a href="#" className="text-teal-600 hover:underline">chính sách bảo mật</a>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Thanh toán {price?.toLocaleString('vi-VN')}₫
                </button>
              </form>

              <p className="text-xs text-gray-500 text-center mt-6">
                Thanh toán được bảo vệ bằng mã hóa SSL
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-2xl border-2 border-teal-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Đơn hàng</h3>

              <div className="space-y-4 pb-6 border-b-2 border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-600">{currentPlan?.name}</span>
                  <span className="font-semibold text-gray-900">
                    {price?.toLocaleString('vi-VN')}₫
                  </span>
                </div>

                {billing === 'yearly' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tiết kiệm (17%)</span>
                    <span className="font-semibold text-teal-600">
                      -{(price! * 0.17).toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-6 mb-6">
                <span className="font-semibold text-gray-900">Tổng cộng</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  {price?.toLocaleString('vi-VN')}₫
                </span>
              </div>

              {billing === 'yearly' && (
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 text-sm text-gray-600">
                  <p className="font-semibold text-gray-900 mb-1">💡 Tiết kiệm thêm</p>
                  <p>Bạn tiết kiệm {((price! / 12) * 0.17 * 12).toLocaleString('vi-VN')}₫ so với thanh toán hàng tháng</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
