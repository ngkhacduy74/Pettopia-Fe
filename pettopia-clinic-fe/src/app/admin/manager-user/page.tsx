import dynamic from 'next/dynamic';

const ManagerUser = dynamic(() => import('@/components/admin/ManagerUser'), {
  loading: () => (
    <div className="flex items-center justify-center h-screen text-gray-500">
      Loading...
    </div>
  ),
  ssr: false,
});

export default function ClinicFormDetailPage() {
  return <ManagerUser title="Quản lí người dùng" />;
}
