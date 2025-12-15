'use client'

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UpgradePage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<'plus' | 'premium' | null>(null);

  const plans = [
    {
      id: 'plus',
      name: 'Pettopia Plus',
      monthlyPrice: 49000,
      yearlyPrice: 490000,
      description: 'Cho những người yêu thích thú cưng',
      features: [
        'Tư vấn trực tuyến với bác sĩ thú y',
        'Lịch sử khám chi tiết',
        'Ưu tiên đặt lịch khám',
        'Thông báo sức khỏe thú cưng',
        'Lưu trữ hồ sơ không giới hạn',
      ],
      icon: '⭐',
      color: 'from-yellow-400 to-orange-500',
    },
    {
      id: 'premium',
      name: 'Pettopia Premium',
      monthlyPrice: 99000,
      yearlyPrice: 990000,
      description: 'Quản lý toàn diện sức khỏe thú cưng',
      features: [
        'Tất cả tính năng của Plus',
        'Tư vấn 24/7 với bác sĩ thú y',
        'Video call khám bệnh',
        'Ghi chép chẩn đoán AI',
        'Quản lý thuốc tự động',
        'Ưu tiên cao nhất',
        'Hỗ trợ khách hàng VIP',
      ],
      icon: '💎',
      color: 'from-purple-500 to-pink-500',
      popular: true,
    },
  ];

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const handleUpgrade = (planId: string) => {
    setSelectedPlan(planId as 'plus' | 'premium');
    // Redirect to payment page
    router.push(`/user/upgrade/checkout?plan=${planId}&billing=${billingCycle}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 opacity-5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Nâng cấp Premium
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Trải nghiệm đầy đủ Pettopia với các tính năng vượt trội
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-teal-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-teal-300'
                }`}
              >
                Hàng tháng
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-lg font-medium transition-all relative ${
                  billingCycle === 'yearly'
                    ? 'bg-teal-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-teal-300'
                }`}
              >
                Hàng năm
                {billingCycle === 'yearly' && (
                  <span className="absolute -top-3 -right-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    Tiết kiệm 17%
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                plan.popular
                  ? 'border-teal-500 shadow-2xl scale-105'
                  : 'border-teal-200 shadow-lg hover:shadow-xl hover:border-teal-400'
              } bg-white`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-0 right-0 left-0 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-center py-2 text-sm font-semibold">
                  Phổ biến nhất
                </div>
              )}

              <div className={`p-8 ${plan.popular ? 'pt-16' : ''}`}>
                {/* Plan Header */}
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-4xl">{plan.icon}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                  </div>
                </div>

                {/* Pricing */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                      {billingCycle === 'monthly' ? plan.monthlyPrice.toLocaleString('vi-VN') : plan.yearlyPrice.toLocaleString('vi-VN')}
                    </span>
                    <span className="text-gray-600 font-medium">
                      {billingCycle === 'monthly' ? '₫/tháng' : '₫/năm'}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <p className="text-sm text-gray-500">
                      {(plan.yearlyPrice / 12).toLocaleString('vi-VN')}₫ per month
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:shadow-lg hover:scale-105'
                      : 'border-2 border-teal-600 text-teal-600 hover:bg-teal-50'
                  }`}
                >
                  {selectedPlan === plan.id ? 'Đang xử lý...' : 'Nâng cấp ngay'}
                </button>

                {/* Terms */}
                <p className="text-xs text-gray-500 text-center mt-4">
                  Bạn có thể hủy bất cứ lúc nào
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Câu hỏi thường gặp
          </h2>

          <div className="grid gap-6">
            {[
              {
                question: 'Tôi có thể nâng cấp hoặc hạ cấp bất cứ lúc nào không?',
                answer: 'Có, bạn có thể thay đổi gói của mình bất cứ lúc nào. Các thay đổi sẽ có hiệu lực từ chu kỳ thanh toán tiếp theo.',
              },
              {
                question: 'Có phí hủy không?',
                answer: 'Không, không có phí hủy. Bạn có thể hủy đăng ký của mình bất cứ lúc nào mà không cần lo lắng.',
              },
              {
                question: 'Có thử nghiệm miễn phí không?',
                answer: 'Chúng tôi cung cấp 7 ngày dùng thử miễn phí cho tất cả các gói Premium. Không cần thẻ tín dụng để bắt đầu.',
              },
              {
                question: 'Tôi nên chọn gói nào?',
                answer: 'Pettopia Plus là tốt nhất cho những người bắt đầu, trong khi Pettopia Premium lý tưởng cho những người quản lý nhiều thú cưng hoặc có nhu cầu sức khỏe phức tạp.',
              },
            ].map((faq, index) => (
              <details
                key={index}
                className="group border-2 border-teal-200 rounded-lg p-6 cursor-pointer hover:border-teal-400 transition-colors"
              >
                <summary className="flex items-center justify-between font-semibold text-gray-900">
                  {faq.question}
                  <svg
                    className="w-6 h-6 text-teal-600 group-open:rotate-180 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </summary>
                <p className="mt-4 text-gray-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            So sánh tính năng
          </h2>

          <div className="border-2 border-teal-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-teal-200 bg-teal-50">
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Tính năng</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-900">Plus</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-900">Premium</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Tư vấn trực tuyến', plus: true, premium: true },
                  { feature: 'Lịch sử khám chi tiết', plus: true, premium: true },
                  { feature: 'Ưu tiên đặt lịch', plus: true, premium: true },
                  { feature: 'Tư vấn 24/7', plus: false, premium: true },
                  { feature: 'Video call khám bệnh', plus: false, premium: true },
                  { feature: 'Ghi chép chẩn đoán AI', plus: false, premium: true },
                  { feature: 'Quản lý thuốc tự động', plus: false, premium: true },
                  { feature: 'Hỗ trợ VIP', plus: false, premium: true },
                ].map((row, index) => (
                  <tr key={index} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-6 py-4 font-medium text-gray-900">{row.feature}</td>
                    <td className="px-6 py-4 text-center">
                      {row.plus ? (
                        <svg className="w-5 h-5 text-teal-600 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-300 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row.premium && (
                        <svg className="w-5 h-5 text-teal-600 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="mt-20 py-12 bg-gradient-to-r from-teal-50 to-cyan-50 border-t-2 border-b-2 border-teal-300">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Bắt đầu hành trình chăm sóc tốt hơn ngay hôm nay
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Hàng ngàn chủ thú cưng đã tin tưởng Pettopia
          </p>
          <Link href="/user/home">
            <button className="px-8 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors">
              Quay lại trang chủ
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
