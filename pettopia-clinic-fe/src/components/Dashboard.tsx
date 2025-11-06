// components/common/Dashboard.tsx
'use client'
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  CurrencyDollarIcon,
  CalendarIcon,
  UserGroupIcon,
  HomeIcon,
  BeakerIcon,
  CheckCircleIcon,
  XMarkIcon,
  EnvelopeIcon,
  BuildingStorefrontIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface StatCard {
  id: number;
  title: string;
  value: string | number;
  change: string;
  icon: React.ReactNode;
  color: string;
  trend: 'up' | 'down' | 'neutral';
}

interface ChartData {
  name: string;
  revenue?: number;
  appointments?: number;
  [key: string]: any;
}

interface ServiceData {
  name: string;
  value: number;
  color: string;
  [key: string]: any;
}

interface QuickAction {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  link?: string;
  onClick?: () => void;
}

interface Activity {
  id: number;
  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
}

interface DashboardProps {
  title?: string;
  subtitle?: string;
  statsCards: StatCard[];
  revenueData: ChartData[];
  serviceData?: ServiceData[];
  quickActions: QuickAction[];
  recentActivities: Activity[];
  showInviteButton?: boolean;
  onInvite?: () => void;
  selectedPeriod?: string;
  onPeriodChange?: (period: 'week' | 'month' | 'year') => void;
}

export default function Dashboard({
  title = "Dashboard",
  subtitle = "Tổng quan hoạt động",
  statsCards,
  revenueData,
  serviceData = [],
  quickActions,
  recentActivities,
  showInviteButton = false,
  onInvite,
  selectedPeriod = 'month',
  onPeriodChange,
}: DashboardProps) {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmails, setInviteEmails] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const handleInvite = () => {
    console.log('Sending invites to:', inviteEmails);
    console.log('Message:', inviteMessage);
    setShowInviteForm(false);
    setInviteEmails('');
    setInviteMessage('');
    onInvite?.();
  };

  const handlePeriodClick = (period: 'week' | 'month' | 'year') => {
    onPeriodChange?.(period);
  };

  return (
    <div className="p-6 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{title}</h1>
          <p className="text-gray-500 text-sm">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          {showInviteButton && (
            <button
              onClick={() => setShowInviteForm(true)}
              className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
              </svg>
              Mời thành viên
            </button>
          )}
          <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors relative">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <section className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat) => (
            <div
              key={stat.id}
              className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 cursor-pointer"
              onMouseEnter={() => setHoveredCard(stat.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center shadow-md`}>
                  {stat.icon}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  stat.trend === 'up' ? 'bg-green-100 text-green-600' : 
                  stat.trend === 'down' ? 'bg-red-100 text-red-600' : 
                  'bg-gray-100 text-gray-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-gray-500 text-xs mb-1 font-medium">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Charts */}
      <section className="mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Doanh thu</h2>
                <p className="text-xs text-gray-500">6 tháng gần đây (triệu đồng)</p>
              </div>
              <div className="flex gap-2">
                {['week', 'month', 'year'].map((period) => (
                  <button
                    key={period}
                    onClick={() => handlePeriodClick(period as 'week' | 'month' | 'year')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                      selectedPeriod === period ? 'bg-teal-100 text-teal-600' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {period === 'week' ? 'Tuần' : period === 'month' ? 'Tháng' : 'Năm'}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #ccfbf1',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px'
                  }}
                  formatter={(value) => `${value} triệu`}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  dot={{ fill: '#14b8a6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Service Pie Chart */}
          {serviceData.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Phân bố dịch vụ</h2>
              <p className="text-xs text-gray-500 mb-4">Tháng này</p>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={serviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {serviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {serviceData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Quick Actions & Recent Activities */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h2 className="text-lg font-bold text-gray-900">Thao tác nhanh</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickActions.map((action) => (
              <div
                key={action.id}
                onClick={action.onClick}
                className={`bg-gradient-to-br ${action.color} rounded-xl p-5 cursor-pointer hover:shadow-lg transition-all duration-300 text-white`}
              >
                <div className="mb-3">{action.icon}</div>
                <h3 className="font-bold text-base mb-1">{action.title}</h3>
                <p className="text-xs opacity-90">{action.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-lg font-bold text-gray-900">Hoạt động gần đây</h2>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 p-3 border-b border-gray-50 last:border-b-0 hover:bg-teal-50 transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-xs mb-0.5">{activity.title}</h3>
                  <p className="text-xs text-gray-500 truncate">{activity.description}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Invite Modal */}
      {showInviteForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative">
            <button
              onClick={() => setShowInviteForm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <EnvelopeIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Mời thành viên</h3>
                <p className="text-xs text-gray-500">Gửi lời mời tham gia đội ngũ</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email (cách nhau bởi dấu phẩy)
                </label>
                <input
                  type="text"
                  value={inviteEmails}
                  onChange={(e) => setInviteEmails(e.target.value)}
                  placeholder="user1@email.com, user2@email.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Lời nhắn (tùy chọn)
                </label>
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Chào mừng bạn tham gia..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleInvite}
                  className="flex-1 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
                >
                  Gửi lời mời
                </button>
                <button
                  onClick={() => setShowInviteForm(false)}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 text-sm"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}