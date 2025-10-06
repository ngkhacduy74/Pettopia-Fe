'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, MoreVertical, Calendar, MapPin } from 'lucide-react';

interface CalendarProps {
  direction: 'horizontal' | 'vertical';
  day: Date;
}

const UpcomingMeetings = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2022, 0, 22)); // January 22, 2022
  
  const meetings = [
    {
      id: 1,
      name: 'Leslie Alexander',
      avatar: 'https://i.pravatar.cc/150?img=1',
      date: 'January 10th, 2022 at 5:00 PM',
      location: 'Starbucks'
    },
    {
      id: 2,
      name: 'Michael Foster',
      avatar: 'https://i.pravatar.cc/150?img=13',
      date: 'January 12th, 2022 at 3:00 PM',
      location: 'Tim Hortons'
    },
    {
      id: 3,
      name: 'Dries Vincent',
      avatar: 'https://i.pravatar.cc/150?img=12',
      date: 'January 12th, 2022 at 5:00 PM',
      location: 'Costa Coffee at Braehead'
    },
    {
      id: 4,
      name: 'Lindsay Walton',
      avatar: 'https://i.pravatar.cc/150?img=5',
      date: 'January 15th, 2022 at 2:00 PM',
      location: 'Coffee House'
    }
  ];

  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

  const getDaysInMonth = (date) => {
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

  const changeMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const isToday = (day) => {
    return currentDate.getMonth() === 0 && day === 22;
  };

  const hasEvent = (day) => {
    return [10, 12, 19].includes(day);
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-12">Upcoming meetings</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Meetings List */}
          <div className="space-y-6">
            {meetings.map((meeting) => (
              <div key={meeting.id} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <img 
                      src={meeting.avatar} 
                      alt={meeting.name}
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-700"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-3">{meeting.name}</h3>
                      <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{meeting.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{meeting.location}</span>
                      </div>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-slate-300 transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Calendar */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-8">
              <button 
                onClick={() => changeMonth(-1)}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-400" />
              </button>
              <h2 className="text-2xl font-bold text-white">
                {monthNames[currentDate.getMonth()]}
              </h2>
              <button 
                onClick={() => changeMonth(1)}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {daysOfWeek.map((day, index) => (
                <div key={index} className="text-center text-slate-500 text-sm font-medium py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((dayObj, index) => {
                const isCurrentDay = isToday(dayObj.day) && dayObj.isCurrentMonth;
                const hasEventDay = hasEvent(dayObj.day) && dayObj.isCurrentMonth;
                
                return (
                  <button
                    key={index}
                    className={`
                      aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all relative
                      ${!dayObj.isCurrentMonth ? 'text-slate-600' : 'text-slate-300'}
                      ${isCurrentDay ? 'bg-white text-slate-900 font-bold shadow-lg' : 'hover:bg-slate-700/50'}
                      ${hasEventDay && !isCurrentDay ? 'text-blue-400 font-semibold' : ''}
                    `}
                  >
                    {dayObj.day}
                    {hasEventDay && !isCurrentDay && (
                      <div className="absolute bottom-1 w-1 h-1 bg-blue-400 rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Add Event Button */}
            <button className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl transition-colors shadow-lg shadow-indigo-500/20">
              Add event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpcomingMeetings;