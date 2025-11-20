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
        
        {/* Background image */}
        <Image
          src="/assets/img/Dog-Vet.jpg"
          alt="Login background"
          fill
          style={{ objectFit: 'cover' }}
          priority
          className="object-cover"
        />

      </div>
    </div>
  );
}