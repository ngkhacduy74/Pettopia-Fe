'use client'
import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// ✅ Lazy load Clinic-Dashboard, hiển thị loading tạm thời
const Dashboard = dynamic(() => import('@/components/Clinic-Dashboard'), {
  loading: () => (
    <div className="flex items-center justify-center h-screen text-gray-500">
      Đang tải bảng điều khiển...
    </div>
  ),
  ssr: false, // Chỉ load ở client, tránh load nặng ở server
});

export default function ClinicDashboardPage() {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <Dashboard />
  );
}