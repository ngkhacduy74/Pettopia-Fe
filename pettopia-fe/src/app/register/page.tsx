import RegisterForm from '@/components/RegisterForm';
import Image from 'next/image';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left half: Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="/login-bg.jpg" // Reuse login image or replace with /register-bg.jpg
          alt="Register background"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>
      {/* Right half: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-900">
        <RegisterForm />
      </div>
    </div>
  );
}