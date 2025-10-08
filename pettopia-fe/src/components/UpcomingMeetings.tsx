'use client';

import React, { useState } from 'react';

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
  const [currentDate, setCurrentDate] = useState(new Date(2022, 0, 22)); // January 22, 2022

  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

  const upcomingAppointments = [
    { id: 1, date: '10/01/2022', time: '09:00 AM', title: 'Khám định kỳ cho Milu', type: 'Khám sức khỏe' },
    { id: 2, date: '12/01/2022', time: '02:30 PM', title: 'Tiêm phòng cho Buddy', type: 'Tiêm phòng' },
    { id: 3, date: '19/01/2022', time: '11:00 AM', title: 'Grooming cho Max', type: 'Chăm sóc' },
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Convert to Monday-first

    const days = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({ day: prevMonthLastDay - i, isCurrentMonth: false });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }
    
    // Next month days
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false });
    }
    
    return days;
  };

  const changeMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const isToday = (day: number) => {
    return currentDate.getMonth() === 0 && day === 22;
  };

  const hasEvent = (day: number) => {
    return [10, 12, 19].includes(day);
  };

  const days = getDaysInMonth(currentDate);

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
                const hasEventDay = hasEvent(dayObj.day) && dayObj.isCurrentMonth;
                
                return (
                  <button
                    key={index}
                    className={`
                      aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all relative
                      ${!dayObj.isCurrentMonth ? 'text-gray-400' : 'text-gray-700'}
                      ${isCurrentDay ? 'bg-teal-600 text-white font-bold shadow-md hover:bg-teal-700' : 'hover:bg-teal-50'}
                      ${hasEventDay && !isCurrentDay ? 'text-teal-600 font-semibold bg-teal-50' : ''}
                    `}
                  >
                    {dayObj.day}
                    {hasEventDay && !isCurrentDay && (
                      <div className="absolute bottom-1 w-1.5 h-1.5 bg-teal-600 rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Add Event Button */}
            <button className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-lg transition-colors shadow-sm text-sm">
              Đặt lịch hẹn mới
            </button>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-xl p-4 border border-teal-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Lịch hẹn sắp tới</h3>
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-3 bg-teal-50 rounded-lg border border-teal-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900 text-sm">{appointment.title}</h4>
                    <span className="text-xs bg-teal-600 text-white px-2 py-1 rounded-full">
                      {appointment.type}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span>{appointment.date}</span>
                    <span className="mx-2">•</span>
                    <span>{appointment.time}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {upcomingAppointments.length === 0 && (
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