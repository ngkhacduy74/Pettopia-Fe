'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-sm shadow-sm'
            : 'bg-gradient-to-b from-black/40 to-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <svg
                  className={`w-8 h-8 mr-3 transition-colors ${
                    scrolled ? 'text-teal-600' : 'text-white'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                  />
                </svg>
                <span
                  className={`text-xl font-semibold transition-colors ${
                    scrolled ? 'text-gray-900' : 'text-white'
                  }`}
                >
                  Pettopia
                </span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/"
                className={`transition ${
                  scrolled
                    ? 'text-gray-700 hover:text-teal-600'
                    : 'text-white hover:text-white/80'
                }`}
              >
                Home
              </Link>
              <Link
                href="/services"
                className={`transition ${
                  scrolled
                    ? 'text-gray-700 hover:text-teal-600'
                    : 'text-white hover:text-white/80'
                }`}
              >
                Services
              </Link>
              <Link
                href="/about"
                className={`transition ${
                  scrolled
                    ? 'text-gray-700 hover:text-teal-600'
                    : 'text-white hover:text-white/80'
                }`}
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className={`transition ${
                  scrolled
                    ? 'text-gray-700 hover:text-teal-600'
                    : 'text-white hover:text-white/80'
                }`}
              >
                Contact
              </Link>
            </div>

            <button
              className={`px-6 py-2 rounded-full transition font-medium ${
                scrolled
                  ? 'bg-teal-600 text-white hover:bg-teal-700'
                  : 'bg-white text-teal-600 hover:bg-white/90'
              }`}
            >
              Find a vet
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src="/sampleimg/herosector.jpg"
            alt="Happy dog on a comfortable bed"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-teal-900/70 to-cyan-800/60"></div>
        </div>

        <div className="relative z-10 max-w-7xl px-4 sm:px-6 lg:px-8 text-white py-32">
          <div className="max-w-2xl text-left">
            <p className="text-lg mb-6 text-cyan-100">
              Your Pet's Home Away From Home
            </p>
            <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
              Exceptional Care, Peace of Mind
            </h1>
            <p className="text-xl mb-12 text-cyan-50 max-w-xl">
              Your pets deserve the best care. Our team of experienced
              veterinarians and staff are dedicated to keeping your pets healthy
              and happy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-white text-teal-700 px-8 py-3.5 rounded-full font-medium hover:bg-cyan-50 transition inline-flex items-center">
                Our Services
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
              <button className="border-2 border-white text-white px-8 py-3.5 rounded-full font-medium hover:bg-white hover:text-teal-700 transition inline-flex items-center">
                Book an Appointment
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-8 z-10">
          <div className="flex flex-col items-start">
            <span className="text-white text-xs mb-2">LL</span>
            <div className="w-px h-20 bg-white/40"></div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gradient-to-b from-cyan-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600">
              We offer comprehensive veterinary services to keep your pets
              healthy from nose to tail.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition border border-cyan-100">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-7 h-7 text-teal-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                Wellness Exams
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Regular check-ups to ensure your pet is healthy and to catch any
                issues early.
              </p>
              <Link
                href="/services/wellness"
                className="text-teal-600 text-sm font-medium hover:text-teal-700 inline-flex items-center"
              >
                Learn more →
              </Link>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition border border-cyan-100">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-7 h-7 text-teal-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                Vaccinations
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Keep your pets protected against common and serious diseases with
                our vaccination programs.
              </p>
              <Link
                href="/services/vaccinations"
                className="text-teal-600 text-sm font-medium hover:text-teal-700 inline-flex items-center"
              >
                Learn more →
              </Link>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition border border-cyan-100">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-7 h-7 text-teal-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                Surgery
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                From routine spay/neuter to complex procedures, our surgical team
                provides expert care.
              </p>
              <Link
                href="/services/surgery"
                className="text-teal-600 text-sm font-medium hover:text-teal-700 inline-flex items-center"
              >
                Learn more →
              </Link>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition border border-cyan-100">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-7 h-7 text-teal-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                Dental Care
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Comprehensive dental services to maintain your pet's oral health
                and prevent disease.
              </p>
              <Link
                href="/services/dental"
                className="text-teal-600 text-sm font-medium hover:text-teal-700 inline-flex items-center"
              >
                Learn more →
              </Link>
            </div>
          </div>

          <div className="text-center mt-12">
            <button className="bg-teal-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-teal-700 transition shadow-lg">
              View All Services
            </button>
          </div>
        </div>
      </section>

      {/* Why Choose Pettopia Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="/sampleimg/sampleimg.jpg"
                  alt="French Bulldog in yellow sweater"
                  className="w-full h-auto"
                />
              </div>
            </div>

            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-8">
                Why Choose Pettopia?
              </h2>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-teal-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Experienced Veterinarians
                    </h3>
                    <p className="text-gray-600">
                      Our team of veterinarians has decades of combined
                      experience in all aspects of pet health.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-teal-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      State-of-the-Art Facility
                    </h3>
                    <p className="text-gray-600">
                      Our hospital is equipped with the latest technology for
                      diagnosis and treatment.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-teal-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Compassionate Care
                    </h3>
                    <p className="text-gray-600">
                      We treat each pet as if they were our own, with gentle
                      handling and personalized attention.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-teal-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Emergency Services
                    </h3>
                    <p className="text-gray-600">
                      We offer emergency care during business hours and have
                      partnerships with 24/7 emergency clinics.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button className="bg-teal-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-teal-700 transition shadow-lg">
                  Learn More About Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-white to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Pet Parents Say
            </h2>
            <p className="text-xl text-gray-600">
              Don't just take our word for it. Here's what our clients have to
              say about their experience with Pettopia
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-md border border-cyan-100">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-amber-400 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-6">
                "The team at Pettopia is amazing! They took such good care of our
                dog Max during his surgery. The follow-up care was exceptional,
                and they were always available to answer our questions."
              </p>
              <div>
                <p className="font-semibold text-gray-900">Sarah Johnson</p>
                <p className="text-gray-500 text-sm">Dog Owner</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-md border border-cyan-100">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-amber-400 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-6">
                "I've been bringing my cats to Pettopia for years. Dr. Martinez
                is so gentle with them, and they're always much less stressed than
                at other vets we've tried. The entire staff genuinely cares about
                animals."
              </p>
              <div>
                <p className="font-semibold text-gray-900">Michael Thompson</p>
                <p className="text-gray-500 text-sm">Cat Owner</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-md border border-cyan-100">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-amber-400 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-6">
                "When our rabbit needed emergency care on a weekend, Pettopia
                connected us with their emergency partner clinic and followed up
                first thing Monday morning. The coordination of care was
                impressive!"
              </p>
              <div>
                <p className="font-semibold text-gray-900">Emily Wilson</p>
                <p className="text-gray-500 text-sm">Rabbit Owner</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-teal-600 to-cyan-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Schedule Your Pet's Visit?
          </h2>
          <p className="text-xl text-cyan-50 mb-8">
            Whether it's time for a check-up or your pet needs special care, our
            team is here to help.
          </p>
          <button className="bg-white text-teal-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-cyan-50 transition shadow-xl">
            Book an Appointment Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-cyan-400">
                Pettopia
              </h3>
              <p className="text-gray-400 mb-6">
                Providing exceptional veterinary care for your beloved pets since
                2005. Our mission is to ensure every pet lives a healthy and
                happy life.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-cyan-400 transition"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-cyan-400 transition"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-cyan-400 transition"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg text-cyan-400">
                Quick Links
              </h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <Link href="/" className="hover:text-cyan-400 transition">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-cyan-400 transition">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services"
                    className="hover:text-cyan-400 transition"
                  >
                    Our Services
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-cyan-400 transition"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg text-cyan-400">
                Services
              </h4>
              <ul className="space-y-3 text-gray-400">
                <li>Wellness Exams</li>
                <li>Vaccinations</li>
                <li>Surgery</li>
                <li>Dental Care</li>
                <li>Emergency Care</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg text-cyan-400">
                Contact Info
              </h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-cyan-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>123 Pet Care Lane, Animalia, CA 90210</span>
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 flex-shrink-0 text-cyan-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span>(555) 123-4567</span>
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 flex-shrink-0 text-cyan-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>info@Pettopia.com</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-cyan-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <div>Mon-Fri: 8am-8pm</div>
                    <div>Sat-Sun: 9am-5pm</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Pettopia Pet Hospital. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}