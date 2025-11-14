'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAppointmentDetail, type AppointmentDetailResponse } from '../../../../services/petcare/petService';
import Link from 'next/link';

export default function AppointmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params?.id as string;
  
  const [appointment, setAppointment] = useState<AppointmentDetailResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!appointmentId) return;

    const fetchAppointment = async () => {
      try {
        setLoading(true);
        const data = await getAppointmentDetail(appointmentId);
        setAppointment(data);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Không thể tải thông tin lịch hẹn');
        console.error('Error fetching appointment:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatShift = (shift: string) => {
    const shiftMap: Record<string, string> = {
      'Morning': 'Sáng',
      'Afternoon': 'Chiều',
      'Evening': 'Tối',
    };
    return shiftMap[shift] || shift;
  };

  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'Pending_Confirmation': 'Chờ xác nhận',
      'Confirmed': 'Đã xác nhận',
      'Cancelled': 'Đã hủy',
      'Completed': 'Hoàn thành',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'Pending_Confirmation': 'bg-yellow-500',
      'Confirmed': 'bg-emerald-500',
      'Cancelled': 'bg-red-500',
      'Completed': 'bg-blue-500',
    };
    return colorMap[status] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <div className="inline-block w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-red-500 text-xl font-bold mb-4">Lỗi</div>
            <p className="text-gray-600 mb-6">{error || 'Không tìm thấy lịch hẹn'}</p>
            <Link
              href="/user/appointments/list"
              className="inline-block px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
            >
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/user/appointments/list"
            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại danh sách
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Chi tiết lịch hẹn</h1>
        </div>

        {/* Appointment Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Thông tin lịch hẹn</h2>
              <p className="text-gray-600 mt-1">ID: {appointment.id}</p>
            </div>
            <span className={`${getStatusColor(appointment.status)} text-white px-4 py-2 rounded-full text-sm font-bold`}>
              {formatStatus(appointment.status)}
            </span>
          </div>

          {/* Date & Shift */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="font-bold text-gray-900">Ngày hẹn</h3>
              </div>
              <p className="text-gray-700 text-lg">{formatDate(appointment.date)}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="font-bold text-gray-900">Ca khám</h3>
              </div>
              <p className="text-gray-700 text-lg">Ca {formatShift(appointment.shift)}</p>
            </div>
          </div>

          {/* Pet IDs */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-bold text-gray-900 mb-3">Thú cưng ({appointment.pet_ids.length})</h3>
            <div className="space-y-2">
              {appointment.pet_ids.map((petId, index) => (
                <div key={petId} className="flex items-center gap-2 text-gray-700">
                  <span className="w-6 h-6 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span>{petId}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Service IDs */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-bold text-gray-900 mb-3">Dịch vụ ({appointment.service_ids.length})</h3>
            <div className="space-y-2">
              {appointment.service_ids.map((serviceId, index) => (
                <div key={serviceId} className="flex items-center gap-2 text-gray-700">
                  <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span>{serviceId}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Clinic & Other Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-bold text-gray-900 mb-3">Thông tin khác</h3>
            <div className="space-y-2 text-gray-700">
              <p><span className="font-semibold">Phòng khám ID:</span> {appointment.clinic_id}</p>
              <p><span className="font-semibold">Khách hàng:</span> {appointment.customer}</p>
              <p><span className="font-semibold">Tạo bởi:</span> {appointment.created_by}</p>
              <p><span className="font-semibold">Ngày tạo:</span> {new Date(appointment.createdAt).toLocaleString('vi-VN')}</p>
              <p><span className="font-semibold">Cập nhật lần cuối:</span> {new Date(appointment.updatedAt).toLocaleString('vi-VN')}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t">
            <Link
              href="/user/appointments/list"
              className="flex-1 text-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              Quay lại
            </Link>
            {appointment.status === 'Pending_Confirmation' && (
              <button className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium">
                Hủy lịch hẹn
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

