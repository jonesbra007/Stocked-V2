'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, CalendarDays, Users, Wrench } from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Recipes', path: '/dashboard', icon: LayoutGrid },
    { name: 'Plan', path: '/planner', icon: CalendarDays },
    { name: 'Friends', path: '/friends', icon: Users },
    { name: 'Tools', path: '/tools', icon: Wrench },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full h-[70px] bg-nav-bg border-t border-border-color z-[900] flex justify-around items-center backdrop-blur-md shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
      {navLinks.map((link) => {
        const isActive = pathname === link.path;
        const Icon = link.icon;
        return (
          <Link 
            key={link.path}
            href={link.path}
            id={`tour-${link.name.toLowerCase()}-mobile`}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1.5 text-[0.65rem] font-semibold transition-colors ${
              isActive ? 'text-primary' : 'text-text-light hover:text-text-main'
            }`}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span>{link.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
