'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, X, Eye, EyeOff } from 'lucide-react';
import { acceptInvitation, declineInvitation } from '@/services/partner/clinicService';
import { useToast } from '@/contexts/ToastContext';

interface InviteAcceptedPageProps {
  params: Promise<{
    inviteId: string;
  }>;
}

export default function InviteAcceptedPage({ params }: InviteAcceptedPageProps) {
  const { inviteId } = use(params);
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const [isProcessing, setIsProcessing] = useState(false);
  const [showInviteCode, setShowInviteCode] = useState(false);

  // Hàm che mã lời mời
  const maskInviteCode = (code: string) => {
    if (code.length <= 8) return '••••••••';
    return code.substring(0, 4) + '••••••••' + code.substring(code.length - 4);
  };

  const handleAccept = async () => {
    if (!inviteId) {
      showError('Mã lời mời không hợp lệ');
      return;
    }

    try {
      setIsProcessing(true);
      await acceptInvitation(inviteId);
      showSuccess('Đã chấp nhận lời mời tham gia bệnh viện');
      setTimeout(() => {
        router.push('/vet/main');
      }, 1500);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Không thể chấp nhận lời mời. Vui lòng thử lại sau.';
      showError(message);
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!inviteId) {
      showError('Mã lời mời không hợp lệ');
      return;
    }

    try {
      setIsProcessing(true);
      await declineInvitation(inviteId);
      showSuccess('Bạn đã từ chối lời mời này');
      setTimeout(() => {
        router.push('/vet/main');
      }, 1500);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Không thể từ chối lời mời. Vui lòng thử lại sau.';
      showError(message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-6 md:p-10">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 text-center">
          Lời Mời Tham Gia Bệnh viện
        </h1>

        <p className="text-gray-500 text-center mb-8">
          Bạn được mời tham gia một nhóm mới trong hệ thống Pettopia.
        </p>

        {/* Invite Info với mã ẩn */}
        <div className="mb-8">
          <p className="text-sm text-gray-500 mb-2">Mã lời mời</p>
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center flex-1 min-w-0">
              <Mail className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
              <p className="font-mono text-sm text-gray-900 break-all">
                {showInviteCode ? inviteId : maskInviteCode(inviteId)}
              </p>
            </div>
            <button
              onClick={() => setShowInviteCode(!showInviteCode)}
              className="ml-3 p-1.5 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
              title={showInviteCode ? 'Ẩn mã' : 'Hiện mã'}
            >
              {showInviteCode ? (
                <EyeOff className="w-4 h-4 text-gray-600" />
              ) : (
                <Eye className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleDecline}
            disabled={isProcessing}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            Từ Chối
          </button>
          <button
            onClick={handleAccept}
            disabled={isProcessing}
            className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? 'Đang xử lý...' : 'Chấp Nhận'}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="space-y-2 text-xs mb-4">
            <p className="text-red-600 font-semibold">
              ĐƯỜNG DẪN NÀY CHỈ DÀNH CHO BẠN, TUYỆT ĐỐI KHÔNG CHIA SẺ CHO NGƯỜI KHÁC ĐƯỜNG DẪN NÀY
            </p>
            <p className="text-gray-500">
              Việc chấp nhận sẽ liên kết tài khoản của bạn với bệnh viện.
            </p>
            <p className="text-gray-500">
              Nếu mã không hoạt động hãy liên hệ với bệnh viện hoặc admin để được hỗ trợ.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}