import dynamic from 'next/dynamic';

const ManagerUser = dynamic(() => import('@/components/admin/ManagerUser'));

export default function ClinicFormDetailPage() {
  return <ManagerUser title="Quản lí người dùng" />;
}
