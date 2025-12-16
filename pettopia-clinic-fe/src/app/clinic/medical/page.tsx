'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Eye, Loader2, Clock, User, Phone, PawPrint, Filter, Search, X, RefreshCw, ChevronRight, FileText } from 'lucide-react';
import { getAppointments, type AppointmentData } from '@/services/partner/clinicService';
import { getCustomerById } from '@/services/customer/customerService';
import { useToast } from '@/contexts/ToastContext';

// Extended appointment với thông tin customer
interface ExtendedAppointment extends AppointmentData {
  customer_name?: string;
  phone?: string;
  pet_names?: string[];
}

// Component: Danh sách appointments đã check-in
interface AppointmentListProps {
  appointments: ExtendedAppointment[];
  loading: boolean;
  onViewDetail: (appointmentId: string) => void;
  filters: {
    searchQuery: string;
    dateFrom: string;
    dateTo: string;
    shift: string;
  };
  onFilterChange: (filters: {
    searchQuery: string;
    dateFrom: string;
    dateTo: string;
    shift: string;
  }) => void;
  onRefresh: () => void;
}

function AppointmentList({ appointments, loading, onViewDetail, filters, onFilterChange, onRefresh }: AppointmentListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } catch {
      return 'N/A';
    }
  };

  const getShiftLabel = (shift: string) => {
    switch (shift?.toLowerCase()) {
      case 'morning': return 'Sáng';
      case 'afternoon': return 'Chiều';
      case 'evening': return 'Tối';
      case 'night': return 'Đêm';
      default: return shift || 'N/A';
    }
  };

  const getShiftColor = (shift: string) => {
    switch (shift?.toLowerCase()) {
      case 'morning': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'afternoon': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'evening': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'night': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const [showFilters, setShowFilters] = useState(false);

  const handleResetFilters = () => {
    onFilterChange({
      searchQuery: '',
      dateFrom: '',
      dateTo: '',
      shift: ''
    });
  };

  const hasActiveFilters = filters.searchQuery || filters.dateFrom || filters.dateTo || filters.shift;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Quản Lý Hồ Sơ Y Tế</h1>
      <p className="text-gray-500 text-sm"></p>
      <div className="min-h-screen p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-gray-600 mt-2">
                  {new Date().toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </h1>
              </div>
              <button
                onClick={onRefresh}
                disabled={loading}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                Làm mới
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-blue-600 font-medium">Tổng lịch hẹn</p>
                <p className="text-2xl font-bold text-blue-900">{appointments.length}</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <p className="text-sm text-amber-600 font-medium">Ca sáng</p>
                <p className="text-2xl font-bold text-amber-900">
                  {appointments.filter(a => a.shift?.toLowerCase() === 'morning').length}
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <p className="text-sm text-orange-600 font-medium">Ca chiều</p>
                <p className="text-2xl font-bold text-orange-900">
                  {appointments.filter(a => a.shift?.toLowerCase() === 'afternoon').length}
                </p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <p className="text-sm text-indigo-600 font-medium">Ca tối</p>
                <p className="text-2xl font-bold text-indigo-900">
                  {appointments.filter(a => a.shift?.toLowerCase() === 'evening').length}
                </p>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="p-3 mb-3">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Tìm theo tên, số điện thoại hoặc mã lịch hẹn..."
                    value={filters.searchQuery}
                    onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 rounded-lg border transition flex items-center gap-2 ${showFilters
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
              >
                <Filter size={20} />
                Lọc
              </button>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Date From */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Từ ngày
                    </label>
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => onFilterChange({ ...filters, dateFrom: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Date To */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Đến ngày
                    </label>
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => onFilterChange({ ...filters, dateTo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Shift */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ca làm việc
                    </label>
                    <select
                      value={filters.shift}
                      onChange={(e) => onFilterChange({ ...filters, shift: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Tất cả</option>
                      <option value="Morning">Sáng</option>
                      <option value="Afternoon">Chiều</option>
                      <option value="Evening">Tối</option>
                      <option value="Night">Đêm</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                  <span className="font-medium">Đang lọc:</span>
                  {filters.shift && (
                    <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full flex items-center gap-1">
                      {getShiftLabel(filters.shift)}
                      <button onClick={() => onFilterChange({ ...filters, shift: '' })}>
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  {filters.dateFrom && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full flex items-center gap-1">
                      Từ: {formatDate(filters.dateFrom)}
                      <button onClick={() => onFilterChange({ ...filters, dateFrom: '' })}>
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  {filters.dateTo && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full flex items-center gap-1">
                      Đến: {formatDate(filters.dateTo)}
                      <button onClick={() => onFilterChange({ ...filters, dateTo: '' })}>
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  {filters.searchQuery && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full flex items-center gap-1">
                      Tìm kiếm: {filters.searchQuery}
                      <button onClick={() => onFilterChange({ ...filters, searchQuery: '' })}>
                        <X size={14} />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Appointments List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin h-8 w-8 text-teal-600 mr-2" />
                <span className="text-gray-600">Đang tải danh sách...</span>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">Không có lịch hẹn nào đã check-in</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {appointments.map((apt) => (
                  <div
                    key={apt.id || apt._id}
                    className="p-6 hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => onViewDetail(apt.id || apt._id || '')}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getShiftColor(apt.shift || '')}`}>
                            {getShiftLabel(apt.shift || '')}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatTime(apt.date)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDate(apt.date)}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="text-gray-400" size={18} />
                            <span className="font-semibold text-gray-900">
                              {apt.customer_name || 'Khách hàng'}
                            </span>
                          </div>

                          {apt.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="text-gray-400" size={18} />
                              <span className="text-gray-600">{apt.phone}</span>
                            </div>
                          )}

                          {apt.pet_ids && apt.pet_ids.length > 0 && (
                            <div className="flex items-center gap-2">
                              <PawPrint className="text-gray-400" size={18} />
                              <span className="text-gray-600">
                                {apt.pet_ids.length} thú cưng
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDetail(apt.id || apt._id || '');
                          }}
                          className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium flex items-center gap-2"
                        >
                          <Eye size={18} />
                          Xem chi tiết
                        </button>
                        <ChevronRight className="text-gray-400" size={24} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Results Count */}
          {!loading && appointments.length > 0 && (
            <div className="mt-4 text-center text-sm text-gray-600">
              Hiển thị <strong>{appointments.length}</strong> lịch hẹn đã check-in
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Component chính
export default function MedicalReportManager() {
  const router = useRouter();
  const { showError } = useToast();
  const [allAppointments, setAllAppointments] = useState<ExtendedAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(1000); // Lấy nhiều để filter
  const [filters, setFilters] = useState({
    searchQuery: '',
    dateFrom: '',
    dateTo: '',
    shift: ''
  });

  useEffect(() => {
    fetchAppointments();
  }, [page]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await getAppointments(page, limit);

      // Lọc chỉ những appointments có status "Checked_In"
      const checkedInAppointments = response.data.filter(
        (appointment: AppointmentData) => appointment.status === 'Checked_In'
      );

      // Enrich appointments với customer info
      const enrichedAppointments = await Promise.all(
        checkedInAppointments.map(async (apt: AppointmentData) => {
          const enriched: ExtendedAppointment = { ...apt };

          // Lấy customer name nếu có customer_id hoặc user_id
          const customerId = apt.customer || apt.user_id;
          if (customerId) {
            try {
              const customerData = await getCustomerById(customerId);
              const fullname = customerData?.data?.fullname || customerData?.fullname;
              const phone = customerData?.data?.phone_number || customerData?.phone_number;

              if (fullname) {
                enriched.customer_name = fullname;
              }
              if (phone) {
                enriched.phone = phone;
              }
            } catch (err) {
              console.warn(`Không thể lấy thông tin khách hàng ${customerId}:`, err);
            }
          }

          return enriched;
        })
      );

      setAllAppointments(enrichedAppointments);
    } catch (error: any) {
      console.error('Lỗi khi lấy danh sách appointments:', error);
      showError(error?.response?.data?.message || 'Không thể tải danh sách lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const filteredAppointments = useMemo(() => {
    let filtered = [...allAppointments];

    // Filter by search query (ID, customer name, phone)
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.trim().toLowerCase();
      filtered = filtered.filter((appointment) => {
        const appointmentId = (appointment.id || appointment._id || '').toLowerCase();
        const customerName = (appointment.customer_name || '').toLowerCase();
        const phone = (appointment.phone || '').toLowerCase();

        return appointmentId.includes(query) ||
          customerName.includes(query) ||
          phone.includes(query);
      });
    }

    // Filter by date from
    if (filters.dateFrom) {
      filtered = filtered.filter((appointment) => {
        try {
          const aptDate = new Date(appointment.date);
          aptDate.setHours(0, 0, 0, 0);
          const filterDate = new Date(filters.dateFrom);
          filterDate.setHours(0, 0, 0, 0);
          return aptDate >= filterDate;
        } catch {
          return false;
        }
      });
    }

    // Filter by date to
    if (filters.dateTo) {
      filtered = filtered.filter((appointment) => {
        try {
          const aptDate = new Date(appointment.date);
          aptDate.setHours(0, 0, 0, 0);
          const filterDate = new Date(filters.dateTo);
          filterDate.setHours(0, 0, 0, 0);
          return aptDate <= filterDate;
        } catch {
          return false;
        }
      });
    }

    // Filter by shift
    if (filters.shift) {
      filtered = filtered.filter((appointment) => {
        return appointment.shift?.toLowerCase() === filters.shift.toLowerCase();
      });
    }

    // Sort by date (oldest to newest), then by shift within same date
    const shiftOrder: Record<string, number> = { morning: 1, afternoon: 2, evening: 3, night: 4 };
    filtered.sort((a, b) => {
      // First sort by date (oldest to newest)
      try {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();

        if (dateA !== dateB) {
          return dateA - dateB; // Oldest first
        }

        // If same date, sort by shift
        const orderA = shiftOrder[a.shift?.toLowerCase() || ''] || 999;
        const orderB = shiftOrder[b.shift?.toLowerCase() || ''] || 999;
        return orderA - orderB;
      } catch {
        return 0;
      }
    });

    return filtered;
  }, [allAppointments, filters]);

  const handleViewDetail = (appointmentId: string) => {
    router.push(`/clinic/medical/${appointmentId}`);
  };

  return (
    <AppointmentList
      appointments={filteredAppointments}
      loading={loading}
      onViewDetail={handleViewDetail}
      filters={filters}
      onFilterChange={setFilters}
      onRefresh={fetchAppointments}
    />
  );
}
