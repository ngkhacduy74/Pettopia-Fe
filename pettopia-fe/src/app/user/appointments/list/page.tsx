'use client';

import React, { useState, useEffect } from 'react';
import type { Appointment, AppointmentsResponse } from '@/services/petcare/petService';
import { getAppointments } from '@/services/petcare/petService';
import { useToast } from '@/contexts/ToastContext';
import Link from 'next/link';
import axios from 'axios';

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

const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

const ViewAppointmentsPage = () => {
  const { showError, showSuccess } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [shiftFilter, setShiftFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'upcoming' | 'all' | 'past'>('upcoming');

  const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response: AppointmentsResponse = await getAppointments({ page: 1, limit: 200 });
        setAppointments(response.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Không thể tải lịch hẹn.');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  // Helper - Xử lý múi giờ Việt Nam
  const parseLocalDate = (dateStr: string): Date => {
    // Tạo date từ string YYYY-MM-DD theo múi giờ local (tránh UTC conversion)
    const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const getDateString = (date: Date): string => {
    // Trả về YYYY-MM-DD từ Date object
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Lọc theo ngày chọn hoặc bộ lọc thường
  useEffect(() => {
    let filtered = [...appointments];

    if (selectedDate) {
      const selectedStr = getDateString(selectedDate);
      filtered = filtered.filter(apt => {
        const aptDateStr = apt.date.split('T')[0];
        return aptDateStr === selectedStr;
      });
    } else {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      
      if (viewMode === 'upcoming') {
        filtered = filtered.filter(a => {
          const aptDate = parseLocalDate(a.date);
          aptDate.setHours(0, 0, 0, 0);
          return aptDate >= now;
        });
      }
      if (viewMode === 'past') {
        filtered = filtered.filter(a => {
          const aptDate = parseLocalDate(a.date);
          aptDate.setHours(0, 0, 0, 0);
          return aptDate < now;
        });
      }
      if (statusFilter !== 'all') filtered = filtered.filter(a => a.status === statusFilter);
      if (shiftFilter !== 'all') filtered = filtered.filter(a => a.shift === shiftFilter);
    }

    filtered.sort((a, b) => {
      const dateA = parseLocalDate(a.date).getTime();
      const dateB = parseLocalDate(b.date).getTime();
      return selectedDate || viewMode === 'past' ? dateB - dateA : dateA - dateB;
    });

    setFilteredAppointments(filtered);
  }, [appointments, selectedDate, statusFilter, shiftFilter, viewMode]);

  // Helper functions
  const formatShift = (s: string) => ({ Morning: 'Sáng', Afternoon: 'Chiều', Evening: 'Tối' }[s] || s);
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
    const date = parseLocalDate(d);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const formatLongDate = (d: string) => {
    const date = parseLocalDate(d);
    const dow = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'][date.getDay()];
    return `${dow}, ${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Xác định màu CHẤM NHỎ theo ưu tiên cao nhất
  const getDotColor = (day: number): string | null => {
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = getDateString(checkDate);
    
    const dayAppts = appointments.filter(a => a.date.split('T')[0] === dateStr);
    if (dayAppts.length === 0) return null;
    if (dayAppts.some(a => a.status === 'Cancelled')) return 'bg-red-500';
    if (dayAppts.some(a => a.status === 'Pending_Confirmation')) return 'bg-yellow-500';
    if (dayAppts.some(a => a.status === 'Confirmed')) return 'bg-emerald-500';
    if (dayAppts.some(a => a.status === 'Completed')) return 'bg-blue-500';
    return null;
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = (firstDay + 6) % 7;

    const days = [];
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) days.push({ day: prevMonthDays - i, current: false });
    for (let i = 1; i <= daysInMonth; i++) days.push({ day: i, current: true });
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) days.push({ day: i, current: false });
    return days;
  };

  const changeMonth = (dir: number) => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + dir, 1));
  
  const isToday = (day: number) => {
    const t = new Date();
    return day === t.getDate() && currentDate.getMonth() === t.getMonth() && currentDate.getFullYear() === t.getFullYear();
  };
  
  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return selectedDate.getDate() === day && 
           selectedDate.getMonth() === currentDate.getMonth() && 
           selectedDate.getFullYear() === currentDate.getFullYear();
  };

  const days = getDaysInMonth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản Lý Lịch Hẹn</h1>
          <p className="text-gray-600">Theo dõi và quản lý lịch chăm sóc thú cưng</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lịch */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronLeftIcon className="w-6 h-6 text-teal-600" />
                </button>
                <h2 className="text-xl font-bold text-gray-900">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronRightIcon className="w-6 h-6 text-teal-600" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-sm font-semibold text-gray-600 mb-2">
                {daysOfWeek.map(d => <div key={d}>{d}</div>)}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map((d, i) => {
                  const dotColor = d.current ? getDotColor(d.day) : null;
                  const today = isToday(d.day) && d.current;
                  const selected = isSelected(d.day) && d.current;

                  return (
                    <button
                      key={i}
                      onClick={() => d.current && setSelectedDate(prev => {
                        const clicked = new Date(currentDate.getFullYear(), currentDate.getMonth(), d.day);
                        return prev?.getTime() === clicked.getTime() ? null : clicked;
                      })}
                      disabled={!d.current}
                      className={`
                        aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium
                        transition-all relative group
                        ${!d.current ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer hover:bg-teal-50'}
                        ${today ? 'bg-teal-600 text-white font-bold' : ''}
                        ${selected ? 'ring-2 ring-orange-500 ring-offset-2' : ''}
                      `}
                    >
                      <span className="relative z-10">{d.day}</span>
                      {dotColor && (
                        <div className={`absolute bottom-1.5 w-1 h-1 ${dotColor} rounded-full shadow-sm`}></div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-wrap gap-3 text-xs text-gray-600">
                <span className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div>Đã hủy</span>
                <span className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-500 rounded-full"></div>Chờ xác nhận</span>
                <span className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-full"></div>Đã xác nhận</span>
                <span className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div>Hoàn thành</span>
              </div>
            </div>
          </div>

          {/* Danh sách lịch hẹn */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedDate ? `Lịch hẹn ngày ${formatLongDate(selectedDate.toISOString())}` : `Danh sách lịch hẹn (${filteredAppointments.length})`}
                </h3>
                {selectedDate && (
                  <button onClick={() => setSelectedDate(null)} className="text-teal-600 hover:underline font-medium">
                    Xem tất cả
                  </button>
                )}
              </div>

              {!selectedDate && (
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select value={viewMode} onChange={e => setViewMode(e.target.value as any)} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500">
                    <option value="upcoming">Sắp tới</option>
                    <option value="all">Tất cả</option>
                    <option value="past">Đã qua</option>
                  </select>
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500">
                    <option value="all">Tất cả trạng thái</option>
                    <option value="Pending_Confirmation">Chờ xác nhận</option>
                    <option value="Confirmed">Đã xác nhận</option>
                    <option value="Completed">Hoàn thành</option>
                    <option value="Cancelled">Đã hủy</option>
                  </select>
                  <select value={shiftFilter} onChange={e => setShiftFilter(e.target.value)} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500">
                    <option value="all">Tất cả ca</option>
                    <option value="Morning">Sáng</option>
                    <option value="Afternoon">Chiều</option>
                    <option value="Evening">Tối</option>
                  </select>
                </div>
              )}

              {loading ? (
                <div className="text-center py-16">
                  <div className="inline-block w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <CalendarIcon className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                  <p>Không có lịch hẹn nào {selectedDate && 'trong ngày này'}</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-screen overflow-y-auto">
                  {filteredAppointments.map(apt => (
                    <div key={apt.id} className="p-3 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border border-teal-200 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-gray-900">Lịch hẹn - Ca {formatShift(apt.shift)}</h4>
                          <p className="text-sm text-gray-600">{formatLongDate(apt.date)}</p>
                        </div>
                        <span className={`${getStatusColor(apt.status)} text-white px-4 py-1.5 rounded-full text-sm font-bold`}>
                          {formatStatus(apt.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mb-4">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-5 h-5 text-teal-600" />
                          {formatDate(apt.date)}
                        </div>
                        <div className="flex items-center gap-2">
                          <ClockIcon className="w-5 h-5 text-teal-600" />
                          Ca {formatShift(apt.shift)}
                        </div>
                      </div>

                      <div className="flex gap-3 text-sm text-gray-600">
                        <span>{apt.pet_ids.length} thú cưng</span>
                        <span>•</span>
                        <span>{apt.service_ids.length} dịch vụ</span>
                      </div>

                      <div className="flex gap-3 mt-4">
                        <Link href={`/user/appointments/${apt.id}`} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 rounded-lg text-center transition">
                          Xem chi tiết
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAppointmentsPage;