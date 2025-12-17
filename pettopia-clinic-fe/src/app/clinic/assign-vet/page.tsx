'use client';
import React from 'react';
import dynamic from 'next/dynamic';

const AssignVet = dynamic(() => import('@/components/clinic/Clinic-AssignVet'));

export default function AssignVetPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Assign Bác sĩ</h1>
      <p className="text-gray-500 text-sm">
        Gán bác sĩ phụ trách cho các lịch hẹn đã được check-in.
      </p>
      <AssignVet />
    </div>
  );
}


