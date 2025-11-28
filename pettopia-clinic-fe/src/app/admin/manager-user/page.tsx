import dynamic from 'next/dynamic';

const ManagerUser = dynamic(() => import('@/components/admin/ManagerUser'));

export default function ClinicFormDetailPage() {
  return(
  <div>
<h1 className="text-3xl font-bold text-gray-900 mb-1">Danh sách người dùng</h1>
          <p className="text-gray-500 text-sm">Quản lí người dùng</p>
    <ManagerUser title="Danh sách người dùng" />;
  </div>

  );
}
