'use client';

import { DataProvider } from '@/hooks/use-data';
// The rest of your page content will be in a separate component
// to ensure it's a client component and can use hooks.
import TeamPageContent from './_components/team-page-content';

export default function TeamPage() {
  return (
    <DataProvider>
      <TeamPageContent />
    </DataProvider>
  );
}
