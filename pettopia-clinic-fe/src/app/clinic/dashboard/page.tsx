'use client'
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Dashboard from '@/components/admin/Admin-Dashboard';

export default function ClinicDashboardPage() {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <Dashboard />
  );
}