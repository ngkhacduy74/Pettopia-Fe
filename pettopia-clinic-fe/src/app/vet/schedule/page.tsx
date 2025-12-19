'use client';

import React from 'react';
import VetSchedule from '@/components/vet/VetSchedule';

export default function VetSchedulePage() {
  return (
    <div >
      <div >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lịch sử khám</h1>
          <p className="text-gray-600">
            Xem tất cả lịch hẹn được phân công cho bạn tại phòng khám
          </p>
        </div>

        {/* Schedule Component */}
        <VetSchedule />
      </div>
    </div>
  );
}
