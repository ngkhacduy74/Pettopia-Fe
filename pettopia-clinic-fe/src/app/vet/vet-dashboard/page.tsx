'use client'
import React, { useState } from 'react';
import UserNavbar from '@/components/UserNavbar';
export default function VetPage() {
    const [showSearch, setShowSearch] = useState(false);
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    const recentPatients = [
        {
            id: 1,
            petName: 'Milu',
            owner: 'Nguyễn Văn A',
            type: 'Chó Golden',
            image: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400&h=200&fit=crop',
            lastVisit: '2 ngày trước',
            status: 'Khỏe mạnh',
            statusColor: 'bg-green-100 text-green-700'
        },
        {
            id: 2,
            petName: 'Mun',
            owner: 'Trần Thị B',
            type: 'Mèo Ba Tư',
            image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=200&fit=crop',
            lastVisit: '1 tuần trước',
            status: 'Theo dõi',
            statusColor: 'bg-yellow-100 text-yellow-700'
        },
        {
            id: 3,
            petName: 'Lucky',
            owner: 'Lê Văn C',
            type: 'Chó Husky',
            image: 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=400&h=200&fit=crop',
            lastVisit: 'Hôm nay',
            status: 'Điều trị',
            statusColor: 'bg-red-100 text-red-700'
        },
        {
            id: 4,
            petName: 'Mèo Miu',
            owner: 'Phạm Thị D',
            type: 'Mèo Anh lông ngắn',
            image: 'https://images.unsplash.com/photo-1573865526739-10c1d3a1e83e?w=400&h=200&fit=crop',
            lastVisit: '3 ngày trước',
            status: 'Khỏe mạnh',
            statusColor: 'bg-green-100 text-green-700'
        },
        {
            id: 5,
            petName: 'Bông',
            owner: 'Hoàng Văn E',
            type: 'Chó Poodle',
            image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=200&fit=crop',
            lastVisit: '5 ngày trước',
            status: 'Tái khám',
            statusColor: 'bg-blue-100 text-blue-700'
        }
    ];

    const quickActions = [
        {
            id: 1,
            title: 'Hồ sơ bệnh nhân',
            description: 'Xem & quản lý hồ sơ PET',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            color: 'from-teal-600 to-cyan-600',
            stats: '156 hồ sơ'
        },
        {
            id: 2,
            title: 'Lịch khám hôm nay',
            description: 'Quản lí lịch khám & tư vấn',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            color: 'from-blue-600 to-indigo-600',
            stats: '8 lịch hẹn'
        },
        {
            id: 3,
            title: 'Gửi thông báo',
            description: 'Nhắc nhở tái khám & tiêm chủng',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            ),
            color: 'from-purple-600 to-pink-600',
            stats: '12 thông báo'
        },
        {
            id: 4,
            title: 'Báo cáo sức khỏe',
            description: 'Tạo & quản lý báo cáo',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            color: 'from-orange-600 to-red-600',
            stats: '23 báo cáo'
        }
    ];

    const upcomingAppointments = [
        { time: '09:00', petName: 'Milu', owner: 'Nguyễn Văn A', type: 'Khám định kỳ' },
        { time: '10:30', petName: 'Bông', owner: 'Hoàng Văn E', type: 'Tái khám' },
        { time: '14:00', petName: 'Lucky', owner: 'Lê Văn C', type: 'Điều trị' },
        { time: '15:30', petName: 'Mèo Miu', owner: 'Phạm Thị D', type: 'Tiêm chủng' }
    ];

    return (
        <div className="flex h-screen bg-gradient-to-b from-teal-50 to-white text-gray-900">
            {/* Header/Navbar */}
            <UserNavbar setShowSearch={setShowSearch} showSearch={showSearch} />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto p-6">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h2 className="text-4xl font-bold text-gray-900 mb-2">Xin chào, Bác sĩ!</h2>
                    <p className="text-gray-600 text-lg">Hôm nay là {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-teal-100">
                        <div className="flex items-center justify-between mb-2">
                            <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-sm text-green-600 font-medium">+12%</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">156</div>
                        <div className="text-sm text-gray-600">Tổng bệnh nhân</div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-teal-100">
                        <div className="flex items-center justify-between mb-2">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm text-blue-600 font-medium">Hôm nay</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">8</div>
                        <div className="text-sm text-gray-600">Lịch hẹn</div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-teal-100">
                        <div className="flex items-center justify-between mb-2">
                            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span className="text-sm text-orange-600 font-medium">Tuần này</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">23</div>
                        <div className="text-sm text-gray-600">Báo cáo đã tạo</div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-teal-100">
                        <div className="flex items-center justify-between mb-2">
                            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span className="text-sm text-purple-600 font-medium">Chờ gửi</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">12</div>
                        <div className="text-sm text-gray-600">Thông báo</div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <div className="w-1 h-6 bg-gradient-to-b from-teal-600 to-cyan-600 rounded"></div>
                        Thao tác nhanh
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {quickActions.map((action) => (
                            <div
                                key={action.id}
                                onClick={() => {
                                    if (action.id === 3) setShowNotificationModal(true);
                                    if (action.id === 4) setShowReportModal(true);
                                }}
                                className="bg-white rounded-xl p-6 shadow-sm border border-teal-100 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group"
                            >
                                <div className={`w-16 h-16 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                                    {action.icon}
                                </div>
                                <h4 className="font-bold text-lg text-gray-900 mb-2">{action.title}</h4>
                                <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                                <div className="text-xs font-semibold text-teal-600">{action.stats}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Patients - Takes 2 columns */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Bệnh nhân gần đây
                            </h3>
                            <button className="flex items-center gap-2 px-4 py-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                Lọc
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {recentPatients.map((patient) => (
                                <div
                                    key={patient.id}
                                    className="bg-white rounded-xl overflow-hidden shadow-sm border border-teal-100 hover:shadow-lg transition-all duration-300 cursor-pointer"
                                    onMouseEnter={() => setHoveredCard(patient.id)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                >
                                    <div 
                                        className="h-32 bg-cover bg-center transition-transform duration-300"
                                        style={{ 
                                            backgroundImage: `url(${patient.image})`,
                                            transform: hoveredCard === patient.id ? 'scale(1.05)' : 'scale(1)'
                                        }}
                                    />
                                    <div className="p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h4 className="font-bold text-lg text-gray-900">{patient.petName}</h4>
                                                <p className="text-sm text-gray-600">{patient.type}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${patient.statusColor}`}>
                                                {patient.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">👤 {patient.owner}</span>
                                            <span className="text-gray-500">{patient.lastVisit}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upcoming Appointments - Takes 1 column */}
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Lịch hẹn hôm nay
                        </h3>
                        <div className="bg-white rounded-xl shadow-sm border border-teal-100 p-4 space-y-3">
                            {upcomingAppointments.map((apt, index) => (
                                <div key={index} className="flex gap-3 p-3 rounded-lg hover:bg-teal-50 transition-colors cursor-pointer">
                                    <div className="flex-shrink-0">
                                        <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl flex flex-col items-center justify-center text-white">
                                            <span className="text-xs font-medium">
                                                {apt.time.split(':')[0]}
                                            </span>
                                            <span className="text-lg font-bold">
                                                {apt.time.split(':')[1]}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="font-bold text-gray-900">{apt.petName}</h5>
                                        <p className="text-sm text-gray-600">{apt.owner}</p>
                                        <span className="inline-block mt-1 px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full font-medium">
                                            {apt.type}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            <button className="w-full mt-4 py-3 border-2 border-dashed border-teal-300 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors font-medium">
                                + Thêm lịch hẹn
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Modal */}
            {showSearch && (
                <div 
                    className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50" 
                    onClick={() => setShowSearch(false)}
                >
                    <div 
                        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-teal-100" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 border-b border-teal-100">
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm bệnh nhân, hồ sơ..."
                                    className="flex-1 bg-transparent outline-none text-gray-900"
                                    autoFocus
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Modal */}
            {showNotificationModal && (
                <div 
                    className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                    onClick={() => setShowNotificationModal(false)}
                >
                    <div 
                        className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-teal-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white rounded-t-2xl">
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-bold">Gửi thông báo</h3>
                                <button
                                    onClick={() => setShowNotificationModal(false)}
                                    className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-purple-50 mt-2">Nhắc nhở chủ pet về lịch hẹn</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Chọn bệnh nhân
                                </label>
                                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
                                    <option>Milu - Nguyễn Văn A</option>
                                    <option>Lucky - Lê Văn C</option>
                                    <option>Bông - Hoàng Văn E</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Loại thông báo
                                </label>
                                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
                                    <option>Tái khám</option>
                                    <option>Tiêm chủng</option>
                                    <option>Xét nghiệm</option>
                                    <option>Uống thuốc</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nội dung
                                </label>
                                <textarea 
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    rows={4}
                                    placeholder="Nhập nội dung thông báo..."
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowNotificationModal(false)}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={() => {
                                        alert('Thông báo đã được gửi thành công!');
                                        setShowNotificationModal(false);
                                    }}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md"
                                >
                                    Gửi ngay
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Report Modal */}
            {showReportModal && (
                <div 
                    className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                    onClick={() => setShowReportModal(false)}
                >
                    <div 
                        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-teal-100 max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 text-white rounded-t-2xl sticky top-0 z-10">
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-bold">Tạo báo cáo sức khỏe</h3>
                                <button
                                    onClick={() => setShowReportModal(false)}
                                    className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-orange-50 mt-2">Ghi chú và đánh giá tình trạng</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Bệnh nhân
                                </label>
                                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none">
                                    <option>Milu - Nguyễn Văn A</option>
                                    <option>Lucky - Lê Văn C</option>
                                    <option>Bông - Hoàng Văn E</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Chẩn đoán
                                </label>
                                <input
                                    type="text"
                                    placeholder="Nhập chẩn đoán..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Triệu chứng
                                </label>
                                <textarea 
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                    rows={3}
                                    placeholder="Mô tả triệu chứng..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phương pháp điều trị
                                </label>
                                <textarea 
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                    rows={3}
                                    placeholder="Mô tả phương pháp điều trị..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Đơn thuốc
                                </label>
                                <textarea 
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                    rows={2}
                                    placeholder="Liệt kê các loại thuốc và liều lượng..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ghi chú thêm
                                </label>
                                <textarea 
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                    rows={3}
                                    placeholder="Ghi chú, lưu ý cho chủ pet..."
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowReportModal(false)}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={() => {
                                        alert('Báo cáo đã được lưu thành công!');
                                        setShowReportModal(false);
                                    }}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all shadow-md"
                                >
                                    Lưu báo cáo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}