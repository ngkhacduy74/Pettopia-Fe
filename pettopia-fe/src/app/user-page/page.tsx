'use client'
import React, { useState } from 'react';
import Chat from '@/components/Chat';
import UserNavbar from '@/components/UserNavbar';
import { image } from 'framer-motion/client';
import Link from "next/link";

export default function PetCareApp() {
    const [showSearch, setShowSearch] = useState(false);
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);
    const [showChat, setShowChat] = useState(false);
    const [chatMessage, setChatMessage] = useState('');
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const recentItems = [
        {
            id: 1,
            title: 'Hồ sơ thú cưng',
            image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&h=200&fit=crop',
            time: '1w ago',
            icon: '🐾'
        },
        {
            id: 2,
            title: 'Lịch khám sắp tới',
            image: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=400&h=200&fit=crop',
            time: '2d ago',
            icon: '📅'
        },
        {
            id: 3,
            title: 'Nhật ký hôm nay',
            image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=1443&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            time: '1d ago',
            icon: '📝',
            color: 'from-teal-600 to-cyan-600'
        },
        {
            id: 4,
            title: 'Community',
            image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=200&fit=crop',
            time: '3h ago',
            icon: '💬'
        },
        {
            id: 5,
            title: 'Dịch vụ ký gửi',
            image: 'https://images.unsplash.com/photo-1548620848-d375c7919ea2?q=80&w=1469&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            time: '1w ago',
            icon: '🏨',
            color: 'from-teal-500 to-cyan-500'
        }
    ];

    const quickActions = [
        {
            id: 1,
            title: 'Quản lí hồ sơ Pet',
            description: 'Thông tin, sức khỏe, lịch sử khám',
            icon: '',
            image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&h=200&fit=crop'
        },
        {
            id: 2,
            title: 'Đặt lịch khám',
            description: 'Đặt hẹn với bác sĩ thú y',
            icon: '',
            color: 'from-teal-600 to-cyan-600',
            image: 'https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZG9nfGVufDB8fDB8fHww'
        },
        {
            id: 3,
            title: 'Pet Hotel & Services',
            description: 'Dịch vụ ký gửi và chăm sóc',
            icon: '',
            color: 'from-cyan-600 to-teal-600',
            image: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8ZG9nfGVufDB8fDB8fHww'
        }
    ];

    const chatSuggestions = [
        { icon: '🐾', text: 'Quản lí hồ sơ Pet', tag: 'New' },
        { icon: '📝', text: 'Viết nhật ký cho pet' },
        { icon: '📊', text: 'Xem báo cáo sức khỏe' },
        { icon: '✅', text: 'Tạo nhắc nhở khám định kỳ', tag: 'New' }
    ];

    return (
        <div className="flex h-screen bg-gradient-to-b from-teal-50 to-white text-gray-900">
            <UserNavbar setShowSearch={setShowSearch} showSearch={showSearch} />
            {/* Main Content */}
            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-teal-50 to-white">
                <div className="max-w-6xl mx-auto p-12">
                    {/* Header */}
                    <h1 className="text-5xl font-bold mb-12 text-gray-900">Trang chủ</h1>
                    {/* Pet Registration Banner */}
                    <section className="mb-12" aria-labelledby="register-heading">
                        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-8 relative overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
                            {/* Background decoration */}
                            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" aria-hidden="true" />
                            <div className="absolute left-0 bottom-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" aria-hidden="true" />

                            <div className="relative z-10 flex items-center justify-between flex-wrap gap-6">
                                <div className="flex-1 min-w-[300px]">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-3xl text-white font-bold" aria-hidden="true"></span>
                                        <h2 id="register-heading" className="text-3xl font-bold text-white">
                                            Bạn đã đăng ký thú cưng chưa?
                                        </h2>
                                    </div>
                                    <p className="text-cyan-50 text-lg mb-6">
                                        Đăng ký hồ sơ để theo dõi sức khỏe và chăm sóc thú cưng của bạn tốt hơn
                                    </p>
                                    <button
                                        onClick={() => setShowRegisterModal(true)}
                                        className="bg-white text-teal-700 px-8 py-4 rounded-full font-semibold hover:bg-teal-50 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-teal-600"
                                    >
                                        Đăng ký ngay →
                                    </button>
                                </div>

                                {/* Decorative pet icons */}
                                <div className="flex gap-4 text-6xl opacity-80">
                                    <span className="animate-bounce" style={{ animationDelay: '0s', animationDuration: '2s' }}>🐕</span>
                                    <span className="animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '2s' }}>🐈</span>
                                    <span className="animate-bounce" style={{ animationDelay: '0.6s', animationDuration: '2s' }}>🐇</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <Link href="/user-pet">Đến trang User Pet</Link>
                        </div>
                    </section>
                    {/* Recently Visited */}
                    <div className="mb-12">
                        <div className="flex items-center gap-2 mb-6">
                            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h2 className="text-2xl font-bold text-gray-900">Truy cập gần đây</h2>
                        </div>
                        <div className="grid grid-cols-5 gap-4">
                            {recentItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="group cursor-pointer"
                                    onMouseEnter={() => setHoveredCard(item.id)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                >
                                    <div className={`rounded-xl overflow-hidden mb-3 aspect-video transition-all duration-300 shadow-md hover:shadow-xl ${hoveredCard === item.id ? 'scale-105' : ''}`}>
                                        {item.image ? (
                                            <div
                                                className="w-full h-full bg-cover bg-center"
                                                style={{ backgroundImage: `url(${item.image})` }}
                                            />
                                        ) : (
                                            <div className={`w-full h-full bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                                                <span className="text-4xl">{item.icon}</span>
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-sm mb-1 text-gray-900">{item.title}</h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <div className="w-4 h-4 bg-teal-100 rounded-full" />
                                        <span>{item.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <h2 className="text-2xl font-bold text-gray-900">Thao tác nhanh</h2>
                        </div>
                        <div className="grid grid-cols-3 gap-6">
                            {quickActions.map((item) => (
                                <div
                                    key={item.id}
                                    className="rounded-2xl p-8 cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl relative overflow-hidden"
                                    style={item.image ? { backgroundImage: `url(${item.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                                >
                                    <div className="relative z-10">
                                        <div className="text-5xl mb-4">{item.icon}</div>
                                        <h3 className="font-bold text-xl mb-2 text-white">{item.title}</h3>
                                        <p className="text-sm text-cyan-50">{item.description}</p>
                                    </div>
                                    {/* Nếu muốn thêm lớp phủ màu, thêm một div absolute phía dưới */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-cyan-600 opacity-40 rounded-2xl"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

            </div>

            {/* Pet Care AI Assistant Promo
                  <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-8 mb-12 relative overflow-hidden shadow-lg">
                      <div className="relative z-10">
                          <h2 className="text-3xl font-bold mb-2 text-white">Trợ lý AI chăm sóc thú cưng</h2>
                          <p className="text-cyan-50 mb-6 text-lg">Hỏi đáp mọi thắc mắc về sức khỏe và chăm sóc thú cưng</p>
                          <button
                              onClick={() => setShowChat(true)}
                              className="bg-white text-teal-700 px-8 py-3 rounded-full font-semibold hover:bg-teal-50 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                          >
                              Trò chuyện ngay
                          </button>
                      </div>
                      <div className="absolute right-8 top-1/2 -translate-y-1/2 text-7xl opacity-30">
                          🐕‍🦺
                      </div>
                  </div> */}


            {/* Search Modal */}
            {showSearch && (
                <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50" onClick={() => setShowSearch(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-teal-100" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b border-teal-100">
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm..."
                                    className="flex-1 bg-transparent outline-none text-gray-900"
                                    autoFocus
                                />
                                <button onClick={() => setShowSearch(false)} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="p-4">
                            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-teal-50 text-left transition-colors">
                                <span className="text-base"></span>
                                <span className="text-gray-700">Hồ sơ Pet</span>
                            </button>
                            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-teal-50 text-left transition-colors">
                                <span className="text-base"></span>
                                <span className="text-gray-700">Community</span>
                            </button>
                            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-teal-50 text-left transition-colors">
                                <span className="text-base"></span>
                                <span className="text-gray-700">Nhật ký Pet</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pet Registration Modal */}
            {showRegisterModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                    onClick={() => setShowRegisterModal(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="register-modal-title"
                >
                    <div
                        className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-teal-100 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6 text-white">
                            <div className="flex justify-between items-center">
                                <h3 id="register-modal-title" className="text-2xl font-bold">Đăng ký thú cưng</h3>
                                <button
                                    onClick={() => setShowRegisterModal(false)}
                                    className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                                    aria-label="Đóng"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-cyan-50 mt-2">Tạo hồ sơ cho người bạn bốn chân của bạn</p>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-4">
                            <div>
                                <label htmlFor="pet-name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên thú cưng *
                                </label>
                                <input
                                    id="pet-name"
                                    type="text"
                                    placeholder="VD: Milu, Cún..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                                />
                            </div>

                            <div>
                                <label htmlFor="pet-type" className="block text-sm font-medium text-gray-700 mb-2">
                                    Loại thú cưng *
                                </label>
                                <select
                                    id="pet-type"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                                >
                                    <option value="">Chọn loại thú cưng</option>
                                    <option value="dog">Chó</option>
                                    <option value="cat">Mèo</option>
                                    <option value="rabbit">Thỏ</option>
                                    <option value="bird">Chim</option>
                                    <option value="other">Khác</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="pet-breed" className="block text-sm font-medium text-gray-700 mb-2">
                                    Giống
                                </label>
                                <input
                                    id="pet-breed"
                                    type="text"
                                    placeholder="VD: Golden Retriever, Mèo Ba Tư..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="pet-age" className="block text-sm font-medium text-gray-700 mb-2">
                                        Tuổi
                                    </label>
                                    <input
                                        id="pet-age"
                                        type="number"
                                        placeholder="VD: 2"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="pet-gender" className="block text-sm font-medium text-gray-700 mb-2">
                                        Giới tính
                                    </label>
                                    <select
                                        id="pet-gender"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                                    >
                                        <option value="">Chọn</option>
                                        <option value="male">Đực</option>
                                        <option value="female">Cái</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowRegisterModal(false)}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={() => {
                                        // Xử lý đăng ký ở đây
                                        alert('Đăng ký thành công!');
                                        setShowRegisterModal(false);
                                    }}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg font-medium"
                                >
                                    Đăng ký
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Widget */}
            {showChat && (
                <Chat
                    showChat={showChat}
                    setShowChat={setShowChat}
                    chatMessage={chatMessage}
                    setChatMessage={setChatMessage}
                    chatSuggestions={chatSuggestions}
                />
            )}

            {/* Chat Button (when closed) */}
            {!showChat && (
                <button
                    onClick={() => setShowChat(true)}
                    className="fixed bottom-4 right-4 w-14 h-14 sm:w-16 sm:h-16 sm:bottom-6 sm:right-6 bg-gradient-to-br from-teal-600 to-cyan-400 rounded-full shadow-lg flex items-center justify-center text-xl sm:text-2xl hover:scale-110 transition-transform z-40 hover:shadow-xl"

                >
                    💬
                </button>
            )}

        </div>
    );
}