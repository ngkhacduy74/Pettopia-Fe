'use client'
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Dashboard from '@/components/Clinic-Dashboard';

export default function ClinicDashboardPage() {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <Dashboard />
  );
}