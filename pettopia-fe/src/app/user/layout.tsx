import UserShell from './UserShell'

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gradient-to-b from-teal-50 to-white text-gray-900">
      <UserShell>{children}</UserShell>
    </div>
  );
}


