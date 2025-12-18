'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getAppointmentDetail,
  getAppointmentMedicalRecord,
  type AppointmentDetail,
  type MedicalRecord,
} from '@/services/petcare/petService';

export default function AppointmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params?.id as string;

  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(null);
  const [loadingMedicalRecord, setLoadingMedicalRecord] = useState(false);

  useEffect(() => {
    if (!appointmentId) return;

    const fetchAppointment = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAppointmentDetail(appointmentId); // returns data object (AppointmentDetail)
        setAppointment(data);
        
        // Fetch medical record if appointment is completed or checked in
        // Medical records có thể có cho các status: Completed, Checked_In
        if (data.status === 'Completed' || data.status === 'Checked_In') {
          try {
            setLoadingMedicalRecord(true);
            const medicalRecordData = await getAppointmentMedicalRecord(appointmentId);
            // Kiểm tra xem có dữ liệu medical record không (không phải object rỗng)
            if (medicalRecordData && Object.keys(medicalRecordData).length > 0) {
              setMedicalRecord(medicalRecordData);
            } else {
              setMedicalRecord(null);
            }
          } catch (err: any) {
            // Medical record might not exist, that's okay
            console.log('No medical record found for this appointment');
            setMedicalRecord(null);
          } finally {
            setLoadingMedicalRecord(false);
          }
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Không thể tải thông tin lịch hẹn');
        console.error('Error fetching appointment:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa rõ';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatShift = (shift?: string) => {
    if (!shift) return 'Chưa rõ';
    const shiftMap: Record<string, string> = {
      Morning: 'Sáng',
      Afternoon: 'Chiều',
      Evening: 'Tối',
      Night: 'Đêm',
      morning: 'Sáng',
      afternoon: 'Chiều',
      evening: 'Tối',
      night: 'Đêm',
    };
    return shiftMap[shift] || shift;
  };

  const formatStatus = (status?: string) => {
    if (!status) return 'Chưa rõ';
    const statusMap: Record<string, string> = {
      Pending_Confirmation: 'Chờ xác nhận',
      Confirmed: 'Đã xác nhận',
      Cancelled: 'Đã hủy',
      Completed: 'Hoàn thành',
      Checked_In: 'Đã check-in',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status?: string) => {
    const colorMap: Record<string, string> = {
      Pending_Confirmation: 'bg-yellow-500',
      Confirmed: 'bg-emerald-500',
      Cancelled: 'bg-red-500',
      Completed: 'bg-blue-500',
      Checked_In: 'bg-purple-500',
    };
    return colorMap[status || ''] || 'bg-gray-500';
  };

  const formatCurrency = (n?: number) => {
    if (typeof n !== 'number') return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
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

  // helper to build clinic address
  const clinicAddress = () => {
    const addr = appointment.clinic_info?.address;
    if (!addr) return 'Chưa cập nhật';
    return [addr.detail, addr.ward, addr.district, addr.city].filter(Boolean).join(', ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
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

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Lịch hẹn của bạn</h2>
              <p className="text-gray-600 mt-1">Ngày: {formatDate(appointment.date)}</p>
              <p className="text-gray-600 mt-1">Giờ: {formatShift(appointment.shift)}</p>
            </div>

            <span className={`${getStatusColor(appointment.status)} text-white px-4 py-2 rounded-full text-sm font-bold`}>
              {formatStatus(appointment.status)}
            </span>
          </div>

          {/* Clinic */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-bold text-gray-900 mb-2">Phòng khám</h3>
            <p className="text-gray-800">{appointment.clinic_info?.clinic_name || 'Chưa có tên phòng khám'}</p>
            <p className="text-gray-600 text-sm mt-1">Địa chỉ: {clinicAddress()}</p>
            {appointment.clinic_info?.phone?.phone_number && (
              <p className="text-gray-600 text-sm mt-1">Điện thoại: {appointment.clinic_info.phone.phone_number}</p>
            )}
            {appointment.clinic_info?.email?.email_address && (
              <p className="text-gray-600 text-sm mt-1">Email: {appointment.clinic_info.email.email_address}</p>
            )}
          </div>

          {/* Customer / Contact */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-bold text-gray-900 mb-2">Thông tin liên hệ</h3>
            <p className="text-gray-800">{appointment.user_info?.fullname || 'Khách hàng'}</p>
            {appointment.user_info?.phone_number && <p className="text-gray-600 text-sm mt-1">SĐT: {appointment.user_info.phone_number}</p>}
          </div>

          {/* Pets */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-bold text-gray-900 mb-3">Thú cưng ({(appointment.pet_infos || []).length})</h3>
            <div className="space-y-3">
              {(appointment.pet_infos || []).map((pet) => (
                <div key={pet.id} className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    <img src={pet.avatar_url || '/sampleimg/default-pet.jpg'} alt={pet.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{pet.name || 'Không tên'}</div>
                    <div className="text-sm text-gray-600">{[pet.species, pet.breed].filter(Boolean).join(' • ')}</div>
                  </div>
                </div>
              ))}
              {(appointment.pet_infos || []).length === 0 && <p className="text-gray-600">Không có thú cưng trong lịch hẹn này</p>}
            </div>
          </div>

          {/* Services */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-bold text-gray-900 mb-3">Dịch vụ ({(appointment.service_infos || []).length})</h3>
            <div className="space-y-3">
              {(appointment.service_infos || []).map((s) => (
                <div key={s.id || s._id} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900">{s.name || s.title || 'Dịch vụ'}</div>
                    {s.description && <div className="text-sm text-gray-600">{s.description}</div>}
                  </div>
                  <div className="text-right text-sm text-gray-700">
                    <div>{formatCurrency(s.price)}</div>
                    {s.duration && <div className="text-xs text-gray-500">{s.duration} phút</div>}
                  </div>
                </div>
              ))}
              {(appointment.service_infos || []).length === 0 && <p className="text-gray-600">Không có dịch vụ</p>}
            </div>
          </div>

          {/* Medical Record - Show if appointment is completed or checked in */}
          {(appointment.status === 'Completed' || appointment.status === 'Checked_In') && (
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="font-bold text-gray-900">Hồ sơ bệnh án</h3>
                </div>
                <Link
                  href={`/user/appointments/${appointmentId}/medical-record`}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                >
                  Xem chi tiết
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              
              {loadingMedicalRecord ? (
                <div className="text-center py-4">
                  <div className="inline-block w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-gray-600 mt-2">Đang tải hồ sơ...</p>
                </div>
              ) : medicalRecord ? (
                <div className="space-y-4">
                  {medicalRecord.symptoms && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Triệu chứng:</h4>
                      <p className="text-sm text-gray-800 bg-white p-3 rounded-lg border border-gray-200 whitespace-pre-wrap">
                        {medicalRecord.symptoms}
                      </p>
                    </div>
                  )}
                  
                  {medicalRecord.diagnosis && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Chẩn đoán:</h4>
                      <p className="text-sm text-gray-800 bg-white p-3 rounded-lg border border-gray-200 whitespace-pre-wrap">
                        {medicalRecord.diagnosis}
                      </p>
                    </div>
                  )}
                  
                  {medicalRecord.prescription && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Đơn thuốc:</h4>
                      <p className="text-sm text-gray-800 bg-white p-3 rounded-lg border border-gray-200 whitespace-pre-wrap">
                        {medicalRecord.prescription}
                      </p>
                    </div>
                  )}
                  
                  {medicalRecord.notes && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Ghi chú:</h4>
                      <p className="text-sm text-gray-800 bg-white p-3 rounded-lg border border-gray-200 whitespace-pre-wrap">
                        {medicalRecord.notes}
                      </p>
                    </div>
                  )}
                  
                  {!medicalRecord.symptoms && !medicalRecord.diagnosis && !medicalRecord.prescription && !medicalRecord.notes && (
                    <p className="text-sm text-gray-600 text-center py-4">Chưa có thông tin hồ sơ bệnh án</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-600 text-center py-4">Chưa có hồ sơ bệnh án cho lịch hẹn này</p>
              )}
            </div>
          )}

          {/* Footer / actions */}
          <div className="flex gap-4 pt-4 border-t">
            <Link
              href="/user/appointments/list"
              className="flex-1 text-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              Quay lại
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

