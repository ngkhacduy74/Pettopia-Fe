'use client';

import { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export default function Home() {
  const servicesRef = useRef(null);
  const isInView = useInView(servicesRef, { once: true, amount: 0.3 });

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header />
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src="/sampleimg/herosector.jpg"
            alt="Chú chó hạnh phúc trên giường êm ái"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-teal-900/70 to-cyan-800/60"></div>
        </div>

        <div className="relative z-10 max-w-7xl px-4 sm:px-6 lg:px-8 text-white py-32">
          <div className="max-w-2xl text-left">
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              Pettopia vì sức khỏe của thú cưng
            </h1>
            <p className="text-xl mb-12 text-cyan-50 max-w-xl">
              Thú cưng của bạn xứng đáng được chăm sóc tốt nhất bởi đội ngũ bác sĩ giàu kinh nghiệm và nhân viên tận tâm.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href='/auth/register'>
                <button className="bg-white text-teal-700 px-8 py-3.5 rounded-full font-medium 
                     hover:bg-teal-700 hover:text-white hover:shadow-lg hover:scale-105 
                     transition-all duration-300 inline-flex items-center cursor-pointer">
                  Đăng ký ngay bây giờ
                  <svg
                    className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </Link>
              <Link href='/auth/login'>
                <button className="border-2 border-white text-white px-8 py-3.5 rounded-full font-medium 
                     hover:bg-white hover:text-teal-700 hover:shadow-lg hover:scale-105 
                     transition-all duration-300 inline-flex items-center group cursor-pointer">
                  Đăng nhập
                  <svg
                    className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section ref={servicesRef} className="py-20 bg-gradient-to-b from-teal-100 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Dịch Vụ Của Chúng Tôi</h2>
            <p className="text-xl text-gray-600">Chúng tôi cung cấp đầy đủ các dịch vụ thú y để giữ cho thú cưng khỏe mạnh từ đầu đến đuôi.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 relative">
            {/* Service 1 - Wellness Exams */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition border border-cyan-100 transform hover:-translate-y-2 hover:scale-105 duration-300 cursor-pointer">
              <motion.div
                initial={{ x: -600, y: -200 }}
                animate={isInView ? { x: 0, y: 0 } : { x: -600, y: -200 }}
                transition={{ duration: 0.8, delay: 0.1, type: "spring", stiffness: 60 }}
                className="w-14 h-14 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mb-4"
              >
                <svg className="w-7 h-7 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.9 }}
              >
                <h3 className="text-xl font-semibold mb-3">Hỗ trợ đặt lịch khám</h3>
                <p className="text-gray-600 text-sm mb-4">Hỗ trợ đặt lịch khám giúp kiểm tra định kỳ để đảm bảo thú cưng khỏe mạnh và phát hiện sớm các vấn đề.</p>
                <a href="#" className="text-teal-600 text-sm font-medium hover:text-teal-700 inline-flex items-center">
                  Tìm hiểu thêm →
                </a>
              </motion.div>
            </div>

            {/* Service 2 - Vaccinations */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition border border-cyan-100 transform hover:-translate-y-2 hover:scale-105 duration-300 cursor-pointer">
              <motion.div
                initial={{ x: -400, y: -200 }}
                animate={isInView ? { x: 0, y: 0 } : { x: -400, y: -200 }}
                transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 60 }}
                className="w-14 h-14 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mb-4"
              >
                <svg className="w-7 h-7 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 1.0 }}
              >
                <h3 className="text-xl font-semibold mb-3">Quản lí thú cưng</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Hệ thống có các chức năng quản lí nhằm dễ dàng quản lí thú cưng, bao gồm lưu hồ sơ, lịch tiêm chủng, lịch khám, nhắc lịch và ghi chú sức khỏe chi tiết.
                </p>
                <a href="#" className="text-teal-600 text-sm font-medium hover:text-teal-700 inline-flex items-center">
                  Tìm hiểu thêm →
                </a>
              </motion.div>
            </div>

            {/* Service 3 - Surgery */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition border border-cyan-100 transform hover:-translate-y-2 hover:scale-105 duration-300 cursor-pointer">
              <motion.div
                initial={{ x: 400, y: -200 }}
                animate={isInView ? { x: 0, y: 0 } : { x: 400, y: -200 }}
                transition={{ duration: 0.8, delay: 0.3, type: "spring", stiffness: 60 }}
                className="w-14 h-14 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mb-4"
              >
                <svg className="w-7 h-7 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 1.1 }}
              >
                <h3 className="text-xl font-semibold mb-3">Nhân viên và cộng đồng</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Đội ngũ nhân viên và cộng đồng thú cưng luôn nhiệt tình và sẵn sàng hỗ trợ bạn trong mọi vấn đề liên quan đến sức khỏe và chăm sóc thú cưng.
                </p>
                <a href="#" className="text-teal-600 text-sm font-medium hover:text-teal-700 inline-flex items-center">
                  Tìm hiểu thêm →
                </a>
              </motion.div>
            </div>

            {/* Service 4 - Dental Care */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition border border-cyan-100 transform hover:-translate-y-2 hover:scale-105 duration-300 cursor-pointer">
              <motion.div
                initial={{ x: 600, y: -200 }}
                animate={isInView ? { x: 0, y: 0 } : { x: 600, y: -200 }}
                transition={{ duration: 0.8, delay: 0.4, type: "spring", stiffness: 60 }}
                className="w-14 h-14 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mb-4"
              >
                <svg className="w-7 h-7 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 1.2 }}
              >
                <h3 className="text-xl font-semibold mb-3">Tích hợp AI linh miêu</h3>
                <p className="text-gray-600 text-sm mb-4">Hỗ trợ bạn trong việc đặt lịch và quản lý hồ sơ thú cưng một cách dễ dàng và nhanh chóng.</p>
                <a href="#" className="text-teal-600 text-sm font-medium hover:text-teal-700 inline-flex items-center">
                  Tìm hiểu thêm →
                </a>
              </motion.div>
            </div>
          </div>

          <div className="text-center mt-12">
            <button className="bg-teal-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-teal-700 transition transform hover:-translate-y-2 hover:scale-105 duration-300 cursor-pointer">
              Xem Tất Cả Dịch Vụ
            </button>
          </div>
        </div>
      </section>

      {/* Why Choose Pettopia Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="/sampleimg/sampleimg.jpg"
                  alt="Chú chó Bulldog Pháp mặc áo len vàng"
                  className="w-full h-auto"
                />
              </div>
            </div>

            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-8">
                Tại Sao Chọn Pettopia?
              </h2>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-teal-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Bác Sĩ Thú Y Giàu Kinh Nghiệm
                    </h3>
                    <p className="text-gray-600">
                      Đội ngũ bác sĩ của chúng tôi có hàng chục năm kinh nghiệm trong mọi lĩnh vực chăm sóc sức khỏe thú cưng.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-teal-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />

                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Cơ Sở Vật Chất Hiện Đại
                    </h3>
                    <p className="text-gray-600">
                      Bệnh viện được trang bị công nghệ tiên tiến nhất để chẩn đoán và điều trị.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-teal-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Chăm Sóc Từ Tâm
                    </h3>
                    <p className="text-gray-600">
                      Chúng tôi đối xử với mỗi thú cưng như thành viên gia đình, với sự dịu dàng và quan tâm cá nhân.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-teal-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Dịch Vụ Cấp Cứu
                    </h3>
                    <p className="text-gray-600">
                      Chúng tôi cung cấp dịch vụ cấp cứu trong giờ hành chính và hợp tác với các phòng khám cấp cứu 24/7.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button className="bg-teal-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-teal-700 transition shadow-lg">
                  Tìm Hiểu Thêm Về Chúng Tôi
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-white-200 to-teal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Những người sở hữu thú cưng nói gì
            </h2>
            <p className="text-xl text-gray-600">
              Đừng chỉ tin lời chúng tôi. Đây là những gì khách hàng nói về trải nghiệm tại Pettopia.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-md border border-cyan-100">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-amber-400 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-6">
                "Trang web của Pettopia thực sự làm cho việc đặt lịch khám thú cưng trở nên dễ dàng và thuận tiện. Tôi rất ấn tượng với cách họ quản lý hồ sơ thú cưng của tôi và luôn nhắc nhở tôi về các cuộc hẹn sắp tới."
              </p>
              <div>
                <p className="font-semibold text-gray-900">Duy Valỏ</p>
                <p className="text-gray-500 text-sm">Chủ của 2 con chó</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-md border border-cyan-100">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-amber-400 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-6">
                "Đặt lịch khám cho mèo của tôi chưa bao giờ dễ dàng hơn thế. Giao diện người dùng rất thân thiện và tôi yêu cách họ lưu trữ tất cả thông tin sức khỏe của mèo tôi ở một nơi."
              </p>
              <div>
                <p className="font-semibold text-gray-900">Duong Nguyen</p>
                <p className="text-gray-500 text-sm">Chủ của một con mèo đã được khám tại Pettopia</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-md border border-cyan-100">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-amber-400 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-6">
                "Dù là lần đầu tiên tôi sử dụng dịch vụ của Pettopia, tôi đã rất ấn tượng với sự chuyên nghiệp và tận tâm của đội ngũ nhân viên. Họ thực sự quan tâm đến sức khỏe và hạnh phúc của thú cưng."
              </p>
              <div>
                <p className="font-semibold text-gray-900">Ultra404</p>
                <p className="text-gray-500 text-sm">Chủ của một chú chim bồ câu</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Image Section */}
      {/* <section>
        <img
          src="./sampleimg/samplebg.jpg"
          alt="Hình ảnh mẫu"
          className="mx-auto rounded-xl shadow-lg"
        />
      </section> */}

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-teal-600 to-cyan-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
           Bạn là bác sĩ và muốn tham gia cùng chúng tôi?
          </h2>
          <p className="text-xl text-cyan-50 mb-8">
            Hãy đăng ký ngay hôm nay để trở thành một phần của đội ngũ chăm sóc thú cưng tận tâm và chuyên nghiệp của chúng tôi.
          </p>
          <Link href="/join-us" className="mr-4">
            <button className="bg-white text-teal-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-cyan-50 transition shadow-xl">
              Tham gia ngay?
            </button>
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}