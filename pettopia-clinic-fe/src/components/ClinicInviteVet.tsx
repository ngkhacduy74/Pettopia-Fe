'use client'
import React, { useState } from 'react';
import { XMarkIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function ClinicInviteVet() {
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [inviteEmails, setInviteEmails] = useState('');
    const [inviteMessage, setInviteMessage] = useState('');

    const handleInvite = () => {
        // Logic gửi lời mời
        console.log('Sending invites to:', inviteEmails);
        console.log('Message:', inviteMessage);
        setShowInviteForm(false);
        setInviteEmails('');
        setInviteMessage('');
    };

    return (
        <>
            <button
                onClick={() => setShowInviteForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 hover:scale-105"
            >
                <EnvelopeIcon className="w-5 h-5" />
                Mời Bác sĩ
            </button>

            {/* Invite Form Modal */}
            {showInviteForm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative">
                        <button
                            onClick={() => setShowInviteForm(false)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl flex items-center justify-center">
                                <EnvelopeIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Mời Bác sĩ Thú y</h3>
                                <p className="text-sm text-gray-500">Gửi lời mời tham gia đội ngũ phòng khám</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email (có thể nhập nhiều email, cách nhau bởi dấu phẩy)
                                </label>
                                <input
                                    type="text"
                                    value={inviteEmails}
                                    onChange={(e) => setInviteEmails(e.target.value)}
                                    placeholder="bsvet1@email.com, bsvet2@email.com"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Lời nhắn (tùy chọn)
                                </label>
                                <textarea
                                    value={inviteMessage}
                                    onChange={(e) => setInviteMessage(e.target.value)}
                                    placeholder="Chào mừng bạn tham gia đội ngũ phòng khám của chúng tôi..."
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleInvite}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                                >
                                    Gửi lời mời
                                </button>
                                <button
                                    onClick={() => setShowInviteForm(false)}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Hủy
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}