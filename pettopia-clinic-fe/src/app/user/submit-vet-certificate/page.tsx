'use client';

import { useState } from 'react';
import VetCreateForm from '@/components/user/VetCreateForm';



export default function SubmitCertificatePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Nộp hồ sơ phòng bác sĩ</h1>
      <p className="text-gray-500 text-sm">Điền thông tin chi tiết để tạo hồ sơ bác sĩ.</p>
      <VetCreateForm />
    </div>

  );
}
