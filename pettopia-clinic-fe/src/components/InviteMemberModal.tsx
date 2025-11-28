'use client'
import React, { useState } from 'react';
import {
  XMarkIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

interface InviteMemberModalProps {
  onSubmit: (email: string, role: string) => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
}

export default function InviteMemberModal({
  onSubmit,
  isOpen,
  onClose,
}: InviteMemberModalProps) {
  const [inviteEmails, setInviteEmails] = useState('');
  const [inviteRole, setInviteRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInvite = async () => {
    try {
      setIsLoading(true);
      await onSubmit(inviteEmails, inviteRole);
      setInviteEmails('');
      setInviteRole('');
      onClose();
    } catch (error: any) {
      alert(`Lỗi: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <EnvelopeIcon className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Mời thành viên mới</h3>
          <p className="text-sm text-gray-500 mt-1">Chọn vai trò và gửi lời mời ngay</p>
        </div>

        <div className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={inviteEmails}
              onChange={(e) => setInviteEmails(e.target.value)}
              placeholder="email@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
          </div>

          {/* Chọn Role – 4 role bắt buộc */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Vai trò <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'vet', label: 'Bác sĩ thú y', emoji: 'Stethoscope' },
                { value: 'staff', label: 'Nhân viên', emoji: 'Wrench' },
                { value: 'receptionist', label: 'Lễ tân', emoji: 'Phone' },
                { value: 'manager', label: 'Quản lý', emoji: 'Key' },
              ].map((role) => (
                <label
                  key={role.value}
                  className={`flex items-center justify-center gap-3 py-4 border-2 rounded-xl cursor-pointer transition-all text-center ${
                    inviteRole === role.value
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={inviteRole === role.value}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="sr-only"
                  />
                  <span className="font-medium">{role.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Nút */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleInvite}
              disabled={!inviteEmails.trim() || !inviteRole || isLoading}
              className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang gửi...' : 'Gửi lời mời'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
