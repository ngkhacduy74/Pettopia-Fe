import dynamic from 'next/dynamic';

const ClinicShift = dynamic(() => import('@/components/clinic/Clinic-Shift'));

export default function ClinicShiftPage() {
  return <ClinicShift />;
}