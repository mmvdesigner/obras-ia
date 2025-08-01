'use client';

// This page is no longer used directly.
// The content is now rendered within the project details page.
import TeamPageContent from './_components/team-page-content';

export default function TeamPage() {
  return (
    <div>
        <h1 className="text-2xl font-bold mb-4">Gerenciamento de Equipe</h1>
        <p className="text-muted-foreground">
            Selecione uma obra na página de <a href="/dashboard/projects" className="underline">Obras</a> para ver a equipe associada.
        </p>
    </div>
  );
}
