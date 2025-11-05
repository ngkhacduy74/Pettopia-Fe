// File: components/ui/CustomAlert.tsx
'use client'
import React from 'react';

interface CustomAlertProps {
  show: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  onClose: () => void;
  confirmText?: string;
}

export default function CustomAlert({
  show,
  type,
  title,
  message,
  onClose,
  confirmText = 'Đóng'
}: CustomAlertProps) {
  if (!show) return null;

  const styles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      buttonBg: 'bg-green-600 hover:bg-green-700',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      buttonBg: 'bg-red-600 hover:bg-red-700',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  };

  const style = styles[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-scaleIn">
        {/* Icon Header */}
        <div className={`${style.bg} ${style.border} border-b p-6 rounded-t-2xl`}>
          <div className="flex items-center justify-center">
            <div className={`${style.iconBg} ${style.iconColor} rounded-full p-3`}>
              {style.icon}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
            {title}
          </h3>
          <p className="text-gray-600 text-center leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className={`w-full ${style.buttonBg} text-white py-3 px-4 rounded-lg font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-md`}
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.9);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

// ============================================
// File: hooks/useAlert.ts
// ============================================
import { useState, useCallback } from 'react';

interface AlertState {
  show: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

export function useAlert() {
  const [alertState, setAlertState] = useState<AlertState>({
    show: false,
    type: 'info',
    title: '',
    message: ''
  });

  const showAlert = useCallback((
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string
  ) => {
    setAlertState({ show: true, type, title, message });
  }, []);

  const showSuccess = useCallback((title: string, message: string) => {
    showAlert('success', title, message);
  }, [showAlert]);

  const showError = useCallback((title: string, message: string) => {
    showAlert('error', title, message);
  }, [showAlert]);

  const showWarning = useCallback((title: string, message: string) => {
    showAlert('warning', title, message);
  }, [showAlert]);

  const showInfo = useCallback((title: string, message: string) => {
    showAlert('info', title, message);
  }, [showAlert]);

  const closeAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, show: false }));
  }, []);

  return {
    alertState,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    closeAlert
  };
}

// ============================================
// CÁCH SỬ DỤNG
// ============================================

// Example 1: Trong CreatePostPage
/*
'use client'
import React, { useState } from 'react';
import CustomAlert from '@/components/ui/CustomAlert';
import { useAlert } from '@/hooks/useAlert';

export default function CreatePostPage() {
  const { alertState, showSuccess, showError, closeAlert } = useAlert();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      // ... logic tạo bài viết
      
      showSuccess('Thành công!', 'Bài viết của bạn đã được đăng thành công');
      
      // Tự động redirect sau 1.5s
      setTimeout(() => {
        closeAlert();
        router.push('/user/community/mainPage');
      }, 1500);
      
    } catch (e: any) {
      showError('Lỗi!', e?.message || 'Không thể tạo bài viết. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <CustomAlert
        show={alertState.show}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        onClose={closeAlert}
      />
      
    
    </>
  );
}
*/

// Example 2: Trong trang khác
/*
'use client'
import React from 'react';
import CustomAlert from '@/components/ui/CustomAlert';
import { useAlert } from '@/hooks/useAlert';

export default function AnyOtherPage() {
  const { alertState, showSuccess, showError, showWarning, showInfo, closeAlert } = useAlert();

  const handleDelete = async () => {
    try {
      // ... logic xóa
      showSuccess('Đã xóa!', 'Mục đã được xóa thành công');
    } catch (e) {
      showError('Lỗi!', 'Không thể xóa mục này');
    }
  };

  const handleWarning = () => {
    showWarning('Cảnh báo!', 'Hành động này không thể hoàn tác');
  };

  const handleInfo = () => {
    showInfo('Thông tin', 'Đây là thông báo thông tin');
  };

  return (
    <>
      <CustomAlert
        show={alertState.show}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        onClose={closeAlert}
      />
      
      <button onClick={handleDelete}>Xóa</button>
      <button onClick={handleWarning}>Cảnh báo</button>
      <button onClick={handleInfo}>Thông tin</button>
    </>
  );
}
*/