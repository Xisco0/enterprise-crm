import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
});

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Apex CRM — Enterprise Relationship Platform',
  description: 'Production-grade enterprise CRM with role-based access control and Supabase PostgreSQL RLS.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full ${inter.variable} ${poppins.variable}`}>
      <body className="h-full font-sans antialiased bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}

