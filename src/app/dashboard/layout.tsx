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
import { Skeleton } from '@/components/ui/skeleton';

function DashboardSkeleton() {
    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
        </div>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { data, loading: dataLoading } = useData();
  const router = useRouter();

  const isLoading = authLoading || dataLoading;

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }

    // ACL Logic: Redirect non-admins from the main dashboard
    if (!isLoading && user && user.role !== 'Administrator' && window.location.pathname === '/dashboard') {
        const firstProject = data.projects[0];
        if (firstProject) {
            router.push(`/dashboard/projects/${firstProject.id}`);
        }
    }
  }, [user, isLoading, data.projects, router]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }
  
  if (!user) {
    return null;
  }
  
  return (
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader className="p-4">
            <Link href="/dashboard" className="flex items-center gap-2">
                <LiderLogo className="w-8 h-8 text-primary" />
                <span className="text-xl font-semibold text-primary">LIDER Empreendimentos</span>
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
          <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
              <SidebarTrigger className="md:hidden" />
              <div className="flex-1">
                {/* Can add breadcrumbs here */}
              </div>
            </header>
            <main className="flex-1 p-4 sm:p-6">{children}</main>
            <footer className="p-4 text-center text-xs text-muted-foreground">
                © {new Date().getFullYear()} Messias Vasconcelos. Todos os direitos reservados.
            </footer>
          </div>
        </SidebarInset>
      </SidebarProvider>
  );
}
