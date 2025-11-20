import LoginForm from '@/components/auth/LoginForm';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-white via-teal-50 to-cyan-50">
      {/* Left half: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-0">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>

      {/* Right half: Image - Hidden on mobile, visible on lg */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600/20 to-cyan-600/20 z-10"></div>
        
        {/* Background image */}
        <Image
          src="/assets/img/Dog-Vet.jpg"
          alt="Login background"
          fill
          style={{ objectFit: 'cover' }}
          priority
          className="object-cover"
        />

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-white p-8">
          <div className="text-center">
            <div className="mb-6 inline-block p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <svg className="w-16 h-16 text-teal-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m0 0h6m0 0H6m0 0H0m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">Chăm sóc thú cưng</h2>
            <p className="text-lg text-teal-100 drop-shadow-md mb-8 max-w-sm">
              Quản lý hiệu quả các dịch vụ thú y của bạn với nền tảng đáng tin cậy
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-2 h-2 rounded-full bg-white"></div>
              <div className="w-2 h-2 rounded-full bg-teal-200"></div>
              <div className="w-2 h-2 rounded-full bg-cyan-200"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}