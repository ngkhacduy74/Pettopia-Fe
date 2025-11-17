import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimelineEvent {
  id: string;
  date: string;
  type: 'vaccine' | 'checkup' | 'grooming' | 'medication' | 'appointment' | 'note';
  title: string;
  description?: string;
  location?: string;
  status: 'completed' | 'upcoming' | 'missed';
}

// Mock data
const mockEvents: TimelineEvent[] = [
  {
    id: '1',
    date: '2025-11-20',
    type: 'vaccine',
    title: 'Tiêm phòng dại',
    description: 'Mũi tiêm phòng bệnh dại hàng năm',
    location: 'Phòng khám Pet Care',
    status: 'upcoming'
  },
  {
    id: '2',
    date: '2025-11-15',
    type: 'checkup',
    title: 'Khám sức khỏe định kỳ',
    description: 'Kiểm tra tổng quát, cân nặng 12.5kg',
    location: 'Bệnh viện thú y Sài Gòn',
    status: 'completed'
  },
  {
    id: '3',
    date: '2025-11-10',
    type: 'grooming',
    title: 'Cắt tỉa lông',
    description: 'Tắm, cắt móng, vệ sinh tai',
    location: 'Pet Spa Luxury',
    status: 'completed'
  },
  {
    id: '4',
    date: '2025-11-05',
    type: 'medication',
    title: 'Uống thuốc tẩy giun',
    description: 'Thuốc tẩy giun 3 tháng/lần',
    status: 'completed'
  },
  {
    id: '5',
    date: '2025-10-28',
    type: 'note',
    title: 'Thay đổi thức ăn',
    description: 'Chuyển sang Royal Canin Adult',
    status: 'completed'
  },
  {
    id: '6',
    date: '2025-10-20',
    type: 'checkup',
    title: 'Khám răng miệng',
    description: 'Lấy cao răng, kiểm tra nướu',
    location: 'Phòng khám Pet Dental',
    status: 'completed'
  },
  {
    id: '7',
    date: '2025-12-01',
    type: 'appointment',
    title: 'Hẹn khám mắt',
    description: 'Kiểm tra thị lực và viêm kết mạc',
    location: 'Bệnh viện thú y Sài Gòn',
    status: 'upcoming'
  },
  {
    id: '8',
    date: '2025-10-01',
    type: 'vaccine',
    title: 'Tiêm phòng 6 bệnh',
    description: 'Mũi nhắc lại vaccine 6 bệnh',
    location: 'Phòng khám Pet Care',
    status: 'missed'
  }
];

