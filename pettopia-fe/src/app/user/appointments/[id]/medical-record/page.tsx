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

export default function MedicalRecordPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params?.id as string;

  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null);
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMedicalRecord, setLoadingMedicalRecord] = useState(false);

  useEffect(() => {
    if (!appointmentId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Lấy thông tin appointment
        const appointmentData = await getAppointmentDetail(appointmentId);
        setAppointment(appointmentData);

        // Kiểm tra xem appointment có thể có medical record không
        if (appointmentData.status === 'Completed' || appointmentData.status === 'Checked_In') {
          try {
            setLoadingMedicalRecord(true);
            const medicalRecordData = await getAppointmentMedicalRecord(appointmentId);
            // Kiểm tra xem có dữ liệu medical record không
            if (medicalRecordData && Object.keys(medicalRecordData).length > 0) {
              setMedicalRecord(medicalRecordData);
            } else {
              setMedicalRecord(null);
            }
          } catch (err: any) {
            // Medical record might not exist
            console.log('No medical record found for this appointment');
            setMedicalRecord(null);
          } finally {
            setLoadingMedicalRecord(false);
          }
        } else {
          // Appointment chưa hoàn thành, không có medical record
          setMedicalRecord(null);
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Không thể tải thông tin lịch hẹn');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  // Kiểm tra nếu appointment chưa hoàn thành
  if (appointment.status !== 'Completed' && appointment.status !== 'Checked_In') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link
              href={`/user/appointments/${appointmentId}`}
              className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium mb-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại chi tiết lịch hẹn
            </Link>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Chưa có hồ sơ bệnh án</h2>
            <p className="text-gray-600 mb-6">
              Hồ sơ bệnh án chỉ có sẵn sau khi lịch hẹn đã hoàn thành hoặc đã được check-in.
              <br />
              Trạng thái hiện tại: <span className="font-semibold">{formatStatus(appointment.status)}</span>
            </p>
            <Link
              href={`/user/appointments/${appointmentId}`}
              className="inline-block px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
            >
              Xem chi tiết lịch hẹn
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
            href={`/user/appointments/${appointmentId}`}
            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại chi tiết lịch hẹn
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Hồ sơ bệnh án</h1>
          <p className="text-gray-600 mt-2">
            Lịch hẹn ngày {formatDate(appointment.date)} - {formatShift(appointment.shift)}
          </p>
        </div>

        {/* Appointment Info Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin lịch hẹn</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Phòng khám</p>
              <p className="font-semibold text-gray-900">{appointment.clinic_info?.clinic_name || 'Chưa có tên'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Trạng thái</p>
              <p className="font-semibold text-gray-900">{formatStatus(appointment.status)}</p>
            </div>
            {(appointment.pet_infos || []).length > 0 && (
              <div>
                <p className="text-sm text-gray-600">Thú cưng</p>
                <div className="space-y-1">
                  {appointment.pet_infos?.map((pet) => (
                    <p key={pet.id} className="font-semibold text-gray-900">
                      {pet.name || 'Không tên'}
                    </p>
                  ))}
                </div>
              </div>
            )}
            {(appointment.service_infos || []).length > 0 && (
              <div>
                <p className="text-sm text-gray-600">Dịch vụ</p>
                <div className="space-y-1">
                  {appointment.service_infos?.map((service) => (
                    <p key={service.id || service._id} className="font-semibold text-gray-900">
                      {service.name || 'Dịch vụ'}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Medical Record Card */}
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl shadow-lg p-8 border border-teal-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Hồ sơ bệnh án</h2>
              <p className="text-sm text-gray-600">Thông tin chi tiết về lần khám này</p>
            </div>
          </div>

          {loadingMedicalRecord ? (
            <div className="text-center py-12">
              <div className="inline-block w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Đang tải hồ sơ bệnh án...</p>
            </div>
          ) : medicalRecord ? (
            <div className="space-y-6">
              {medicalRecord.symptoms && (
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3 className="text-lg font-bold text-gray-900">Triệu chứng</h3>
                  </div>
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {medicalRecord.symptoms}
                  </p>
                </div>
              )}

              {medicalRecord.diagnosis && (
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <h3 className="text-lg font-bold text-gray-900">Chẩn đoán</h3>
                  </div>
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {medicalRecord.diagnosis}
                  </p>
                </div>
              )}

              {medicalRecord.prescription && (
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    <h3 className="text-lg font-bold text-gray-900">Đơn thuốc</h3>
                  </div>
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {medicalRecord.prescription}
                  </p>
                </div>
              )}

              {medicalRecord.notes && (
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <h3 className="text-lg font-bold text-gray-900">Ghi chú</h3>
                  </div>
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {medicalRecord.notes}
                  </p>
                </div>
              )}

              {!medicalRecord.symptoms && !medicalRecord.diagnosis && !medicalRecord.prescription && !medicalRecord.notes && (
                <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có thông tin hồ sơ bệnh án</h3>
                  <p className="text-gray-600">Hồ sơ bệnh án chưa được cập nhật cho lịch hẹn này.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có hồ sơ bệnh án</h3>
              <p className="text-gray-600 mb-6">Hồ sơ bệnh án chưa được tạo cho lịch hẹn này.</p>
              <Link
                href={`/user/appointments/${appointmentId}`}
                className="inline-block px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
              >
                Quay lại chi tiết lịch hẹn
              </Link>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex gap-4">
          <Link
            href={`/user/appointments/${appointmentId}`}
            className="flex-1 text-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            Quay lại chi tiết lịch hẹn
          </Link>
          <Link
            href="/user/appointments/list"
            className="flex-1 text-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium"
          >
            Danh sách lịch hẹn
          </Link>
        </div>
      </div>
    </div>
  );
}

