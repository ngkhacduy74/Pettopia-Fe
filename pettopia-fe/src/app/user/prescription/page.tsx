'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAppointments, type Appointment, type AppointmentsResponse } from '@/services/petcare/petService';

export default function PrescriptionHistoryPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'Completed' | 'Cancelled'>('all');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        const response: AppointmentsResponse = await getAppointments({ page: 1, limit: 200 });
        
        // Lọc chỉ lấy appointments có status Completed hoặc Cancelled
        const historyAppointments = response.data.filter(
          (apt: Appointment) => apt.status === 'Completed' || apt.status === 'Cancelled'
        );
        
        // Sắp xếp theo ngày mới nhất trước
        historyAppointments.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA;
        });
        
        setAppointments(historyAppointments);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Không thể tải lịch sử khám.');
        console.error('Error fetching appointments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const formatDate = (dateString: string) => {
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

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const formatShift = (shift?: string) => {
    if (!shift) return 'Chưa rõ';
    const shiftMap: Record<string, string> = {
      Morning: 'Sáng',
      Afternoon: 'Chiều',
      Evening: 'Tối',
      Night: 'Đêm',
    };
    return shiftMap[shift] || shift;
  };

  const formatStatus = (status?: string) => {
    if (!status) return 'Chưa rõ';
    const statusMap: Record<string, string> = {
      Completed: 'Hoàn thành',
      Cancelled: 'Đã hủy',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status?: string) => {
    const colorMap: Record<string, string> = {
      Completed: 'bg-blue-500',
      Cancelled: 'bg-red-500',
    };
    return colorMap[status || ''] || 'bg-gray-500';
  };

  const getStatusBadgeColor = (status?: string) => {
    const colorMap: Record<string, string> = {
      Completed: 'bg-blue-100 text-blue-800 border-blue-200',
      Cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return colorMap[status || ''] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Lọc appointments theo status filter
  const filteredAppointments = statusFilter === 'all'
    ? appointments
    : appointments.filter(apt => apt.status === statusFilter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-16">
            <div className="inline-block w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Đang tải lịch sử khám...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-red-500 text-xl font-bold mb-4">Lỗi</div>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lịch sử khám</h1>
          <p className="text-gray-600">Xem lại các lịch hẹn đã hoàn thành hoặc đã hủy</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-6 flex gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-teal-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Tất cả ({appointments.length})
          </button>
          <button
            onClick={() => setStatusFilter('Completed')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'Completed'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Hoàn thành ({appointments.filter(a => a.status === 'Completed').length})
          </button>
          <button
            onClick={() => setStatusFilter('Cancelled')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'Cancelled'
                ? 'bg-red-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Đã hủy ({appointments.filter(a => a.status === 'Cancelled').length})
          </button>
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có lịch sử khám</h3>
            <p className="text-gray-600 mb-6">
              {statusFilter === 'all'
                ? 'Bạn chưa có lịch hẹn nào đã hoàn thành hoặc đã hủy.'
                : `Bạn chưa có lịch hẹn nào với trạng thái "${formatStatus(statusFilter)}".`}
            </p>
            <Link
              href="/user/appointments/booking"
              className="inline-block px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
            >
              Đặt lịch khám mới
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(appointment.status)}`}></div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {formatDate(appointment.date)}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(appointment.status)}`}>
                          {formatStatus(appointment.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 ml-6">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{formatShift(appointment.shift)}</span>
                        </div>
                        {appointment.pet_ids && appointment.pet_ids.length > 0 && (
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>{appointment.pet_ids.length} thú cưng</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {appointment.status === 'Completed' && (
                        <Link
                          href={`/user/appointments/${appointment.id}/medical-record`}
                          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-sm font-medium"
                        >
                          Xem hồ sơ bệnh án
                        </Link>
                      )}
                      <Link
                        href={`/user/appointments/${appointment.id}`}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>

                  {/* Appointment Info */}
                  <div className="grid md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Mã lịch hẹn</p>
                      <p className="text-sm font-medium text-gray-900 font-mono">
                        {appointment.id.slice(0, 8)}...
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Dịch vụ</p>
                      <p className="text-sm font-medium text-gray-900">
                        {appointment.service_ids?.length || 0} dịch vụ
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Ngày tạo</p>
                      <p className="text-sm font-medium text-gray-900">
                        {appointment.createdAt ? formatDate(appointment.createdAt) : 'Chưa rõ'}
                      </p>
                    </div>
                  </div>

                  {/* Cancel Reason (if cancelled) */}
                  {appointment.status === 'Cancelled' && (appointment as any).cancel_reason && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Lý do hủy</p>
                      <p className="text-sm text-gray-700 bg-red-50 p-3 rounded-lg border border-red-100">
                        {(appointment as any).cancel_reason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-8 flex gap-4">
          <Link
            href="/user/appointments/list"
            className="flex-1 text-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            Xem tất cả lịch hẹn
          </Link>
          <Link
            href="/user/appointments/booking"
            className="flex-1 text-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium"
          >
            Đặt lịch khám mới
          </Link>
        </div>
      </div>
    </div>
  );
}







