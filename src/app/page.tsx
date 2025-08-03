'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // We only want to redirect when the loading state is false.
    if (!loading) {
      if (user) {
        // If there's a user, they should be on the dashboard.
        router.push('/dashboard');
      } else {
        // If there's no user, they should be on the login page.
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  // While loading, show a skeleton screen. This prevents flashes of content.
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
