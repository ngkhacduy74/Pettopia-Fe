import dynamic from 'next/dynamic';

const ClinicService = dynamic(() => import('@/components/clinic/Clinic-Service'));

export default function ClinicShiftPage() {
  return <ClinicService />;
}