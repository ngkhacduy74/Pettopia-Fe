'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, AlertCircle, Loader } from 'lucide-react';
import { getVetAppointments } from '@/services/partner/veterianrianService';
import { VetAppointment } from '@/services/partner/veterianrianService';
import { useToast } from '@/contexts/ToastContext';

type AppointmentStatus = 'Pending' | 'Confirmed' | 'Checked_In' | 'Completed' | 'Cancelled';

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Checked_In: 'bg-green-100 text-green-800',
  Completed: 'bg-purple-100 text-purple-800',
  Cancelled: 'bg-red-100 text-red-800',
};

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  Pending: 'Đang chờ',
  Confirmed: 'Xác nhận',
  Checked_In: 'Đã check-in',
  Completed: 'Hoàn thành',
  Cancelled: 'Hủy',
};

interface VetScheduleProps {
  status?: AppointmentStatus;
}

export default function VetSchedule({ status }: VetScheduleProps) {
  const [appointments, setAppointments] = useState<VetAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus | undefined>(status);
  const { showError } = useToast();

  useEffect(() => {
    fetchAppointments();
  }, [selectedStatus]);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getVetAppointments(selectedStatus);
      setAppointments(response.data);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Không thể tải lịch hẹn. Vui lòng thử lại.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const shiftLabels: Record<string, string> = {
    Morning: 'Sáng (8:00 - 12:00)',
    Afternoon: 'Chiều (13:00 - 17:00)',
    Evening: 'Tối (18:00 - 21:00)',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="w-8 h-8 text-teal-600 animate-spin mr-2" />
        <span className="text-gray-600">Đang tải lịch hẹn...</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Filter Section */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedStatus(undefined)}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            selectedStatus === undefined
              ? 'bg-teal-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Tất cả
        </button>
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedStatus(key as AppointmentStatus)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedStatus === key
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-900">Lỗi</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {appointments.length === 0 && !error && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Không có lịch hẹn nào</p>
          <p className="text-gray-400 text-sm mt-1">
            {selectedStatus ? `Hiện không có lịch hẹn với trạng thái "${STATUS_LABELS[selectedStatus]}"` : 'Bạn chưa có lịch hẹn nào được phân công'}
          </p>
        </div>
      )}

      {/* Appointments List */}
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            {/* Header with Status */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg mb-2">
                  Lịch hẹn #{appointment.id.slice(0, 8)}
                </h3>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ml-4 ${
                  STATUS_COLORS[appointment.status as AppointmentStatus]
                }`}
              >
                {STATUS_LABELS[appointment.status as AppointmentStatus]}
              </span>
            </div>

            {/* Appointment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date and Time */}
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Ngày hẹn</p>
                  <p className="font-medium text-gray-900">{formatDate(appointment.date)}</p>
                </div>
              </div>

              {/* Shift */}
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Ca làm việc</p>
                  <p className="font-medium text-gray-900">{shiftLabels[appointment.shift] || appointment.shift}</p>
                </div>
              </div>

              {/* Pets */}
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Số thú cưng</p>
                  <p className="font-medium text-gray-900">{appointment.pet_ids.length} thú cưng</p>
                </div>
              </div>

              {/* Services */}
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Số dịch vụ</p>
                  <p className="font-medium text-gray-900">{appointment.service_ids.length} dịch vụ</p>
                </div>
              </div>
            </div>

            {/* Cancel Reason (if available) */}
            {appointment.cancel_reason && (
              <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Lý do:</span> {appointment.cancel_reason}
                </p>
              </div>
            )}

            {/* Timestamps */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-4 text-xs text-gray-500">
              <span>Tạo: {new Date(appointment.createdAt).toLocaleString('vi-VN')}</span>
              <span>Cập nhật: {new Date(appointment.updatedAt).toLocaleString('vi-VN')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
