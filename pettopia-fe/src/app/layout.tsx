import type { Metadata } from 'next';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: 'PawsHealth - Pet Hospital',
  description: 'Exceptional care for your furry family members',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider afterSignOutUrl="/home" afterSignInUrl="/home">
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}