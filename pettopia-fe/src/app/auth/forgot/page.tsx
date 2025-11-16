'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { forgotPassword, resetPassword } from '@/services/auth/authService';

type Step = 'email' | 'verify' | 'success';
type ErrorType = 'otp' | 'password' | 'general';

export default function ForgotPasswordForm() {
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [errorType, setErrorType] = useState<ErrorType>('general');
    const [isLoading, setIsLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300);
    const [canResend, setCanResend] = useState(false);
    const router = useRouter();

    // Đếm ngược thời gian OTP
    useEffect(() => {
        if (step === 'verify' && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setCanResend(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [step, timeLeft]);

    // Format thời gian
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Validate mật khẩu
    const validatePassword = (password: string) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])(?!.*\s).{8,}$/;
        return regex.test(password);
    };

    // Bước 1: Gửi OTP qua email
    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setErrorType('general');
        setIsLoading(true);

        try {
            await forgotPassword(email);
            setStep('verify');
            setTimeLeft(300);
            setCanResend(false);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Không thể gửi mã OTP. Vui lòng thử lại.');
            setErrorType('general');
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý nhập OTP
    const handleOtpChange = (index: number, value: string) => {
        // nếu là paste nhiều ký tự, bỏ qua ở đây (onPaste sẽ xử lý)
        if (value.length > 1) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus next input
        if (value && index < 7) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    // Xử lý phím cho OTP (Backspace, Arrow keys, lọc ký tự không hợp lệ)
    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Backspace: nếu ô hiện tại rỗng thì chuyển về ô trước và xóa ký tự trước đó
        if (e.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement | null;
                const newOtp = [...otp];
                newOtp[index - 1] = '';
                setOtp(newOtp);
                prevInput?.focus();
                e.preventDefault();
            }
            return;
        }

        // Điều hướng bằng mũi tên
        if (e.key === 'ArrowLeft' && index > 0) {
            (document.getElementById(`otp-${index - 1}`) as HTMLInputElement | null)?.focus();
            e.preventDefault();
            return;
        }
        if (e.key === 'ArrowRight' && index < otp.length - 1) {
            (document.getElementById(`otp-${index + 1}`) as HTMLInputElement | null)?.focus();
            e.preventDefault();
            return;
        }

        // Ngăn nhập ký tự không phải chữ/số
        if (e.key.length === 1 && !/[A-Za-z0-9]/.test(e.key)) {
            e.preventDefault();
        }
    };

    // Xử lý dán (paste) OTP: cho phép paste nhiều ký tự (ví dụ paste chuỗi 8 ký tự)
    const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').trim();
        if (!pasted) return;

        // Lọc ký tự hợp lệ (số/chữ). Thay đổi regex nếu chỉ cho phép số.
        const chars = pasted.split('').filter((c) => /[A-Za-z0-9]/.test(c));
        if (chars.length === 0) return;

        const newOtp = [...otp];
        for (let i = 0; i < chars.length && index + i < 8; i++) {
            newOtp[index + i] = chars[i];
        }
        setOtp(newOtp);

        // Focus vào ô tiếp theo sau ký tự cuối cùng được điền (nếu có)
        const lastFilled = Math.min(index + chars.length - 1, 7);
        const focusIndex = lastFilled + 1;
        if (focusIndex <= 7) {
            const nextInput = document.getElementById(`otp-${focusIndex}`);
            (nextInput as HTMLInputElement | null)?.focus();
        } else {
            // nếu đã điền hết, focus vào ô cuối cùng
            const lastInput = document.getElementById(`otp-7`);
            (lastInput as HTMLInputElement | null)?.focus();
        }
    };

    // Bước 2: Xác thực OTP và đặt lại mật khẩu
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setErrorType('general');

        const otpString = otp.join('');

        // Validate OTP
        if (otpString.length !== 8) {
            setError('Vui lòng nhập đủ 8 ký tự OTP');
            setErrorType('otp');
            return;
        }

        if (timeLeft === 0) {
            setError('Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.');
            setErrorType('otp');
            return;
        }

        // Validate password
        if (!newPassword) {
            setError('Mật khẩu không được để trống');
            setErrorType('password');
            return;
        }

        if (newPassword.length < 8) {
            setError('Mật khẩu phải có ít nhất 8 ký tự');
            setErrorType('password');
            return;
        }

        if (!validatePassword(newPassword)) {
            setError('Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt');
            setErrorType('password');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            setErrorType('password');
            return;
        }

        setIsLoading(true);

        try {
            await resetPassword({
                email,
                otp: otpString,
                newPassword
            });

            setStep('success');
            setTimeout(() => {
                router.push('/auth/login');
            }, 2000);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.';
            setError(errorMessage);

            // Phân loại lỗi dựa trên message
            if (errorMessage.toLowerCase().includes('otp') || errorMessage.toLowerCase().includes('mã')) {
                setErrorType('otp');
            } else if (errorMessage.toLowerCase().includes('password') || errorMessage.toLowerCase().includes('mật khẩu')) {
                setErrorType('password');
            } else {
                setErrorType('general');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Gửi lại OTP
    const handleResendOTP = async () => {
        setError('');
        setErrorType('general');
        setIsLoading(true);

        try {
            await forgotPassword(email);
            setOtp(['', '', '', '', '', '', '', '']);
            setTimeLeft(300);
            setCanResend(false);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại.');
            setErrorType('otp');
        } finally {
            setIsLoading(false);
        }
    };

    // Màn hình thành công
    if (step === 'success') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-white">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
                    <div className="mb-4">
                        <svg className="w-20 h-20 mx-auto text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-1xl font-bold text-gray-800 mb-2">Đặt lại mật khẩu thành công!</h2>
                    <p className="text-gray-500 mb-4">Mật khẩu của bạn đã được thay đổi</p>
                    <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
                        <span className="inline-block w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></span>
                        Đang chuyển về trang đăng nhập...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
            <div className="w-full max-w-6xl m-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mx-4">
                    <div className="grid md:grid-cols-2 gap-0">
                        {/* Cột trái - Thông tin hướng dẫn */}
                        <div className={`${errorType === 'otp' ? 'bg-gradient-to-br from-teal-600 to-cyan-700' : 'bg-gradient-to-br from-teal-500 to-cyan-600'} p-12 text-white flex flex-col justify-center transition-all duration-300`}>
                            <div className="mb-8">            
                                <h1 className="text-3xl font-bold mb-4">
                                    {step === 'email' && 'Khôi phục tài khoản'}
                                    {step === 'verify' && 'Xác thực và đặt lại mật khẩu'}
                                </h1>
                                <p className="text-teal-50 text-lg leading-relaxed">
                                    {step === 'email' && 'Nhập email đã đăng ký để nhận mã xác thực OTP. Chúng tôi sẽ gửi mã gồm 8 ký tự đến email của bạn.'}
                                    {step === 'verify' && 'Nhập mã OTP gồm 8 ký tự đã được gửi đến email của bạn và tạo mật khẩu mới. Mã có hiệu lực trong 5 phút.'}
                                </p>
                            </div>

                            {/* Password Requirements - Moved from right side */}
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                                <p className="text-sm font-semibold mb-3">Yêu cầu mật khẩu:</p>
                                <ul className="space-y-2 text-sm text-teal-50">
                                    <li className="flex items-center gap-2">
                                        <span>●</span>
                                        Ít nhất 8 ký tự
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span>●</span>
                                        Có chữ thường (a-z)
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span>●</span>
                                        Có chữ hoa (A-Z)
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span>●</span>
                                        Có số (0-9)
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span>●</span>
                                        Có ký tự đặc biệt (@, #, $, ...)
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span>●</span>
                                        Không chứa khoảng trắng
                                    </li>
                                </ul>
                            </div>

                            {/* Progress indicator */}
                            <div className="mt-12 pt-8 border-t border-white/20">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-teal-100">Tiến trình</span>
                                    <span className="text-sm font-semibold">
                                        {step === 'email' ? '1/2' : '2/2'}
                                    </span>
                                </div>
                                <div className="w-full bg-white/20 rounded-full h-2">
                                    <div
                                        className="bg-white rounded-full h-2 transition-all duration-500"
                                        style={{
                                            width: step === 'email' ? '50%' : '100%'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Cột phải - Form nhập liệu */}
                        <div className="p-10">
                            {/* Error message */}
                            {error && (
                                <div className={`${errorType === 'otp' ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-red-50 border-red-200 text-red-600'} border px-4 py-3 rounded-lg text-sm flex items-start gap-2 mb-6`}>
                                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Bước 1: Nhập Email */}
                            {step === 'email' && (
                                <div className="space-y-6">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Địa chỉ Email
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            placeholder="name@example.com"
                                            className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all"
                                            disabled={isLoading}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendOTP(e)}
                                        />
                                        <p className="mt-2 text-xs text-gray-500">
                                            Nhập email bạn đã đăng ký tài khoản
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleSendOTP}
                                        disabled={isLoading}
                                        className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                Đang gửi mã OTP...
                                            </span>
                                        ) : (
                                            'Gửi mã xác thực'
                                        )}
                                    </button>

                                    <div className="text-center pt-4">
                                        <a
                                            href="/auth/login"
                                            className="text-sm text-gray-600 hover:text-teal-500 transition-colors inline-flex items-center gap-2 font-medium"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                            </svg>
                                            Quay lại đăng nhập
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Bước 2: Nhập OTP và Mật khẩu mới */}
                            {step === 'verify' && (
                                <div className="space-y-6">
                                    {/* OTP Section */}
                                    <div className={`${errorType === 'otp' ? 'ring-2 ring-orange-200 bg-orange-50' : ''} p-4 rounded-lg transition-all`}>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Mã xác thực OTP
                                        </label>

                                        {/* Timer */}
                                        <div className="mb-4 p-3 bg-teal-50 rounded-lg flex items-center justify-between">
                                            <span className="text-sm text-gray-700">Mã có hiệu lực trong:</span>
                                            <span className={`text-lg font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-teal-600'}`}>
                                                {formatTime(timeLeft)}
                                            </span>
                                        </div>

                                        <div className="flex gap-2 justify-center mb-3">
                                            {otp.map((digit, index) => (
                                                <input
                                                    key={index}
                                                    id={`otp-${index}`}
                                                    type="text"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                    onPaste={(e) => handleOtpPaste(e, index)}
                                                    className={`w-11 h-12 text-center text-xl font-bold bg-gray-50 border ${errorType === 'otp' ? 'border-orange-300' : 'border-gray-200'} rounded-lg focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all`}
                                                    disabled={isLoading}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 text-center">
                                            Nhập mã gồm 8 ký tự đã được gửi đến <strong>{email}</strong>
                                        </p>

                                        {/* Resend OTP */}
                                        <div className="text-center mt-3">
                                            {canResend || timeLeft === 0 ? (
                                                <button
                                                    onClick={handleResendOTP}
                                                    disabled={isLoading}
                                                    className="text-sm text-teal-600 hover:text-teal-700 transition-colors font-medium disabled:opacity-50"
                                                >
                                                    Gửi lại mã OTP
                                                </button>
                                            ) : (
                                                <p className="text-xs text-gray-500">
                                                Vui lòng chờ chút bạn nhé! Bọn tôi đang gửi mã cho bạn.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Password Section */}
                                    <div className={`${errorType === 'password' ? 'ring-2 ring-red-200 bg-red-50' : ''} p-4 rounded-lg transition-all space-y-4`}>
                                        <div>
                                            <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Mật khẩu mới
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="newPassword"
                                                    type={showNewPassword ? 'text' : 'password'}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    required
                                                    placeholder="Nhập mật khẩu mới"
                                                    className={`block w-full px-4 py-3 pr-11 bg-gray-50 border ${errorType === 'password' ? 'border-red-300' : 'border-gray-200'} rounded-lg text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all`}
                                                    disabled={isLoading}
                                                />
                                                <button
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-500 transition-colors"
                                                    tabIndex={-1}
                                                >
                                                    {showNewPassword ? (
                                                        <EyeSlashIcon className="h-5 w-5" />
                                                    ) : (
                                                        <EyeIcon className="h-5 w-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Xác nhận mật khẩu
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="confirmPassword"
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    required
                                                    placeholder="Nhập lại mật khẩu mới"
                                                    className={`block w-full px-4 py-3 pr-11 bg-gray-50 border ${errorType === 'password' ? 'border-red-300' : 'border-gray-200'} rounded-lg text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all`}
                                                    disabled={isLoading}
                                                />
                                                <button
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-500 transition-colors"
                                                    tabIndex={-1}
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeSlashIcon className="h-5 w-5" />
                                                    ) : (
                                                        <EyeIcon className="h-5 w-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleResetPassword}
                                        disabled={isLoading}
                                        className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                Đang xử lý...
                                            </span>
                                        ) : (
                                            'Đặt lại mật khẩu'
                                        )}
                                    </button>

                                      <div className="text-center ">
                                        <a
                                            href="/auth/login"
                                            className="text-sm text-gray-600 hover:text-teal-500 transition-colors inline-flex items-center gap-2 font-medium"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                            </svg>
                                            Quay lại đăng nhập
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}