import LoginForm from '@/components/auth/LoginForm';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left half: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center">
        <LoginForm />
      </div>
      {/* Right half: Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="/assets/img/Dog-Vet.jpg" // Place your image in public/
          alt="Login background"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>
    </div>
  );
}