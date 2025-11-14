'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

// Icons
const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MapPinIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const HeartIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

const BriefcaseIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
  </svg>
);

const XMarkIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  weight?: number;
}

interface Service {
  id: string;
  name: string;
  description?: string;
  price?: number;
  duration?: number;
}

interface Clinic {
  id: string;
  name: string;
  address?: string;
  phone?: string;
}

interface AppointmentDetail {
  id: string;
  user_id: string;
  pet_ids: string[];
  clinic_id: string;
  service_ids: string[];
  date: string;
  shift: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  pets?: Pet[];
  services?: Service[];
  clinic?: Clinic;
}

const AppointmentDetailPage = () => {
  const params = useParams();
  const appointmentId = typeof params?.id === 'string' ? params.id : '';

  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!appointmentId) {
      setError('Không tìm thấy ID lịch hẹn');
      setLoading(false);
      return;
    }
    fetchAppointmentDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId]);

  const fetchAppointmentDetail = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      const response = await fetch(`http://localhost:3000/api/v1/healthcare/appointments/${appointmentId}`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Không thể tải thông tin lịch hẹn');
      
      const result = await response.json();
      const data = result?.data ?? result;

      if (!data) throw new Error('Dữ liệu không hợp lệ từ server');

      const enrichedData = {
        ...data,
        pets: data.pet_ids && data.pet_ids.length
          ? [{ id: data.pet_ids[0], name: 'Milu', species: 'Chó', breed: 'Golden Retriever', age: 3, weight: 25 }]
          : [],
        services: data.service_ids && data.service_ids.length
          ? [{ id: data.service_ids[0], name: 'Khám tổng quát', description: 'Kiểm tra sức khỏe toàn diện', price: 200000, duration: 30 }]
          : [],
        clinic: data.clinic_id ? {
          id: data.clinic_id,
          name: 'Phòng khám PetCare Central',
          address: '123 Đường Láng, Đống Đa, Hà Nội',
          phone: '024 1234 5678'
        } : undefined
      };

      setAppointment(enrichedData);
    } catch (err: any) {
      setError(err?.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    try {
      setCancelling(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3000/api/v1/healthcare/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'Cancelled' })
      });

      if (!response.ok) throw new Error('Không thể hủy lịch hẹn');
      
      await fetchAppointmentDetail();
      setShowCancelModal(false);
      alert('Đã hủy lịch hẹn thành công!');
    } catch (err: any) {
      alert(err.message || 'Không thể hủy lịch hẹn');
    } finally {
      setCancelling(false);
    }
  };

  const formatShift = (s: string) => ({ Morning: 'Sáng (8:00 - 12:00)', Afternoon: 'Chiều (13:00 - 17:00)', Evening: 'Tối (17:00 - 20:00)' }[s] || s);
  
  const formatStatus = (s: string) => ({
    Pending_Confirmation: 'Chờ xác nhận',
    Confirmed: 'Đã xác nhận',
    Cancelled: 'Đã hủy',
    Completed: 'Hoàn thành'
  }[s] || s);

  const getStatusColor = (s: string) => ({
    Pending_Confirmation: 'bg-yellow-500',
    Confirmed: 'bg-emerald-500',
    Cancelled: 'bg-red-500',
    Completed: 'bg-blue-500'
  }[s] || 'bg-gray-500');

  const formatDate = (d: string) => {
    const date = new Date(d);
    const dow = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'][date.getDay()];
    return `${dow}, ${date.getDate()} tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XMarkIcon className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h2>
          <p className="text-gray-600 mb-6">{error || 'Không tìm thấy thông tin lịch hẹn'}</p>
          <button onClick={() => window.history.back()} className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition">
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button onClick={() => window.history.back()} className="p-3 hover:bg-white rounded-xl transition shadow-sm">
            <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Chi Tiết Lịch Hẹn</h1>
            <p className="text-gray-600">Mã lịch hẹn: {(appointment?.id ?? '').slice(0, 8).toUpperCase()}</p>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Trạng thái lịch hẹn</h2>
              <span className={`${getStatusColor(appointment.status)} text-white px-5 py-2 rounded-full text-sm font-bold inline-block`}>
                {formatStatus(appointment.status)}
              </span>
            </div>
            {appointment.status === 'Pending_Confirmation' && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="bg-red-50 hover:bg-red-100 text-red-700 font-medium px-6 py-2.5 rounded-lg transition border border-red-200"
              >
                Hủy lịch hẹn
              </button>
            )}
          </div>
        </div>

        {/* Date & Time */}
        <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl shadow-lg p-8 mb-6 text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <CalendarIcon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-teal-100 text-sm font-medium mb-1">Ngày hẹn</p>
                <p className="text-xl font-bold">{formatDate(appointment.date)}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <ClockIcon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-teal-100 text-sm font-medium mb-1">Ca khám</p>
                <p className="text-xl font-bold">{formatShift(appointment.shift)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Clinic Info */}
        {appointment.clinic && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-teal-100 p-3 rounded-xl">
                <MapPinIcon className="w-6 h-6 text-teal-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Phòng khám</h3>
                <p className="text-gray-900 font-semibold mb-2">{appointment.clinic.name}</p>
                <p className="text-gray-600 text-sm mb-1">📍 {appointment.clinic.address}</p>
                <p className="text-gray-600 text-sm">📞 {appointment.clinic.phone}</p>
              </div>
            </div>
          </div>
        )}

        {/* Pets Info */}
        {appointment.pets && appointment.pets.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-pink-100 p-3 rounded-xl">
                <HeartIcon className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Thú cưng</h3>
            </div>
            <div className="space-y-4">
              {appointment.pets.map(pet => (
                <div key={pet.id} className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-900 text-lg mb-1">{pet.name}</p>
                      <p className="text-gray-600 text-sm">{pet.species} - {pet.breed}</p>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <p>🎂 {pet.age} tuổi</p>
                      <p>⚖️ {pet.weight} kg</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Services Info */}
        {appointment.services && appointment.services.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <BriefcaseIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Dịch vụ đã đăng ký</h3>
            </div>
            <div className="space-y-4">
              {appointment.services.map(service => (
                <div key={service.id} className="p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-blue-200">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-lg mb-1">{service.name}</p>
                      <p className="text-gray-600 text-sm">{service.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-teal-600 text-lg">{service.price ? formatPrice(service.price) : 'Liên hệ'}</p>
                      {service.duration && <p className="text-gray-500 text-sm">⏱️ {service.duration} phút</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Lịch sử</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="w-6 h-6 text-teal-600" />
                </div>
                <div className="w-0.5 h-12 bg-gray-200"></div>
              </div>
              <div className="flex-1 pb-4">
                <p className="font-semibold text-gray-900">Đã tạo lịch hẹn</p>
                <p className="text-sm text-gray-600">{new Date(appointment.createdAt).toLocaleString('vi-VN')}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                </div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Cập nhật lần cuối</p>
                <p className="text-sm text-gray-600">{new Date(appointment.updatedAt).toLocaleString('vi-VN')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <XMarkIcon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Xác nhận hủy lịch hẹn</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn hủy lịch hẹn này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Đóng
              </button>
              <button
                onClick={handleCancelAppointment}
                disabled={cancelling}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50"
              >
                {cancelling ? 'Đang hủy...' : 'Xác nhận hủy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentDetailPage;