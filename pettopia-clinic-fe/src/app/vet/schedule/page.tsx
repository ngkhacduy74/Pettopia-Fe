'use client';

import React from 'react';
import VetSchedule from '@/components/vet/VetSchedule';

export default function VetSchedulePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lịch Hẹn Được Phân Công</h1>
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
