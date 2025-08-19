// frontend/src/components/LayoutWrapper.tsx
'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();

  // Pages that should use their own navigation (like homepage)
  const pagesWithCustomNav = ['/'];
  
  // Pages that should have no navigation at all
  const pagesWithoutNav = ['/login', '/register'];

  const shouldShowNavbar = !pagesWithCustomNav.includes(pathname) && !pagesWithoutNav.includes(pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      {children}
    </>
  );
}