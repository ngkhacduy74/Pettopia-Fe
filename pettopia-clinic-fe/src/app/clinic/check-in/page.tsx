'use client';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const CheckIn = dynamic(() => import('@/components/clinic/Clinic-CheckIn'));

export default function ClinicHomePage() {

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-teal-50 to-white">
      <CheckIn />
    </div>
  );
}