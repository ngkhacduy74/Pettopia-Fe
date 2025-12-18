'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import ToastItem, { Toast, ToastType } from '@/components/common/Toast';

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number, onShow?: () => void) => void;
    showSuccess: (message: string, duration?: number, onShow?: () => void) => void;
    showError: (message: string, duration?: number, onShow?: () => void) => void;
    showWarning: (message: string, duration?: number, onShow?: () => void) => void;
    showInfo: (message: string, duration?: number, onShow?: () => void) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

interface ToastProviderProps {
    children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback((message: string, type: ToastType = 'info', duration?: number, onShow?: () => void) => {
        const id = Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
        const newToast: Toast = {
            id,
            message,
            type,
            duration,
        };
        setToasts((prev) => [...prev, newToast]);
        // Gọi callback sau khi toast được thêm vào (sau một tick để đảm bảo toast đã render)
        if (onShow) {
            setTimeout(() => {
                onShow();
            }, 100);
        }
    }, []);

    const showSuccess = useCallback((message: string, duration?: number, onShow?: () => void) => {
        showToast(message, 'success', duration, onShow);
    }, [showToast]);

    const showError = useCallback((message: string, duration?: number, onShow?: () => void) => {
        showToast(message, 'error', duration, onShow);
    }, [showToast]);

    const showWarning = useCallback((message: string, duration?: number, onShow?: () => void) => {
        showToast(message, 'warning', duration, onShow);
    }, [showToast]);

    const showInfo = useCallback((message: string, duration?: number, onShow?: () => void) => {
        showToast(message, 'info', duration, onShow);
    }, [showToast]);

    return (
        <ToastContext.Provider
            value={{
                showToast,
                showSuccess,
                showError,
                showWarning,
                showInfo,
            }}
        >
            {children}
            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
                {toasts.map((toast) => (
                    <div key={toast.id} className="pointer-events-auto">
                        <ToastItem toast={toast} onClose={removeToast} />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
