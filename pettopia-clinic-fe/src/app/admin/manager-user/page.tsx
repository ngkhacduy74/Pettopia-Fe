import dynamic from 'next/dynamic';

const ManagerUser = dynamic(() => import('@/components/admin/ManagerUser'));

export default function ClinicFormDetailPage() {
  return(
  <div>
<h1 className="text-3xl font-bold text-gray-900 mb-1">Quản lí người dùng</h1>
    <ManagerUser title="Danh sách người dùng" />;
  </div>

  );
}
