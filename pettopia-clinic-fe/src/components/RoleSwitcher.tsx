import React from 'react';
import {
  CogIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  SparklesIcon,
  UserIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import {
  CheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/solid';

interface RoleSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  userRoles: string[];
  currentRole: string;
}

const roleIcons: Record<string, React.ReactNode> = {
  Admin: <CogIcon className="w-12 h-12" />,
  Staff: <UserGroupIcon className="w-12 h-12" />,
  Clinic: <BuildingOfficeIcon className="w-12 h-12" />,
  Vet: <SparklesIcon className="w-12 h-12" />,
  User: <UserIcon className="w-12 h-12" />,
};

const roleColors: Record<string, { gradient: string; icon: string; light: string }> = {
  Admin: {
    gradient: 'from-teal-500 to-teal-600',
    icon: 'text-teal-600',
    light: 'bg-teal-50'
  },
  Staff: {
    gradient: 'from-cyan-500 to-teal-600',
    icon: 'text-cyan-600',
    light: 'bg-cyan-50'
  },
  Clinic: {
    gradient: 'from-teal-500 to-emerald-600',
    icon: 'text-teal-500',
    light: 'bg-emerald-50'
  },
  Vet: {
    gradient: 'from-emerald-500 to-teal-600',
    icon: 'text-emerald-600',
    light: 'bg-teal-50'
  },
  User: {
    gradient: 'from-teal-400 to-cyan-500',
    icon: 'text-teal-600',
    light: 'bg-teal-50'
  },
};

const roleNames: Record<string, string> = {
  Admin: 'Admin Dashboard',
  Staff: 'Staff Panel',
  Clinic: 'Clinic Dashboard',
  Vet: 'Veterinarian',
  User: 'User',
};

const roleDescriptions: Record<string, string> = {
  Admin: 'Quản lý hệ thống',
  Staff: 'Nhân viên hỗ trợ',
  Clinic: 'Phòng khám thú cưng',
  Vet: 'Bác sĩ thú y',
  User: 'Người dùng',
};

export default function RoleSwitcher({
  isOpen,
  onClose,
  userRoles,
  currentRole,
}: RoleSwitcherProps) {
  const handleRoleSwitch = (role: string) => {
    const roleLinks: Record<string, string> = {
      Admin: '/admin/dashboard',
      Staff: '/staff/dashboard',
      Clinic: '/clinic/dashboard',
      Vet: '/vet/dashboard',
      User: '/user/dashboard',
    };
    window.location.href = roleLinks[role] || '#';
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-teal-50 to-cyan-50 px-8 py-6 border-b border-teal-100 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Chuyển Role</h2>
              <p className="text-sm text-gray-500">Chọn một role để tiếp tục</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 overflow-y-auto max-h-[calc(80vh-120px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userRoles.map((role) => {
                const isCurrentRole = role === currentRole;
                const colors = roleColors[role];
                
                return (
                  <button
                    key={role}
                    onClick={() => {
                      if (!isCurrentRole) {
                        handleRoleSwitch(role);
                      }
                    }}
                    className={`group relative p-6 rounded-xl transition-all duration-300 overflow-hidden border-2
                      ${
                        isCurrentRole
                          ? 'border-teal-500 bg-teal-50 shadow-lg shadow-teal-100'
                          : 'border-gray-200 hover:border-teal-300 hover:shadow-lg hover:shadow-teal-50 hover:scale-105 bg-white'
                      }
                    `}
                  >
                    {/* Background gradient overlay */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}
                    />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center gap-4">
                      {/* Icon */}
                      <div
                        className={`w-16 h-16 rounded-full bg-gradient-to-br ${colors.gradient} p-3 text-white shadow-md flex items-center justify-center
                          ${isCurrentRole ? 'ring-2 ring-teal-300 ring-offset-2' : 'group-hover:shadow-lg'}`}
                      >
                        {roleIcons[role]}
                      </div>

                      {/* Text */}
                      <div className="text-center">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {roleNames[role]}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {roleDescriptions[role]}
                        </p>
                      </div>

                      {/* Button/Badge */}
                      {isCurrentRole ? (
                        <div className="mt-2 px-4 py-2 bg-teal-100 border border-teal-400 text-teal-700 rounded-lg text-sm font-medium flex items-center gap-2">
                          <CheckIcon className="w-4 h-4" />
                          Đang sử dụng
                        </div>
                      ) : (
                        <div className="mt-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
                          <ArrowPathIcon className="w-4 h-4" />
                          Chuyển qua
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-100 px-8 py-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </>
  );
}