import React, { useState, useEffect } from 'react';
import { UserGroupIcon, EnvelopeIcon, CheckCircleIcon, ClockIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
    CurrencyDollarIcon,
    CalendarIcon,
    HomeIcon,
    BeakerIcon,
} from '@heroicons/react/24/outline';

export default function Dashboard() {
    const [showSearch, setShowSearch] = useState(false);
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [clinicId, setClinicId] = useState<string | null>(null);
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [inviteEmails, setInviteEmails] = useState('');
    const [inviteMessage, setInviteMessage] = useState('');

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const id = window.localStorage?.getItem('clinicId');
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

    interface InvitedVet {
        id: number;
        name: string;
        email: string;
        specialization: string;
        status: StatusType;
        invitedDate: string;
        avatar: string;
    }

    // Mock data cho danh sách bác sĩ đã mời
    const invitedVets: InvitedVet[] = [
        {
            id: 1,
            name: 'BS. Nguyễn Văn A',
            email: 'nguyenvana@email.com',
            specialization: 'Chuyên khoa nội',
            status: 'accepted',
            invitedDate: '15/10/2025',
            avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop',
        },
        {
            id: 2,
            name: 'BS. Trần Thị B',
            email: 'tranthib@email.com',
            specialization: 'Chuyên khoa ngoại',
            status: 'pending',
            invitedDate: '18/10/2025',
            avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=150&h=150&fit=crop',
        },
        {
            id: 3,
            name: 'BS. Lê Minh C',
            email: 'leminhc@email.com',
            specialization: 'Chuyên khoa răng hàm mặt',
            status: 'accepted',
            invitedDate: '12/10/2025',
            avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop',
        },
        {
            id: 4,
            name: 'BS. Phạm Thị D',
            email: 'phamthid@email.com',
            specialization: 'Chuyên khoa da liễu',
            status: 'pending',
            invitedDate: '19/10/2025',
            avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop',
        },
        {
            id: 5,
            name: 'BS. Hoàng Văn E',
            email: 'hoangvane@email.com',
            specialization: 'Chuyên khoa tim mạch',
            status: 'accepted',
            invitedDate: '10/10/2025',
            avatar: 'https://images.unsplash.com/photo-1637059824899-a441006a6875?w=150&h=150&fit=crop',
        },
    ];

    const handleInvite = () => {
        // Logic gửi lời mời
        console.log('Sending invites to:', inviteEmails);
        console.log('Message:', inviteMessage);
        setShowInviteForm(false);
        setInviteEmails('');
        setInviteMessage('');
    };

    type StatusType = 'accepted' | 'pending';
    
    const getStatusBadge = (status: StatusType) => {
        if (status === 'accepted') {
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">
                    <CheckCircleIcon className="w-4 h-4" />
                    Đã chấp nhận
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-600">
                <ClockIcon className="w-4 h-4" />
                Chờ xác nhận
            </span>
        );
    };

    return (
        <section className="max-w-7xl mx-auto p-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <UserGroupIcon className="w-8 h-8 text-teal-600" />
                        <h2 className="text-4xl font-bold text-gray-900">Quản lý Bác sĩ</h2>
                    </div>
                    <p className="text-gray-500 text-lg">Mời và quản lý đội ngũ bác sĩ thú y của phòng khám</p>
                </div>
                <button
                    onClick={() => setShowInviteForm(true)}
                    className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 hover:scale-105"
                >
                    <EnvelopeIcon className="w-5 h-5" />
                    Mời Bác sĩ
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-teal-100">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl flex items-center justify-center">
                            <UserGroupIcon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Tổng số bác sĩ</p>
                            <p className="text-3xl font-bold text-gray-900">{invitedVets.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-teal-100">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                            <CheckCircleIcon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Đã chấp nhận</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {invitedVets.filter(v => v.status === 'accepted').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-teal-100">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-yellow-600 to-amber-600 rounded-xl flex items-center justify-center">
                            <ClockIcon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Chờ xác nhận</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {invitedVets.filter(v => v.status === 'pending').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

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

            {/* Vet List */}
            <div className="bg-white rounded-2xl shadow-lg border border-teal-100 overflow-hidden">
                <div className="p-6 border-b border-teal-50">
                    <h3 className="text-xl font-bold text-gray-900">Danh sách Bác sĩ</h3>
                    <p className="text-sm text-gray-500 mt-1">Tất cả bác sĩ đã được mời vào hệ thống</p>
                </div>

                <div className="divide-y divide-teal-50">
                    {invitedVets.map((vet) => (
                        <div
                            key={vet.id}
                            className="p-6 hover:bg-teal-50 transition-colors cursor-pointer flex items-center gap-6"
                        >
                            <img
                                src={vet.avatar}
                                alt={vet.name}
                                className="w-16 h-16 rounded-xl object-cover shadow-md"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h4 className="font-bold text-lg text-gray-900">{vet.name}</h4>
                                    {getStatusBadge(vet.status)}
                                </div>
                                <p className="text-sm text-gray-600 mb-1">{vet.specialization}</p>
                                <p className="text-sm text-gray-500">{vet.email}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-400">Ngày mời</p>
                                <p className="text-sm font-medium text-gray-600">{vet.invitedDate}</p>
                            </div>
                            <button className="p-2 hover:bg-teal-100 rounded-lg transition-colors">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}