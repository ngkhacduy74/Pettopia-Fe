'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-white/95 backdrop-blur-sm shadow-sm'
        : 'bg-gradient-to-b from-black/40 to-transparent cursor-pointer'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img src="/sampleimg/logo.png" alt="Logo" className="h-12 mr-3" />
              <span className="text-xl font-semibold text-white">Pettopia</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`transition ${scrolled
                ? 'text-gray-700 hover:text-teal-600'
                : 'text-white hover:text-white/80'
                }`}
            >
              Home
            </Link>
            <Link
              href="/services"
              className={`transition ${scrolled
                ? 'text-gray-700 hover:text-teal-600'
                : 'text-white hover:text-white/80'
                }`}
            >
              Services
            </Link>
            <Link
              href="/about"
              className={`transition ${scrolled
                ? 'text-gray-700 hover:text-teal-600'
                : 'text-white hover:text-white/80'
                }`}
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className={`transition ${scrolled
                ? 'text-gray-700 hover:text-teal-600'
                : 'text-white hover:text-white/80'
                }`}
            >
              Contact
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <Link href="/sign-in">
                <button
                  className={`px-6 py-2 rounded-full transition font-medium ${scrolled
                    ? 'bg-teal-600 text-white hover:bg-teal-700'
                    : 'bg-white text-teal-600 hover:bg-white/90 cursor-pointer'
                    }`}
                >
                  Sign-in
                </button>
              </Link>
              <Link href="/sign-up">
                <button
                  className={`px-6 py-2 rounded-full transition font-medium ${scrolled
                    ? 'bg-teal-600 text-white hover:bg-teal-700'
                    : 'bg-white text-teal-600 hover:bg-white/90 cursor-pointer'
                    }`}
                >
                  Sign-up
                </button>
              </Link>
            </SignedOut>
          </div>
        </div>
      </div>
    </nav>
  );
}