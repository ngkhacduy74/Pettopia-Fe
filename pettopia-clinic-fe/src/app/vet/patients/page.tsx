'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  User, 
  Phone, 
  Heart, 
  ClipboardList, 
  Pill, 
  FileText, 
  Plus, 
  X, 
  Save, 
  Loader2,
  Edit,
  Eye,
  Search,
  Filter
} from 'lucide-react';
import {
  getVetAppointments,
  type VetAppointment
} from '@/services/partner/veterianrianService';
import { useToast } from '@/contexts/ToastContext';

export default function VetPatientsPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const [appointments, setAppointments] = useState<VetAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      // Chỉ lấy các lịch hẹn đang xử lý (In_Progress) cho bác sĩ
      const inProgressResponse = await getVetAppointments('In_Progress');

      if (inProgressResponse.status === 'success' && inProgressResponse.data) {
        setAppointments(inProgressResponse.data);
      } else {
        setAppointments([]);
      }
    } catch (error: any) {
      console.error('Lỗi khi lấy danh sách appointments:', error);
      showError(error?.response?.data?.message || 'Không thể tải danh sách lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredAppointments = appointments.filter((apt) => {
    const searchLower = searchTerm.toLowerCase();
    const appointmentId = (apt.id || apt._id || '').toLowerCase();
    const status = (apt.status || '').toLowerCase();
    return (
      appointmentId.includes(searchLower) ||
      status.includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div >
       
          <Loader2 className="animate-spin text-teal-600" size={32} />
         
      </div>
    );
  }

  return (
    <div >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Check-In Khách hàng</h1>
        <p className="text-gray-500 text-sm">Check In khi khách hàng đã có mặt và làm thủ tục khác</p>
        </div>

        {/* Search and Filter */}
        <div className="p-2 mb-3">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm theo ID lịch hẹn, trạng thái..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="grid gap-4">
          {filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500 text-lg">Không có lịch hẹn nào</p>
            </div>
          ) : (
            filteredAppointments.map((appointment) => (
              <div
                key={appointment.id || appointment._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="text-teal-600" size={20} />
                      <span className="font-semibold text-gray-900">
                        {formatDate(appointment.date)}
                      </span>
                      <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
                        {appointment.shift}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'Completed'
                            ? 'bg-green-100 text-green-700'
                            : appointment.status === 'In_Progress'
                            ? 'bg-blue-100 text-blue-700'
                            : appointment.status === 'Checked_In'
                            ? 'bg-indigo-100 text-indigo-700'
                            : appointment.status === 'Confirmed'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">ID:</span> {appointment.id?.slice(0, 8) || appointment._id?.slice(0, 8)}
                    </div>
                  </div>
                  {appointment.status === 'In_Progress' ? (
                    <button
                      onClick={() =>
                        router.push(`/vet/medical/${appointment.id || appointment._id}`)
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                    >
                      <Edit size={18} />
                      Xem chi tiết thú cưng
                    </button>
                  ) : appointment.status === 'Completed' ? (
                    <button
                      onClick={() => router.push(`/vet/medical/${appointment.id}`)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                      <Eye size={18} />
                      Xem chi tiết
                    </button>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

