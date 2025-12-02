'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ClinicDetail from '@/components/admin/ClinicDetail';

export default function ClinicDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;

  if (!id) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="text-center">
          <p className="text-red-700 font-medium">ID không hợp lệ</p>
        </div>
      </div>
    );
  }

  return <ClinicDetail id={id} />;
}