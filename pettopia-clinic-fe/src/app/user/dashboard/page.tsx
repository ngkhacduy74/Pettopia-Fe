// app/clinic/dashboard/page.tsx
'use client'
import React, { useState, useEffect } from 'react';
import MyGuide from '@/components/user/MyGuide';
import {
  CurrencyDollarIcon,
  CalendarIcon,
  UserGroupIcon,
  HomeIcon,
  BeakerIcon,
  CheckCircleIcon,
  UserIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';

export default function ClinicDashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [clinicId, setClinicId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const id = localStorage.getItem('clinicId');
    if (id) setClinicId(id);
  }, []);

  // Dữ liệu dành riêng cho Clinic
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
      link: '/clinic/doctors',
    },
    {
      id: 2,
      title: 'Tiêm phòng',
      description: 'Lịch tiêm và vaccine',
      icon: <BeakerIcon className="h-6 w-6 text-white" />,
      color: 'from-cyan-600 to-blue-600',
      link: '/clinic/vaccination',
    },
    {
      id: 3,
      title: 'Ký gửi',
      description: 'Quản lý chăm sóc Pet',
      icon: <HomeIcon className="h-6 w-6 text-white" />,
      color: 'from-blue-600 to-teal-600',
      link: '/clinic/boarding',
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

  return (
    <MyGuide/>
  );
}