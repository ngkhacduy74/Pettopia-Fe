import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const RequestTable = dynamic(() => import('@/components/staff/RequestTable'));

export default function ClinicHomePage() {

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-teal-50 to-white">
      <RequestTable title='Yêu cầu' />
    </div>
  );
}