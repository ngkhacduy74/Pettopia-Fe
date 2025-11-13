'use client'
import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const RequestTable = dynamic(() => import('@/components/staff/RequestTable'), {
  loading: () => (
    <div className="flex items-center justify-center h-screen text-gray-500">
      Loading...
    </div>
  ),
  ssr: false,
});

export default function ClinicHomePage() {

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-teal-50 to-white">
      <RequestTable title='Yêu cầu' />
    </div>
  );
}