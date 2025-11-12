'use client';

import React from 'react';
import Head from 'next/head';
import UpcomingMeetings from '@/components/UpcomingMeetings';

export default function LichHenPage() {
  return (
    <>
      <Head>
        <title>Lịch hẹn sắp tới</title>
        <meta name="description" content="Trang quản lý lịch hẹn thú cưng" />
      </Head>
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Lịch hẹn thú cưng</h1>
          <UpcomingMeetings />
        </div>
      </main>
    </>
  );
}