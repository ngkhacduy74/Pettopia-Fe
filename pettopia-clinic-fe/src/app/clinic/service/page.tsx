'use client'
import dynamic from 'next/dynamic';

const ClinicService = dynamic(() => import('@/components/clinic/Clinic-Service'), {
  loading: () => (
    <div className="flex items-center justify-center h-screen text-gray-500">
      Loading...
    </div>
  ),
  ssr: false,
});

export default function ClinicShiftPage() {
  return <ClinicService />;
}