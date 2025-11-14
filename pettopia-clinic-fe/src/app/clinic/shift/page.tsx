import dynamic from 'next/dynamic';

const ClinicShift = dynamic(() => import('@/components/clinic/Clinic-Shift'), {
  loading: () => (
    <div className="flex items-center justify-center h-screen text-gray-500">
      <div style={{ width: "200px", height: "100px", margin: "20px auto", backgroundImage: "url(./sampleimg/cat.gif)", backgroundSize: "cover", borderRadius: "12px", }}></div>
    </div>
  ),
  ssr: false,
});

export default function ClinicShiftPage() {
  return <ClinicShift />;
}