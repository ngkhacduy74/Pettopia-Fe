'use client'
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
    CurrencyDollarIcon,
    CalendarIcon,
    UserGroupIcon,
    HomeIcon,
    BeakerIcon,
    CheckCircleIcon,
    XMarkIcon,
    EnvelopeIcon,
} from '@heroicons/react/24/outline';
export default function Dashboard() {
    const [showSearch, setShowSearch] = useState(false);
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [clinicId, setClinicId] = useState<string | null>(null);
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [inviteEmails, setInviteEmails] = useState('');
    const [inviteMessage, setInviteMessage] = useState('');

    const handleInvite = () => {
        // Logic gửi lời mời
        console.log('Sending invites to:', inviteEmails);
        console.log('Message:', inviteMessage);
        setShowInviteForm(false);
        setInviteEmails('');
        setInviteMessage('');
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const id = localStorage.getItem('clinicId');
        if (id) setClinicId(id);
    }, []);

    // Mock data cho doanh thu
    const revenueData = [
        { name: 'T1', revenue: 45, appointments: 120 },
        { name: 'T2', revenue: 52, appointments: 145 },
        { name: 'T3', revenue: 48, appointments: 132 },
        { name: 'T4', revenue: 61, appointments: 168 },
        { name: 'T5', revenue: 55, appointments: 151 },
        { name: 'T6', revenue: 67, appointments: 182 },
    ];

    // Mock data cho dịch vụ
    const serviceData = [
        { name: 'Khám bệnh', value: 45, color: '#14b8a6' },
        { name: 'Tiêm phòng', value: 30, color: '#06b6d4' },
        { name: 'Ký gửi', value: 15, color: '#0e7490' },
        { name: 'Khác', value: 10, color: '#0891b2' }
    ];

    const statsCards = [
        {
            id: 1,
            title: 'Doanh thu tháng này',
            value: '67,000,000 ₫',
            change: '+12.5%',
            icon: <CurrencyDollarIcon className="h-6 w-6 text-gray-600" />,
            color: 'from-teal-600 to-cyan-600',
            trend: 'up',
        },
        {
            id: 2,
            title: 'Lịch hẹn hôm nay',
            value: '24',
            change: '+3 mới',
            icon: <CalendarIcon className="h-6 w-6 text-gray-600" />,
            color: 'from-cyan-600 to-teal-600',
            trend: 'up',
        },
        {
            id: 3,
            title: 'Bác sĩ đang làm việc',
            value: '8/12',
            change: '4 nghỉ',
            icon: <UserGroupIcon className="h-6 w-6 text-gray-600" />,
            color: 'from-teal-500 to-cyan-500',
            trend: 'neutral',
        },
        {
            id: 4,
            title: 'Pet đang ký gửi',
            value: '15',
            change: '85% công suất',
            icon: <HomeIcon className="h-6 w-6 text-gray-600" />,
            color: 'from-cyan-500 to-teal-500',
            trend: 'up',
        },
    ];

    const quickActions = [
        {
            id: 1,
            title: 'Quản lý Bác sĩ',
            description: 'Xem và quản lý danh sách bác sĩ thú y',
            icon: <UserGroupIcon className="h-6 w-6 text-gray-600" />,
            image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&auto=format&fit=crop&q=60',
            link: '/clinic/doctors',
        },
        {
            id: 2,
            title: 'Dịch vụ Tiêm phòng',
            description: 'Quản lý lịch tiêm và vaccine',
            icon: <BeakerIcon className="h-6 w-6 text-gray-600" />,
            image: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=800&auto=format&fit=crop&q=60',
            link: '/clinic/vaccination',
        },
        {
            id: 3,
            title: 'Dịch vụ Ký gửi',
            description: 'Quản lý Pet tạm trú và chăm sóc',
            icon: <HomeIcon className="h-6 w-6 text-gray-600" />,
            image: 'https://images.unsplash.com/photo-1548620848-d375c7919ea2?w=800&Amp;auto=format&fit=crop&q=60',
            link: '/clinic/boarding',
        },
    ];

    const recentActivities = [
        {
            id: 1,
            title: 'Lịch hẹn mới',
            description: 'Chó Golden - Khám định kỳ',
            time: '5 phút trước',
            icon: <CalendarIcon className="h-6 w-6 text-gray-600" />,
        },
        {
            id: 2,
            title: 'Hoàn thành ký gửi',
            description: 'Mèo Anh lông ngắn - 3 ngày',
            time: '1 giờ trước',
            icon: <CheckCircleIcon className="h-6 w-6 text-gray-600" />,
        },
        {
            id: 3,
            title: 'Tiêm phòng',
            description: 'Chó Corgi - Vaccine 6 bệnh',
            time: '2 giờ trước',
            icon: <BeakerIcon className="h-6 w-6 text-gray-600" />,
        },
        {
            id: 4,
            title: 'Thanh toán',
            description: 'Dịch vụ khám - 500,000 ₫',
            time: '3 giờ trước',
            icon: <CurrencyDollarIcon className="h-6 w-6 text-gray-600" />,
        },
        {
            id: 5,
            title: 'Bác sĩ mới',
            description: 'BS. Trần Văn B - Chuyên khoa nội',
            time: '1 ngày trước',
            icon: <UserGroupIcon className="h-6 w-6 text-gray-600" />,
        },
    ];

    return (
        <div className="max-w-7xl mx-auto p-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h1 className="text-5xl font-bold text-gray-900 mb-2">Dashboard</h1>
                    <p className="text-gray-500 text-lg">Chào mừng trở lại! Đây là tổng quan phòng khám của bạn</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowInviteForm(true)}
                        className="p-3 rounded-xl hover:bg-white text-gray-600 transition-colors shadow-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                            <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                        </svg>
                    </button>
                    <button className="p-3 rounded-xl hover:bg-white text-gray-600 transition-colors relative shadow-sm">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <section className="mb-12">
                <div className="grid grid-cols-4 gap-6">
                    {statsCards.map((stat) => (
                        <div
                            key={stat.id}
                            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-teal-100 cursor-pointer hover:scale-105"
                            onMouseEnter={() => setHoveredCard(stat.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-3xl shadow-md`}>
                                    {stat.icon}
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${stat.trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {stat.change}
                                </span>
                            </div>
                            <h3 className="text-gray-500 text-sm mb-2">{stat.title}</h3>
                            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Revenue & Service Charts */}
            <section className="mb-12">
                <div className="grid grid-cols-3 gap-6">
                    {/* Revenue Chart */}
                    <div className="col-span-2 bg-white rounded-2xl p-8 shadow-lg border border-teal-100">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Doanh thu</h2>
                                <p className="text-sm text-gray-500">6 tháng gần đây (triệu đồng)</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedPeriod('week')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedPeriod === 'week' ? 'bg-teal-100 text-teal-600' : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    Tuần
                                </button>
                                <button
                                    onClick={() => setSelectedPeriod('month')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedPeriod === 'month' ? 'bg-teal-100 text-teal-600' : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    Tháng
                                </button>
                                <button
                                    onClick={() => setSelectedPeriod('year')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedPeriod === 'year' ? 'bg-teal-100 text-teal-600' : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    Năm
                                </button>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="name" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #ccfbf1',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                    formatter={(value) => `${value} triệu`}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#14b8a6"
                                    strokeWidth={3}
                                    dot={{ fill: '#14b8a6', r: 5 }}
                                    activeDot={{ r: 7 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Service Distribution */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg border border-teal-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Phân bố dịch vụ</h2>
                        <p className="text-sm text-gray-500 mb-6">Tháng này</p>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={serviceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {serviceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-6 space-y-3">
                            {serviceData.map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-sm text-gray-600">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Actions */}
            <section className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-gray-900">Thao tác nhanh</h2>
                </div>
                <div className="grid grid-cols-3 gap-6">
                    {quickActions.map((action) => (
                        <div
                            key={action.id}
                            className="rounded-2xl p-8 cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl relative overflow-hidden"
                            style={action.image ? { backgroundImage: `url(${action.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                        >
                            <div className="relative z-10">
                                <div className="text-5xl mb-4">{action.icon}</div>
                                <h3 className="font-bold text-xl mb-2 text-white">{action.title}</h3>
                                <p className="text-sm text-cyan-50">{action.description}</p>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-cyan-600 opacity-40 rounded-2xl"></div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Recent Activities */}
            <section>
                <div className="flex items-center gap-2 mb-6">
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-gray-900">Hoạt động gần đây</h2>
                </div>
                <div className="bg-white rounded-2xl shadow-lg border border-teal-100 overflow-hidden">
                    {recentActivities.map((activity) => (
                        <div
                            key={activity.id}
                            className="flex items-center gap-4 p-5 border-b border-teal-50 last:border-b-0 hover:bg-teal-50 transition-colors cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center text-2xl">
                                {activity.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">{activity.title}</h3>
                                <p className="text-sm text-gray-500">{activity.description}</p>
                            </div>
                            <span className="text-xs text-gray-400">{activity.time}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Invite Form Modal */}
            {showInviteForm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative">
                        <button
                            onClick={() => setShowInviteForm(false)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl flex items-center justify-center">
                                <EnvelopeIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Mời Bác sĩ Thú y</h3>
                                <p className="text-sm text-gray-500">Gửi lời mời tham gia đội ngũ phòng khám</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email (có thể nhập nhiều email, cách nhau bởi dấu phẩy)
                                </label>
                                <input
                                    type="text"
                                    value={inviteEmails}
                                    onChange={(e) => setInviteEmails(e.target.value)}
                                    placeholder="bsvet1@email.com, bsvet2@email.com"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Lời nhắn (tùy chọn)
                                </label>
                                <textarea
                                    value={inviteMessage}
                                    onChange={(e) => setInviteMessage(e.target.value)}
                                    placeholder="Chào mừng bạn tham gia đội ngũ phòng khám của chúng tôi..."
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleInvite}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                                >
                                    Gửi lời mời
                                </button>
                                <button
                                    onClick={() => setShowInviteForm(false)}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Hủy
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}