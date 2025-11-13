'use client';

import React, { useState, useEffect } from 'react';
import type { Appointment, AppointmentsResponse } from '../../../services/petcare/petService';
import { getAppointments } from '../../../services/petcare/petService';

// Icons
const ChevronLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
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

const FilterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
  </svg>
);

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];

const ViewAppointmentsPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [shiftFilter, setShiftFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'upcoming' | 'all' | 'past'>('upcoming');

  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        // Call backend service
        const response: AppointmentsResponse = await getAppointments({ page: 1, limit: 100 });
        setAppointments(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching appointments:', err);
        // Show more specific error message if available
        setError(err?.response?.data?.message || 'Không thể tải lịch hẹn. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  useEffect(() => {
    let filtered = [...appointments];

    // Filter by view mode
    const now = new Date();
    if (viewMode === 'upcoming') {
      filtered = filtered.filter(apt => new Date(apt.date) >= now);
    } else if (viewMode === 'past') {
      filtered = filtered.filter(apt => new Date(apt.date) < now);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    // Filter by shift
    if (shiftFilter !== 'all') {
      filtered = filtered.filter(apt => apt.shift === shiftFilter);
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return viewMode === 'past' ? dateB - dateA : dateA - dateB;
    });

    setFilteredAppointments(filtered);
  }, [appointments, statusFilter, shiftFilter, viewMode]);

  const formatShift = (shift: string) => {
    const shifts: Record<string, string> = {
      'Morning': 'Sáng',
      'Afternoon': 'Chiều',
      'Evening': 'Tối'
    };
    return shifts[shift] || shift;
  };

  const formatStatus = (status: string) => {
    const statuses: Record<string, string> = {
      'Pending_Confirmation': 'Chờ xác nhận',
      'Confirmed': 'Đã xác nhận',
      'Cancelled': 'Đã hủy',
      'Completed': 'Hoàn thành'
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Pending_Confirmation': 'bg-yellow-500',
      'Confirmed': 'bg-teal-500',
      'Cancelled': 'bg-red-500',
      'Completed': 'bg-gray-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusTextColor = (status: string) => {
    const colors: Record<string, string> = {
      'Pending_Confirmation': 'text-yellow-700',
      'Confirmed': 'text-teal-700',
      'Cancelled': 'text-red-700',
      'Completed': 'text-gray-700'
    };
    return colors[status] || 'text-gray-700';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatLongDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const dayOfWeek = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'][date.getDay()];
    return `${dayOfWeek}, ${day} ${month} ${year}`;
  };

  const getAppointmentsForMonth = () => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate.getMonth() === currentDate.getMonth() && 
             aptDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const hasAppointment = (day: number) => {
    const monthAppointments = getAppointmentsForMonth();
    return monthAppointments.some(apt => new Date(apt.date).getDate() === day);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7;

    const days = [];
    
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({ day: prevMonthLastDay - i, isCurrentMonth: false });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }
    
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false });
    }
    
    return days;
  };

  const changeMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear() && 
           day === today.getDate();
  };

  const days = getDaysInMonth(currentDate);

  const stats = {
    total: appointments.length,
    upcoming: appointments.filter(apt => new Date(apt.date) >= new Date()).length,
    pending: appointments.filter(apt => apt.status === 'Pending_Confirmation').length,
    confirmed: appointments.filter(apt => apt.status === 'Confirmed').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản Lý Lịch Hẹn</h1>
          <p className="text-gray-600">Theo dõi và quản lý lịch hẹn chăm sóc thú cưng của bạn</p>
        </div>

        {/* Statistics Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng lịch hẹn</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Sắp tới</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
              </div>
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-teal-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Chờ xác nhận</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center text-white text-xs font-bold">!</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Đã xác nhận</p>
                <p className="text-2xl font-bold text-gray-900">{stats.confirmed}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
              </div>
            </div>
          </div>
        </div> */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <button 
                  onClick={() => changeMonth(-1)}
                  className="p-2 hover:bg-teal-50 rounded-lg transition-colors"
                >
                  <ChevronLeftIcon className="w-5 h-5 text-teal-600" />
                </button>
                <h2 className="text-lg font-bold text-gray-900">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button 
                  onClick={() => changeMonth(1)}
                  className="p-2 hover:bg-teal-50 rounded-lg transition-colors"
                >
                  <ChevronRightIcon className="w-5 h-5 text-teal-600" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {daysOfWeek.map((day, index) => (
                  <div key={index} className="text-center text-gray-600 text-sm font-semibold py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map((dayObj, index) => {
                  const isCurrentDay = isToday(dayObj.day) && dayObj.isCurrentMonth;
                  const hasEvent = hasAppointment(dayObj.day) && dayObj.isCurrentMonth;
                  
                  return (
                    <button
                      key={index}
                      className={`
                        aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all relative
                        ${!dayObj.isCurrentMonth ? 'text-gray-400' : 'text-gray-700'}
                        ${isCurrentDay ? 'bg-teal-600 text-white font-bold shadow-md hover:bg-teal-700' : 'hover:bg-teal-50'}
                        ${hasEvent && !isCurrentDay ? 'text-teal-600 font-semibold bg-teal-50' : ''}
                      `}
                    >
                      {dayObj.day}
                      {hasEvent && !isCurrentDay && (
                        <div className="absolute bottom-1 w-1.5 h-1.5 bg-teal-600 rounded-full"></div>
                      )}
                    </button>
                  );
                })}
              </div>

              <button className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-lg transition-colors shadow-sm">
                Đặt lịch hẹn mới
              </button>
            </div>
          </div>

          {/* Appointments List Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              {/* Filters */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <FilterIcon className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-bold text-gray-900">Bộ lọc</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian</label>
                    <select 
                      value={viewMode}
                      onChange={(e) => setViewMode(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="upcoming">Sắp tới</option>
                      <option value="all">Tất cả</option>
                      <option value="past">Đã qua</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="all">Tất cả</option>
                      <option value="Pending_Confirmation">Chờ xác nhận</option>
                      <option value="Confirmed">Đã xác nhận</option>
                      <option value="Completed">Hoàn thành</option>
                      <option value="Cancelled">Đã hủy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ca làm việc</label>
                    <select 
                      value={shiftFilter}
                      onChange={(e) => setShiftFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="all">Tất cả</option>
                      <option value="Morning">Sáng</option>
                      <option value="Afternoon">Chiều</option>
                      <option value="Evening">Tối</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Appointments List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    Danh sách lịch hẹn ({filteredAppointments.length})
                  </h3>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600">Đang tải...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-red-500">{error}</p>
                  </div>
                ) : filteredAppointments.length > 0 ? (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {filteredAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg border border-teal-200 hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-base mb-1">
                              Lịch hẹn - Ca {formatShift(appointment.shift)}
                            </h4>
                            <p className="text-sm text-gray-600">{formatLongDate(appointment.date)}</p>
                          </div>
                          <span className={`${getStatusColor(appointment.status)} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
                            {formatStatus(appointment.status)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-teal-600" />
                            <span className="text-sm text-gray-700">{formatDate(appointment.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ClockIcon className="w-4 h-4 text-teal-600" />
                            <span className="text-sm text-gray-700">Ca {formatShift(appointment.shift)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 pt-3 border-t border-teal-200">
                          <span className="flex items-center gap-1">
                            <span className="font-semibold">{appointment.pet_ids.length}</span> thú cưng
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="font-semibold">{appointment.service_ids.length}</span> dịch vụ
                          </span>
                        </div>

                        <div className="flex gap-2 mt-3">
                          <button className="flex-1 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors">
                            Chi tiết
                          </button>
                          {appointment.status === 'Pending_Confirmation' && (
                            <button className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors">
                              Hủy
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Không có lịch hẹn nào</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAppointmentsPage;