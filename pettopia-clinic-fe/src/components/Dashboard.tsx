// components/common/Dashboard.tsx
'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import NotificationBell from './NotificationBell';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  CurrencyDollarIcon,
  CalendarIcon,
  UserGroupIcon,
  HomeIcon,
  BeakerIcon,
  CheckCircleIcon,
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
  selectedPeriod?: string;
  onPeriodChange?: (period: 'week' | 'month' | 'year') => void;
  inviteButton?: React.ReactNode;
}

export default function Dashboard({
  title = "Dashboard",
  subtitle = "Tổng quan hoạt động",
  statsCards,
  revenueData,
  serviceData = [],
  quickActions,
  recentActivities,
  selectedPeriod = 'month',
  onPeriodChange,
  inviteButton,
}: DashboardProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const handlePeriodClick = (period: 'week' | 'month' | 'year') => {
    onPeriodChange?.(period);
  };

  return (
    <div className="max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{title}</h1>
          <p className="text-gray-500 text-sm">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          {inviteButton}

          <NotificationBell notificationCount={1} />
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

          {serviceData.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Phân bổ dịch vụ</h2>
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
            {quickActions.map((action) => {
              // Kiểm tra nếu có link hoặc onClick
              const hasLink = !!action.link && !action.onClick;
              const hasOnClick = !!action.onClick && !action.link;

              const content = (
                <div
                  className={`bg-gradient-to-br ${action.color} rounded-xl p-5 hover:shadow-lg transition-all duration-300 text-white h-full ${
                    hasLink || hasOnClick ? 'cursor-pointer' : ''
                  }`}
                >
                  <div className="mb-3">{action.icon}</div>
                  <h3 className="font-bold text-base mb-1">{action.title}</h3>
                  <p className="text-xs opacity-90">{action.description}</p>
                </div>
              );

              // Render với Link nếu có href
              if (hasLink) {
                return (
                  <Link key={action.id} href={action.link!}>
                    {content}
                  </Link>
                );
              }

              // Render với onClick nếu có
              if (hasOnClick) {
                return (
                  <div key={action.id} onClick={action.onClick}>
                    {content}
                  </div>
                );
              }

              // Render default
              return (
                <div key={action.id}>
                  {content}
                </div>
              );
            })}
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
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
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
              ))
            ) : (
              <div className="p-6 text-center">
                <p className="text-sm text-gray-500">Chưa có hoạt động nào</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}