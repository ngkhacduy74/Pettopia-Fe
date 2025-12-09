// app/clinic/dashboard/page.tsx
'use client'
import React, { useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import {
  CurrencyDollarIcon,
  CalendarIcon,
  UserGroupIcon,
  HomeIcon,
  BeakerIcon,
  CheckCircleIcon,
  BriefcaseIcon,
  BuildingStorefrontIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { getCustomerTotalDetail } from '@/services/customer/customerService'; // Đảm bảo import đúng đường dẫn

interface TotalDetailData {
  user: number;
  staff: number;
  clinic: number;
  vet: number;
}

export default function ClinicDashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [totalData, setTotalData] = useState<TotalDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Lấy clinicId từ localStorage
    if (typeof window === 'undefined') return;
    const id = localStorage.getItem('clinicId');
    if (id) setClinicId(id);

    // Gọi API lấy tổng số user theo role
    const fetchTotalDetail = async () => {
      try {
        setLoading(true);
        const response = await getCustomerTotalDetail();
        if (response.data?.status && response.data?.data) {
          setTotalData(response.data.data);
        } else {
          throw new Error(response.message || 'Invalid response format');
        }
      } catch (err: any) {
        setError(err.message || 'Không thể tải dữ liệu');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTotalDetail();
  }, []);

  // Dữ liệu biểu đồ (có thể fetch sau)
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
      title: 'Quản lý người dùng',
      description: 'Xem và quản lý người dùng',
      icon: <UserGroupIcon className="h-6 w-6 text-white" />,
      color: 'from-teal-600 to-cyan-600',
      link: '/admin/manager-user',
    },
    {
      id: 2,
      title: 'Quản lý bệnh viện',
      description: 'Danh sách các bệnh viện',
      icon: <BeakerIcon className="h-6 w-6 text-white" />,
      color: 'from-cyan-600 to-blue-600',
      link: '/admin/manager-clinic',
    },
    {
      id: 3,
      title: 'Kênh giao tiếp',
      description: 'Cộng đồng Pettoipia',
      icon: <HomeIcon className="h-6 w-6 text-white" />,
      color: 'from-blue-600 to-teal-600',
      link: '#',
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

  // Cập nhật statsCards với dữ liệu thật
  const statsCards = [
    {
      id: 1,
      title: 'Người dùng',
      value: loading ? '...' : totalData?.user ?? 0,
      change: '+12.5%',
      icon: <UserGroupIcon className="h-5 w-5 text-white" />,
      color: 'from-teal-600 to-cyan-600',
      trend: 'up' as const,
    },
    {
      id: 2,
      title: 'Quản lý',
      value: loading ? '...' : totalData?.staff ?? 0,
      change: '+3 mới',
      icon: <BriefcaseIcon className="h-5 w-5 text-white" />,
      color: 'from-cyan-600 to-teal-600',
      trend: 'up' as const,
    },
    {
      id: 3,
      title: 'Phòng khám',
      value: loading ? '...' : totalData?.clinic ?? 0,
      change: '4 nghỉ',
      icon: <BuildingStorefrontIcon className="h-5 w-5 text-white" />,
      color: 'from-teal-500 to-cyan-500',
      trend: 'neutral' as const,
    },
    {
      id: 4,
      title: 'Bác sĩ',
      value: loading ? '...' : totalData?.vet ?? 0,
      change: '85%',
      icon: <UsersIcon className="h-5 w-5 text-white" />,
      color: 'from-cyan-500 to-teal-500',
      trend: 'up' as const,
    },
  ];

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Lỗi: {error}
        </div>
      </div>
    );
  }

  return (
    <Dashboard
      title="Admin Dashboard"
      subtitle="Tổng quan người dùng và hệ thống"
      statsCards={statsCards}
      revenueData={revenueData}
      serviceData={serviceData}
      quickActions={quickActions}
      recentActivities={recentActivities}

      selectedPeriod={selectedPeriod}
      onPeriodChange={setSelectedPeriod}
    />
  );
}