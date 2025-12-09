import dynamic from 'next/dynamic';

const ManagerClinic = dynamic(() => import('@/components/admin/ManagerClinic'));

export default function ClinicFormDetailPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Quản lí phòng khám</h1>
            <ManagerClinic />
        </div>

    )
}
