'use client';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const CheckIn = dynamic(() => import('@/components/clinic/Clinic-CheckIn'));

export default function ClinicHomePage() {

  return (
    <div >
       <h1 className="text-3xl font-bold text-gray-900 mb-1">Check-In Khách hàng</h1>
          <p className="text-gray-500 text-sm">Check In khi khách hàng đã có mặt và làm thủ tục khác</p>
      <CheckIn />
    </div>
  );
}