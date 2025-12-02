'use client'
import React from 'react';
import Link from 'next/link';

export default function JoinUsPage() {
    return (
        <div className="relative min-h-screen bg-gradient-to-br from-teal-900/90 to-cyan-900/90 overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src="/assets/img/Join-us.jpg"
                    alt="Bác sĩ thú y đang chăm sóc thú cưng"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-teal-900/80 via-cyan-900/70 to-teal-900/80"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-16 text-center">
                {/* Logo */}
                <Link href="/" className="mb-12 flex items-center gap-3 group">
                    <img src="/sampleimg/logo.png" alt="Pettopia" className="h-10 w-10 object-contain" />
                    <span className="text-2xl font-bold text-white tracking-tight">Pettopia</span>
                </Link>

                {/* Main Title */}
                <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
                    Gia nhập đội ngũ 
                    <br />
                    <span className="text-cyan-300">Pettopia</span>
                </h1>

                {/* Subtitle */}
                <p className="text-lg md:text-xl text-cyan-100 mb-12 max-w-2xl mx-auto leading-relaxed">
                    Tham gia cộng đồng bác sĩ thú y hàng đầu, chăm sóc hàng nghìn thú cưng
                    và xây dựng sự nghiệp bền vững cùng Pettopia.
                </p>

                {/* CTA Button - Minimal & Elegant */}
                <Link
                    href="/auth/register"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold text-lg px-8 py-3.5 rounded-full
                               transition-all duration-300 hover:from-teal-600 hover:to-cyan-600
                               focus:outline-none focus:ring-4 focus:ring-cyan-400 focus:ring-opacity-50"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Đăng ký làm bác sĩ ngay
                </Link>

                {/* Footer */}
                <footer className="absolute bottom-6 left-0 right-0">
                    <p className="text-sm text-cyan-200">
                        © 2025 <span className="font-medium">Pettopia</span>. All rights reserved.
                    </p>
                </footer>
            </div>
        </div>
    );
}