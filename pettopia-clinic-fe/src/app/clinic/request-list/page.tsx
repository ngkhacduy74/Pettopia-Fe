'use client'
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Dashboard from '@/components/Clinic-Dashboard';

export default function ClinicHomePage() {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-teal-50 to-white">
      <Dashboard />
    </div>
  );
}