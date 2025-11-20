// app/clinic/dashboard/page.tsx
'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Dashboard from '@/components/Dashboard';
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

export default function ClinicDashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [clinicId, setClinicId] = useState<string | null>(null);

  // Modal state
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmails, setInviteEmails] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const id = localStorage.getItem('clinicId');
    if (id) setClinicId(id);
  }, []);

  // Xử lý gửi lời mời
  const handleInvite = () => {
    console.log('Sending invites to:', inviteEmails);
    console.log('Message:', inviteMessage);
    alert(`Đã gửi lời mời đến: ${inviteEmails}`);
    setShowInviteForm(false);
    setInviteEmails('');
    setInviteMessage('');
  };

  // Dữ liệu dashboard
  const statsCards = [
    {
      id: 1,
      title: 'Doanh thu tháng này',
      value: '67M ₫',
      change: '+12.5%',
      icon: <CurrencyDollarIcon className="h-5 w-5 text-white" />,
      color: 'from-teal-600 to-cyan-600',
      trend: 'up' as const,
    },
    {
      id: 2,
      title: 'Lịch hẹn hôm nay',
      value: '24',
      change: '+3 mới',
      icon: <CalendarIcon className="h-5 w-5 text-white" />,
      color: 'from-cyan-600 to-teal-600',
      trend: 'up' as const,
    },
    {
      id: 3,
      title: 'Bác sĩ làm việc',
      value: '8/12',
      change: '4 nghỉ',
      icon: <UserGroupIcon className="h-5 w-5 text-white" />,
      color: 'from-teal-500 to-cyan-500',
      trend: 'neutral' as const,
    },
    {
      id: 4,
      title: 'Pet ký gửi',
      value: '15',
      change: '85%',
      icon: <HomeIcon className="h-5 w-5 text-white" />,
      color: 'from-cyan-500 to-teal-500',
      trend: 'up' as const,
    },
  ];

  const revenueData = [
    { name: 'T1', revenue: 45 },
    { name: 'T2', revenue: 52 },
    { name: 'T3', revenue: 48 },
    { name: 'T4', revenue: 61 },
    { name: 'T5', revenue: 55 },
    { name: 'T6', revenue: 67 },
  ];

  const serviceData = [
    { name: 'Khám bệnh', value: 45, color: '#14b8a6' },
    { name: 'Tiêm phòng', value: 30, color: '#06b6d4' },
    { name: 'Ký gửi', value: 15, color: '#0e7490' },
    { name: 'Khác', value: 10, color: '#0891b2' }
  ];

  const quickActions = [
    {
      id: 1,
      title: 'Quản lý Bác sĩ',
      description: 'Xem và quản lý bác sĩ',
      icon: <UserGroupIcon className="h-6 w-6 text-white" />,
      color: 'from-teal-600 to-cyan-600',
      link: '/clinic/vet-list',
    },
    {
      id: 2,
      title: 'Dịch vụ',
      description: 'Danh sách dịch vụ phòng khám',
      icon: <BeakerIcon className="h-6 w-6 text-white" />,
      color: 'from-cyan-600 to-blue-600',
      link: '/clinic/service',
    },
    {
      id: 3,
      title: 'Quản lý ca làm',
      description: 'Quản lý ca làm của nhân viên',
      icon: <HomeIcon className="h-6 w-6 text-white" />,
      color: 'from-blue-600 to-teal-600',
      link: '/clinic/shift',
    },
    {
      id: 4,
      title: 'Quản lý lịch hẹn',
      description: 'Quản lý lịch hẹn của khách hàng',
      icon: <CalendarIcon className="h-6 w-6 text-white" />,
      color: 'from-teal-600 to-blue-600',
      link: '/clinic/appointment',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      title: 'Lịch hẹn mới',
      description: 'Chó Golden - Khám định kỳ',
      time: '5 phút',
      icon: <CalendarIcon className="h-5 w-5 text-teal-600" />,
    },
    {
      id: 2,
      title: 'Hoàn thành ký gửi',
      description: 'Mèo Anh lông ngắn - 3 ngày',
      time: '1 giờ',
      icon: <CheckCircleIcon className="h-5 w-5 text-teal-600" />,
    },
  ];

  // Nút Mời thành viên + Modal
  const InviteButton = (
    <>
      <button
        onClick={() => setShowInviteForm(true)}
        className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
        </svg>
        Mời thành viên
      </button>

      {/* Modal Invite Form */}
      {showInviteForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative">
            <button
              onClick={() => setShowInviteForm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <EnvelopeIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Mời thành viên</h3>
                <p className="text-xs text-gray-500">Gửi lời mời tham gia đội ngũ</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email (cách nhau bởi dấu phẩy)
                </label>
                <input
                  type="text"
                  value={inviteEmails}
                  onChange={(e) => setInviteEmails(e.target.value)}
                  placeholder="user1@email.com, user2@email.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Lời nhắn (tùy chọn)
                </label>
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Chào mừng bạn tham gia..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleInvite}
                  className="flex-1 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
                >
                  Gửi lời mời
                </button>
                <button
                  onClick={() => setShowInviteForm(false)}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <Dashboard
      title="Dashboard Phòng khám"
      subtitle="Tổng quan hoạt động phòng khám thú y"
      statsCards={statsCards}
      revenueData={revenueData}
      serviceData={serviceData}
      quickActions={quickActions}
      recentActivities={recentActivities}
      selectedPeriod={selectedPeriod}
      onPeriodChange={setSelectedPeriod}
      inviteButton={InviteButton}
    />
  );
}