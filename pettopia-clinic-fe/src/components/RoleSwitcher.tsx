import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface RoleSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  userRoles: string[];
  currentRole: string;
}

const roleIcons: Record<string, React.ReactNode> = {
  Admin: (
    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2a10 10 0 0 0-10 10v1a10 10 0 0 0 20 0v-1a10 10 0 0 0-10-10z" />
      <path d="M8 12h8M12 8v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Staff: (
    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
      <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Clinic: (
    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
      <path d="M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
    </svg>
  ),
  Vet: (
    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z" />
      <path d="M12 6v12M6 12h12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  User: (
    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

const roleColors: Record<string, string> = {
  Admin: 'from-red-500 to-pink-600',
  Staff: 'from-blue-500 to-cyan-600',
  Clinic: 'from-green-500 to-emerald-600',
  Vet: 'from-purple-500 to-pink-600',
  User: 'from-amber-500 to-orange-600',
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-slate-800 to-slate-900 px-8 py-6 border-b border-slate-700 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Chuyển Role</h2>
              <p className="text-sm text-slate-400">Chọn một role để tiếp tục</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 overflow-y-auto max-h-[calc(80vh-120px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userRoles.map((role) => {
                const isCurrentRole = role === currentRole;
                return (
                  <button
                    key={role}
                    onClick={() => {
                      if (!isCurrentRole) {
                        handleRoleSwitch(role);
                      }
                    }}
                    className={`group relative p-6 rounded-xl transition-all duration-300 overflow-hidden
                      ${
                        isCurrentRole
                          ? 'ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/20'
                          : 'hover:shadow-lg hover:shadow-slate-700/50 hover:scale-105'
                      }
                    `}
                  >
                    {/* Background gradient */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${roleColors[role]} opacity-10 group-hover:opacity-20 transition-opacity`}
                    />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center gap-4">
                      {/* Icon */}
                      <div
                        className={`w-16 h-16 rounded-full bg-gradient-to-br ${roleColors[role]} p-3 text-white shadow-lg flex items-center justify-center
                          ${isCurrentRole ? 'ring-2 ring-white' : ''}`}
                      >
                        {roleIcons[role]}
                      </div>

                      {/* Text */}
                      <div className="text-center">
                        <h3 className="text-lg font-bold text-white mb-1">
                          {roleNames[role]}
                        </h3>
                        <p className="text-sm text-slate-300 mb-3">
                          {roleDescriptions[role]}
                        </p>
                      </div>

                      {/* Button/Badge */}
                      {isCurrentRole ? (
                        <div className="mt-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500 text-emerald-400 rounded-lg text-sm font-medium flex items-center gap-2">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Đang sử dụng
                        </div>
                      ) : (
                        <div className="mt-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
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
          <div className="bg-slate-800 border-t border-slate-700 px-8 py-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors font-medium"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </>
  );
}