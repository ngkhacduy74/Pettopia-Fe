'use client';
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';



export default function Notification({ 
  type, 
  message, 
  isVisible, 
  onClose, 
  duration = 5000 
}) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const config = {
    success: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconBg: 'bg-green-100',
      icon: (
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconBg: 'bg-red-100',
      icon: (
        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconBg: 'bg-yellow-100',
      icon: (
        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconBg: 'bg-blue-100',
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  };

  const currentConfig = config[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 right-4 z-50 max-w-md"
        >
          <div className={`${currentConfig.bgColor} ${currentConfig.borderColor} border rounded-xl shadow-lg p-4 flex items-start gap-3`}>
            <div className={`${currentConfig.iconBg} rounded-full p-1.5 flex-shrink-0`}>
              {currentConfig.icon}
            </div>
            <div className="flex-1">
              <p className={`${currentConfig.textColor} text-sm font-medium`}>
                {message}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`${currentConfig.textColor} hover:opacity-70 transition-opacity flex-shrink-0`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
 
// Demo component
function NotificationDemo() {
  const [notification, setNotification] = React.useState({
    isVisible: false,
    type: 'success',
    message: ''
  });

  const showNotification = (type, message) => {
    setNotification({ isVisible: true, type, message });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Notification Component Demo</h1>
        
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold mb-4">Test Notifications</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => showNotification('success', 'Đăng nhập thành công!')}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              Success
            </button>
            <button
              onClick={() => showNotification('error', 'Thông tin đăng nhập không hợp lệ')}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              Error
            </button>
            <button
              onClick={() => showNotification('warning', 'Vui lòng kiểm tra lại thông tin')}
              className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
            >
              Warning
            </button>
            <button
              onClick={() => showNotification('info', 'Phiên đăng nhập sắp hết hạn')}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Info
            </button>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Usage Example</h2>
          <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-sm">
{`import Notification from '@/components/Notification';

const [notification, setNotification] = useState({
  isVisible: false,
  type: 'success',
  message: ''
});

// Show notification
setNotification({
  isVisible: true,
  type: 'success',
  message: 'Đăng nhập thành công!'
});

// In JSX
<Notification
  type={notification.type}
  message={notification.message}
  isVisible={notification.isVisible}
  onClose={() => setNotification({ ...notification, isVisible: false })}
  duration={5000}
/>`}
          </pre>
        </div>
      </div>

      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification({ ...notification, isVisible: false })}
      />
    </div>
  );
}

export { NotificationDemo };