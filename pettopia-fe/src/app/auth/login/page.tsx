import LoginForm from '@/components/auth/LoginForm';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left half: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
      {/* Right half: Image with frame */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center">
        <div className="relative w-4/5 h-4/5 rounded-lg overflow-hidden shadow-2xl">
          <Image
            src="/assets/img/Dog-Vet.jpg"
            alt="Login background"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>
      </div>
    </div>
  );
}