const typeConfig = {
  vaccine: { label: 'Tiêm phòng', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  checkup: { label: 'Khám bệnh', color: 'from-green-500 to-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  grooming: { label: 'Chăm sóc', color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  medication: { label: 'Thuốc', color: 'from-orange-500 to-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  appointment: { label: 'Hẹn khám', color: 'from-pink-500 to-pink-600', bg: 'bg-pink-50', border: 'border-pink-200' },
  note: { label: 'Ghi chú', color: 'from-gray-500 to-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' }
};

const statusConfig = {
  completed: { label: 'Hoàn thành', color: 'text-green-700', bg: 'bg-green-100' },
  upcoming: { label: 'Sắp tới', color: 'text-blue-700', bg: 'bg-blue-100' },
  missed: { label: 'Đã bỏ lỡ', color: 'text-red-700', bg: 'bg-red-100' }
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatMonthYear = (dateStr: string) => {
  const date = new Date(dateStr);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${year}`;
};

const getMonthName = (dateStr: string) => {
  const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
  const date = new Date(dateStr);
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
};

export default function PetTimeline() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  const filteredEvents = selectedType 
    ? mockEvents.filter(e => e.type === selectedType)
    : mockEvents;

  const sortedEvents = [...filteredEvents].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const groupedByMonth = sortedEvents.reduce((acc, event) => {
    const monthKey = formatMonthYear(event.date);
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(event);
    return acc;
  }, {} as Record<string, TimelineEvent[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            Lịch Sử Chăm Sóc
          </h1>
          <p className="text-gray-600">Theo dõi mọi hoạt động của bé cưng</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex gap-2 flex-wrap"
        >
          <button
            onClick={() => setSelectedType(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedType === null
                ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Tất cả ({mockEvents.length})
          </button>
          {Object.entries(typeConfig).map(([type, config]) => {
            const count = mockEvents.filter(e => e.type === type).length;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedType === type
                    ? `bg-gradient-to-r ${config.color} text-white shadow-lg`
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {config.label} ({count})
              </button>
            );
          })}
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-300 via-cyan-300 to-blue-300" />

          <div className="space-y-8">
            {Object.entries(groupedByMonth).map(([month, events]) => (
              <div key={month}>
                {/* Month header */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-4 mb-4"
                >
                  <div className="relative z-10 bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-bold">
                    {getMonthName(events[0].date)}
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-teal-200 to-transparent" />
                </motion.div>

                {/* Events */}
                <div className="space-y-4">
                  {events.map((event, idx) => {
                    const config = typeConfig[event.type];
                    const status = statusConfig[event.status];
                    
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="relative pl-20"
                      >
                        {/* Timeline dot */}
                        <div className={`absolute left-6 top-6 w-5 h-5 rounded-full bg-gradient-to-br ${config.color} shadow-lg border-4 border-white`} />

                        {/* Event card */}
                        <motion.div
                          whileHover={{ scale: 1.02, x: 4 }}
                          onClick={() => setSelectedEvent(event)}
                          className={`${config.bg} ${config.border} border-2 rounded-2xl p-6 cursor-pointer shadow-md hover:shadow-xl transition-all`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className={`text-xs font-semibold ${status.color} ${status.bg} px-3 py-1 rounded-full`}>
                                  {status.label}
                                </span>
                                <span className="text-sm text-gray-600 font-medium">
                                  {formatDate(event.date)}
                                </span>
                              </div>
                              <h3 className="text-xl font-bold text-gray-800 mb-1">
                                {event.title}
                              </h3>
                              {event.description && (
                                <p className="text-gray-600 mb-2">{event.description}</p>
                              )}
                              {event.location && (
                                <p className="text-sm text-gray-500">📍 {event.location}</p>
                              )}
                            </div>
                            <span className={`text-xs font-bold ${config.color} bg-gradient-to-r bg-clip-text text-transparent px-3 py-1 rounded-full border ${config.border}`}>
                              {config.label}
                            </span>
                          </div>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 grid grid-cols-3 gap-4"
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-green-600">
              {mockEvents.filter(e => e.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Hoàn thành</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-blue-600">
              {mockEvents.filter(e => e.status === 'upcoming').length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Sắp tới</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-red-600">
              {mockEvents.filter(e => e.status === 'missed').length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Bỏ lỡ</div>
          </div>
        </motion.div>

        {/* Event detail modal */}
        <AnimatePresence>
          {selectedEvent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl"
              >
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">{selectedEvent.title}</h2>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-500">Ngày</span>
                    <p className="text-lg font-semibold">
                      {getMonthName(selectedEvent.date)} - {formatDate(selectedEvent.date)}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-500">Loại</span>
                    <p className="text-lg font-semibold">{typeConfig[selectedEvent.type].label}</p>
                  </div>
                  
                  {selectedEvent.description && (
                    <div>
                      <span className="text-sm text-gray-500">Chi tiết</span>
                      <p className="text-gray-700">{selectedEvent.description}</p>
                    </div>
                  )}
                  
                  {selectedEvent.location && (
                    <div>
                      <span className="text-sm text-gray-500">Địa điểm</span>
                      <p className="text-gray-700">{selectedEvent.location}</p>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-sm text-gray-500">Trạng thái</span>
                    <div className="mt-1">
                      <span className={`${statusConfig[selectedEvent.status].bg} ${statusConfig[selectedEvent.status].color} px-3 py-1 rounded-full text-sm font-semibold`}>
                        {statusConfig[selectedEvent.status].label}
                      </span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="mt-6 w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Đóng
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}