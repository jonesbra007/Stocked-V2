import type { Metadata } from 'next';
import { DM_Serif_Display, Inter, Crimson_Text } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-dm-serif',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const crimsonText = Crimson_Text({
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-crimson',
});

export const metadata: Metadata = {
  title: 'Stocked | Meal Planner',
  description: 'Your all-in-one meal planning assistant.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSerif.variable} ${crimsonText.variable}`}>
      <body suppressHydrationWarning className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}