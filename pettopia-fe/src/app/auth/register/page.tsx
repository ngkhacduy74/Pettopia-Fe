import RegisterForm from '@/components/auth/RegisterForm';
import Image from 'next/image';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left half: Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="/assets/img/cat-write.jpg" // Reuse login image or replace with /register-bg.jpg
          alt="Register background"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>
      {/* Right half: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center">
        <RegisterForm />
      </div>
    </div>
  );
}