import React, { useState, useEffect, useCallback } from 'react';
import { UserGroupIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import InviteMemberModal from '@/components/InviteMemberModal';
import InviteMemberButton from '@/components/InviteMemberButton';
import {
    CurrencyDollarIcon,
    CalendarIcon,
    HomeIcon,
    BeakerIcon,
} from '@heroicons/react/24/outline';
import { getClinicVets, ClinicMembersResponse, VetMember } from '@/services/partner/veterianrianService';
import Link from 'next/link';
import { sendInvitation } from '@/services/partner/clinicService';

type StatusType = 'accepted' | 'pending';

interface InvitedVet {
    id: string;
    member_id: string;
    name: string;
    email: string;
    phone?: string;
    specialization: string;
    status: StatusType;
    invitedDate: string;
    avatar: string;
    is_active?: boolean;
}

export default function Dashboard() {
    const [showSearch, setShowSearch] = useState(false);
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [clinicId, setClinicId] = useState<string | null>(null);
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [invitedVets, setInvitedVets] = useState<InvitedVet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const id = window.localStorage?.getItem('clinicId');
        if (id) setClinicId(id);
    }, []);

    const fetchVets = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response: ClinicMembersResponse = await getClinicVets();
            
            if (response.data && response.data.members) {
                // Sử dụng trực tiếp dữ liệu từ VetMember (đã có fullname, email, phone, specialty)
                const vets = response.data.members.map((member: VetMember) => {
                    // Xác định status dựa trên joined_at
                    const status: StatusType = member.joined_at ? 'accepted' : 'pending';
                    
                    // Format tên: thêm "BS." nếu có fullname, nếu không thì dùng member_id
                    const displayName = member.fullname 
                        ? (member.fullname.startsWith('BS.') ? member.fullname : `BS. ${member.fullname}`)
                        : `Vet ${member.member_id.slice(0, 8)}`;
                    
                    return {
                        id: member.member_id,
                        member_id: member.member_id,
                        name: displayName,
                        email: member.email || '',
                        phone: member.phone,
                        specialization: member.specialty || 'Chuyên khoa tổng hợp',
                        status: status,
                        invitedDate: member.joined_at 
                            ? new Date(member.joined_at).toLocaleDateString('vi-VN')
                            : 'Chưa xác định',
                        avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop',
                        is_active: member.is_active,
                    } as InvitedVet;
                });
                
                setInvitedVets(vets);
            } else {
                setInvitedVets([]);
            }
        } catch (err: any) {
            console.error('Error fetching vets:', err);
            setError(err.message || 'Không thể tải danh sách bác sĩ');
            setInvitedVets([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVets();
    }, [fetchVets]);

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


    const handleInvite = async (email: string, role: string) => {
        try {
            await sendInvitation(email, role);
            // Refresh danh sách sau khi gửi lời mời thành công
            await fetchVets();
        } catch (err: any) {
            console.error('Error sending invitation:', err);
            throw err; // Re-throw để InviteMemberModal xử lý hiển thị lỗi
        }
    };

    const getStatusBadge = (status: StatusType) => {
        if (status === 'accepted') {
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">
                    <CheckCircleIcon className="w-4 h-4" />
                    Đã chấp nhận
                </span>
            );
        }
        // Không hiển thị badge khi đang chờ xác nhận
        return null;
    };

    return (
        <section className="max-w-7xl mx-auto ">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <UserGroupIcon className="w-8 h-8 text-teal-600" />
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">Quản lý Bác sĩ</h1>
                    </div>
                    <p className="text-gray-500 text-sm">Mời và quản lý đội ngũ bác sĩ thú y của phòng khám</p>
                </div>
                <InviteMemberButton onClick={() => setShowInviteForm(true)} />
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-4 mb-5">
                <div className="bg-white rounded-2xl p-3 shadow-lg border border-teal-100">
                    <div className="flex items-center gap-2">
                        <div className="w-14 h-14 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl flex items-center justify-center">
                            <UserGroupIcon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Tổng số bác sĩ</p>
                            <p className="text-3xl font-bold text-gray-900">{invitedVets.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-3 shadow-lg border border-teal-100">
                    <div className="flex items-center gap-2">
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
                <div className="bg-white rounded-2xl p-3 shadow-lg border border-teal-100">
                    <div className="flex items-center gap-2">
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
            <InviteMemberModal
                isOpen={showInviteForm}
                onClose={() => setShowInviteForm(false)}
                onSubmit={handleInvite}
            />

            {/* Vet List */}
            <div className="bg-white rounded-2xl shadow-lg border border-teal-100 overflow-hidden">


                {loading && (
                    <div className="p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                        <p className="text-gray-500 mt-4">Đang tải danh sách bác sĩ...</p>
                    </div>
                )}

                {error && (
                    <div className="p-6">
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <p className="text-red-800 font-medium">Lỗi: {error}</p>
                            <button
                                onClick={fetchVets}
                                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                            >
                                Thử lại
                            </button>
                        </div>
                    </div>
                )}

                {!loading && !error && (
                    <>
                        {invitedVets.length === 0 ? (
                            <div className="p-12 text-center">
                                <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">Chưa có bác sĩ nào trong danh sách</p>
                                <p className="text-gray-400 text-sm mt-2">Hãy mời bác sĩ tham gia phòng khám của bạn</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-teal-50">
                                {invitedVets.map((vet) => (
                                    <Link
                                        key={vet.id}
                                        href={`/clinic/vet/${vet.id}`}
                                        className="block p-6 hover:bg-teal-50 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h4 className="font-bold text-lg text-gray-900">{vet.name}</h4>
                                                    {getStatusBadge(vet.status)}
                                                    {vet.is_active === false && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                            Không hoạt động
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mb-1">{vet.specialization}</p>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    {vet.email && (
                                                        <span className="flex items-center gap-1">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                            </svg>
                                                            {vet.email}
                                                        </span>
                                                    )}
                                                    {vet.phone && (
                                                        <span className="flex items-center gap-1">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                            </svg>
                                                            {vet.phone}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="p-2 hover:bg-teal-100 rounded-lg transition-colors inline-flex items-center">
                                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}