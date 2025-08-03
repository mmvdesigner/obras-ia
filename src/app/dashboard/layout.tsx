'use client';

import { LiderLogo } from '@/components/logo';
import { useData } from '@/hooks/use-data';
import { MainNav } from '@/components/dashboard/main-nav';
import { UserNav } from '@/components/dashboard/user-nav';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { loading: dataLoading } = useData();
  const router = useRouter();

  const isLoading = authLoading || dataLoading;

  useEffect(() => {
    // If both hooks are done loading and there's still no user, redirect to login.
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (isLoading) {
    return <div className="flex h-screen w-screen items-center justify-center">Carregando...</div>;
  }
  
  if (!user) {
    // This can be a brief flash while redirecting, or a fallback.
    return null;
  }
  
  return (
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader className="p-4">
            <Link href="/dashboard" className="flex items-center gap-2">
                <LiderLogo className="w-8 h-8 text-primary" />
                <span className="text-xl font-semibold text-primary">LIDER</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <MainNav user={user} />
          </SidebarContent>
          <SidebarFooter>
            <UserNav />
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1">
              {/* Can add breadcrumbs here */}
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
  );
}
