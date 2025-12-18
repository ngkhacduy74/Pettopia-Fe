// app/clinic/dashboard/page.tsx
'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';
import Dashboard from '@/components/common/Dashboard';
import InviteMemberModal from '@/components/clinic/InviteMemberModal';
import InviteMemberButton from '@/components/clinic/InviteMemberButton';
import { sendInvitation } from '@/services/partner/clinicService';
import {
  CurrencyDollarIcon,
  CalendarIcon,
  UserGroupIcon,
  HomeIcon,
  BeakerIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function ClinicDashboardPage() {
  const { showSuccess } = useToast();
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
  const handleInvite = async (email: string, role: string) => {
    const response = await sendInvitation(email, role);
    showSuccess(`Đã gửi lời mời đến: ${email}`, 5000);
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

  // Nút Mời thành viên
  const InviteButton = (
    <>
      <InviteMemberButton onClick={() => setShowInviteForm(true)} />
      <InviteMemberModal
        isOpen={showInviteForm}
        onClose={() => setShowInviteForm(false)}
        onSubmit={handleInvite}
      />
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