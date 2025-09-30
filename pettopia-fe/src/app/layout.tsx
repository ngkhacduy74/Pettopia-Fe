import { AuthProvider } from "@/contexts/AuthContext";

export const metadata = {
  title: "Next.js Demo",
  description: "Simple login + home project",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
