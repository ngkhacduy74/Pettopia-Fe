import LoginForm from '@/components/LoginForm';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left half: Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="/login-bg.jpg" // Place your image in public/
          alt="Login background"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>
      {/* Right half: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-900">
        <LoginForm />
      </div>
    </div>
  );
}