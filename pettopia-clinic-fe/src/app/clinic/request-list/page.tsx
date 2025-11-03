'use client'
import React, { useState } from 'react';
import Dashboard from '@/components/Clinic-Dashboard';

export default function ClinicHomePage() {

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-teal-50 to-white">
      <Dashboard />
    </div>
  );
}