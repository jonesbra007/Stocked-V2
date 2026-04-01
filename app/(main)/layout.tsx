'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import TopNav from '@/components/layout/TopNav';
import MobileNav from '@/components/layout/MobileNav';
import CookModeModal from '@/components/recipe/CookModeModal';
import { TutorialProvider } from '@/contexts/TutorialContext';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <TutorialProvider>
        <div className="min-h-screen bg-bg-color text-text-main pb-[90px] md:pb-0 transition-colors duration-300">
          <TopNav />
          <main className="max-w-7xl mx-auto my-8 px-6">
            {children}
          </main>
          <MobileNav />
          <CookModeModal />
        </div>
      </TutorialProvider>
    </ProtectedRoute>
  );
}
