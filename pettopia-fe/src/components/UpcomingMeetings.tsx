'use client';

import React, { useState, useEffect } from 'react';
import { getAppointments, Appointment } from '@/services/petcare/petService'; // Adjust path as needed

// Heroicons as inline SVG components
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

const UpcomingMeetings = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

  // Fetch appointments from API
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await getAppointments({ page: 1, limit: 100 });
        setAppointments(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Không thể tải lịch hẹn');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Format shift to Vietnamese
  const formatShift = (shift: string) => {
    const shifts: Record<string, string> = {
      'Morning': 'Sáng',
      'Afternoon': 'Chiều',
      'Evening': 'Tối'
    };
    return shifts[shift] || shift;
  };

  // Format status to Vietnamese
  const formatStatus = (status: string) => {
    const statuses: Record<string, string> = {
      'Pending_Confirmation': 'Chờ xác nhận',
      'Confirmed': 'Đã xác nhận',
      'Cancelled': 'Đã hủy',
      'Completed': 'Hoàn thành'
    };
    return statuses[status] || status;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Pending_Confirmation': 'bg-yellow-600',
      'Confirmed': 'bg-teal-600',
      'Cancelled': 'bg-red-600',
      'Completed': 'bg-gray-600'
    };
    return colors[status] || 'bg-gray-600';
  };

  // Format date to DD/MM/YYYY
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Get upcoming appointments (sorted by date)
  const getUpcomingAppointments = () => {
    const now = new Date();
    return appointments
      .filter(apt => new Date(apt.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5); // Show only 5 upcoming appointments
  };

  // Get appointments for current month view
  const getAppointmentsForMonth = () => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate.getMonth() === currentDate.getMonth() && 
             aptDate.getFullYear() === currentDate.getFullYear();
    });
  };

  // Check if a day has appointments
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
  const upcomingAppointments = getUpcomingAppointments();

  return (
    <div className="w-full bg-transparent">
      <div className="max-w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <div className="bg-white rounded-xl p-4 border border-teal-100 shadow-sm">
            {/* Calendar Header */}
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

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {daysOfWeek.map((day, index) => (
                <div key={index} className="text-center text-gray-600 text-sm font-semibold py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
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

            {/* Add Event Button */}
            <a
              href="/user/user-booking"
              className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-lg transition-colors shadow-sm text-sm inline-block text-center"
            >
              Đặt lịch hẹn mới
            </a>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-xl p-4 border border-teal-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Lịch hẹn sắp tới</h3>
            
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                <p>Đang tải...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                <p>{error}</p>
              </div>
            ) : upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-3 bg-teal-50 rounded-lg border border-teal-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900 text-sm">
                        Lịch hẹn - {formatShift(appointment.shift)}
                      </h4>
                      <span className={`text-xs ${getStatusColor(appointment.status)} text-white px-2 py-1 rounded-full`}>
                        {formatStatus(appointment.status)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <span>{formatDate(appointment.date)}</span>
                      <span className="mx-2">•</span>
                      <span>Ca {formatShift(appointment.shift)}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {appointment.pet_ids.length} thú cưng • {appointment.service_ids.length} dịch vụ
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Chưa có lịch hẹn nào</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpcomingMeetings;