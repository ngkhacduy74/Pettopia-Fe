import React from 'react'
import Link from 'next/link';

export default function page() {
    return (
        <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 h-screen text-white overflow-hidden">
            <div className="absolute inset-0">
                <img src="/assets/img/Join-us.jpg" alt="Background Image" className="object-cover object-center w-full h-full" />
                <div className="absolute inset-0 bg-black opacity-50"></div>
            </div>

            <div className="relative z-10 flex flex-col justify-center items-center h-full text-center">
                <Link href="/" className="flex items-center">
              <img src="/sampleimg/logo.png" alt="Logo" className="h-12 mr-3" />
              <span className="text-xl font-semibold text-white">Pettopia</span>
            </Link>
                <h1 className="text-5xl font-bold leading-tight mb-4">Welcome to Our Awesome Website</h1>
                <p className="text-lg text-gray-300 mb-8">Discover amazing features and services that await you.</p>
                <a href="http://localhost:4000/auth/login" className="bg-teal-400 text-white hover:bg-teal-300 py-2 px-6 rounded-full text-lg font-semibold transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg">Become a veterianrian</a>

                <p className="absolute bottom-4 w-full text-center text-sm text-gray-400">
                    © 2025 Pettopia. All rights reserved.
                </p>

            </div>
        </div>
    )
}
