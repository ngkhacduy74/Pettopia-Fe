// app/clinic/dashboard/page.tsx
'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Dashboard from '@/components/Dashboard';
import { sendInvitation } from '@/services/partner/clinicService';
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
  const [inviteRole, setInviteRole] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const id = localStorage.getItem('clinicId');
    if (id) setClinicId(id);
  }, []);

  // Xử lý gửi lời mời
  const handleInvite = async () => {
    try {
      const response = await sendInvitation(inviteEmails, inviteRole);
      alert(`Đã gửi lời mời đến: ${inviteEmails}`);
      setShowInviteForm(false);
      setInviteEmails('');
      setInviteRole('');
    } catch (error: any) {
      alert(`Lỗi: ${error.response?.data?.message || error.message}`);
    }
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

  // Nút Mời thành viên + Modal (không có lời nhắn)
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

    {/* Modal Invite – Chỉ có Email + Role */}
    {showInviteForm && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
          <button
            onClick={() => setShowInviteForm(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>

          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <EnvelopeIcon className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Mời thành viên mới</h3>
            <p className="text-sm text-gray-500 mt-1">Chọn vai trò và gửi lời mời ngay</p>
          </div>

          <div className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={inviteEmails}
                onChange={(e) => setInviteEmails(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              />
            </div>

            {/* Chọn Role – 4 role bắt buộc */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Vai trò <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'vet',          label: 'Bác sĩ thú y',      emoji: 'Stethoscope' },
                  { value: 'staff',        label: 'Nhân viên',         emoji: 'Wrench' },
                  { value: 'receptionist', label: 'Lễ tân',            emoji: 'Phone' },
                  { value: 'manager',      label: 'Quản lý',           emoji: 'Key' },
                ].map((role) => (
                  <label
                    key={role.value}
                    className={`flex items-center justify-center gap-3 py-4 border-2 rounded-xl cursor-pointer transition-all text-center ${
                      inviteRole === role.value
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={inviteRole === role.value}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="sr-only"
                    />
                    <span className="font-medium">{role.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Nút */}
            <div className="flex gap-3 pt-4 pt-3">
              <button
                onClick={handleInvite}
                disabled={!inviteEmails.trim() || !inviteRole}
                className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Gửi lời mời
              </button>
              <button
                onClick={() => setShowInviteForm(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
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