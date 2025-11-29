'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import { getAppointments, type AppointmentData } 

import { getCustomerById } from '../services/user/userService';
interface NotificationBellProps {
    notificationCount?: number;
}

interface Notification {
    id: string;
    type: 'appointment';
    title: string;
    patient: string;
    appointmentId: string;
    appointmentDate: string;
    time: string;
    date: string;
    status: string;
    isRead: boolean;
    createdAt: string;
    createdAtDate: Date;
}

export default function NotificationBell({ notificationCount }: NotificationBellProps) {
    const router = useRouter();
    const [showDropdown, setShowDropdown] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Load notifications từ API
    const loadNotifications = async () => {
        setLoading(true);
        try {
            // Lấy appointments có status Pending_Confirmation hoặc mới tạo (giới hạn 20 mới nhất)
            const response = await getAppointments(1, 20);
            if (response.status === 'success' && response.data) {
                // Lọc và format thành notifications
                const notificationPromises = response.data
                    .filter((apt: AppointmentData) => apt.status === 'Pending_Confirmation')
                    .slice(0, 10) // Lấy 10 mới nhất
                    .map(async (apt: AppointmentData) => {
                        // Lấy customer name
                        let customerName = 'Khách hàng';
                        const customerId = apt.customer || apt.user_id;
                        if (customerId) {
                            try {
                                const customerData = await getCustomerById(customerId);
                                customerName = customerData?.data?.fullname || customerData?.fullname || customerName;
                            } catch (err) {
                                console.warn(`Không thể lấy thông tin khách hàng ${customerId}:`, err);
                            }
                        }

                        // Format date và time
                        const aptDate = new Date(apt.date);
                        const dateStr = aptDate.toLocaleDateString('vi-VN');
                        const timeStr = `${aptDate.getHours().toString().padStart(2, '0')}:${aptDate.getMinutes().toString().padStart(2, '0')}`;
                        
                        // Tính thời gian tạo
                        const createdAtDate = new Date(apt.createdAt || apt.date);
                        const now = new Date();
                        const diffMs = now.getTime() - createdAtDate.getTime();
                        const diffMins = Math.floor(diffMs / 60000);
                        const diffHours = Math.floor(diffMs / 3600000);
                        const diffDays = Math.floor(diffMs / 86400000);
                        
                        let createdAt = '';
                        if (diffMins < 1) {
                            createdAt = 'Vừa xong';
                        } else if (diffMins < 60) {
                            createdAt = `${diffMins} phút trước`;
                        } else if (diffHours < 24) {
                            createdAt = `${diffHours} giờ trước`;
                        } else {
                            createdAt = `${diffDays} ngày trước`;
                        }

                        return {
                            id: apt.id || apt._id,
                            type: 'appointment' as const,
                            title: 'Lịch hẹn mới cần xác nhận',
                            patient: customerName,
                            appointmentId: apt.id || apt._id,
                            appointmentDate: apt.date,
                            time: timeStr,
                            date: dateStr,
                            status: apt.status,
                            isRead: apt.status !== 'Pending_Confirmation', // Unread nếu là "Chờ xác nhận", read nếu các trạng thái khác
                            createdAt,
                            createdAtDate
                        };
                    });

                const loadedNotifications = await Promise.all(notificationPromises);
                // Sắp xếp theo thời gian tạo (mới nhất trước)
                loadedNotifications.sort((a, b) => b.createdAtDate.getTime() - a.createdAtDate.getTime());
                setNotifications(loadedNotifications);
            }
        } catch (error) {
            console.error('Lỗi khi tải thông báo:', error);
        } finally {
            setLoading(false);
        }
    };

    // Load notifications khi component mount
    useEffect(() => {
        loadNotifications();
        // Refresh mỗi 30 giây
        const interval = setInterval(loadNotifications, 30000);
        
        // Refresh khi window focus (khi quay lại tab)
        const handleFocus = () => {
            loadNotifications();
        };
        window.addEventListener('focus', handleFocus);
        
        // Refresh khi có storage event (khi có update từ tab khác)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'appointment_updated') {
                loadNotifications();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        
        // Refresh khi có custom event (khi có update trong cùng tab)
        const handleAppointmentUpdated = () => {
            loadNotifications();
        };
        window.addEventListener('appointmentUpdated', handleAppointmentUpdated);
        
        // Listen cho storage changes trong cùng tab (storage event chỉ hoạt động cross-tab)
        const handleStorage = () => {
            const updated = localStorage.getItem('appointment_updated');
            if (updated) {
                loadNotifications();
                localStorage.removeItem('appointment_updated');
            }
        };
        // Check storage mỗi giây để catch updates trong cùng tab
        const storageCheckInterval = setInterval(handleStorage, 1000);
        
        return () => {
            clearInterval(interval);
            clearInterval(storageCheckInterval);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('appointmentUpdated', handleAppointmentUpdated);
        };
    }, []);

    // Chỉ dùng số lượng từ notifications thực tế, không dùng prop notificationCount
    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Đóng dropdown khi click bên ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, isRead: true } : n
        ));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    };

    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification.id);
        // Navigate đến trang appointment và set appointment ID để hiển thị chi tiết
        router.push(`/clinic/appointment?appointmentId=${notification.appointmentId}`);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Confirmed': return 'bg-green-100 text-green-800';
            case 'Pending_Confirmation': return 'bg-yellow-100 text-yellow-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'Confirmed': return 'Đã xác nhận';
            case 'Pending_Confirmation': return 'Chờ xác nhận';
            case 'Cancelled': return 'Đã hủy';
            default: return status;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Notification Bell Button */}
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 rounded-lg hover:bg-teal-100 text-gray-600 transition-colors relative"
                aria-label="Thông báo"
            >
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1 font-medium">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {showDropdown && (
                <div className="absolute right-10 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Thông báo ({unreadCount} mới)
                            </h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Đánh dấu tất cả
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-[500px] overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                                <p className="text-sm text-gray-500 mt-2">Đang tải...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                                <p className="text-sm">Không có thông báo nào</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-blue-50' : ''
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        {/* Icon */}
                                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${!notification.isRead ? 'bg-blue-500' : 'bg-gray-400'
                                            }`}>
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h4 className={`text-sm font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'
                                                    }`}>
                                                    {notification.title}
                                                </h4>
                                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                                    {notification.createdAt}
                                                </span>
                                            </div>

                                            <div className="space-y-1 mb-2">
                                                <p className="text-xs text-gray-600">
                                                    <span className="font-medium">Khách hàng:</span> {notification.patient}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    <span className="font-medium">Thời gian:</span> {notification.time} - {notification.date}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
                                                    {getStatusText(notification.status)}
                                                </span>
                                                {!notification.isRead && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        Mới
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                            <button 
                                onClick={() => router.push('/clinic/appointment')}
                                className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium text-center cusor-pointer"
                            >
                                Xem tất cả lịch hẹn
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}