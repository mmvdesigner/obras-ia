'use client';

import { useState } from 'react';
import { PlusCircle, MoreHorizontal, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useData } from '@/hooks/use-data';
import type { Project, ProjectStatus } from '@/lib/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ProjectForm } from './_components/project-form';
import Link from 'next/link';

const statusVariant: Record<ProjectStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  'em andamento': 'default',
  'planejamento': 'secondary',
  'concluída': 'outline',
  'pausada': 'destructive',
};

export default function ProjectsPage() {
  const { data, deleteProject } = useData();
  const [open, setOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingProject(null);
    setOpen(true);
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Obras</h1>
            <p className="text-muted-foreground">Gerencie todos os seus projetos de construção.</p>
          </div>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" /> Nova Obra
            </Button>
          </DialogTrigger>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Lista de Obras</CardTitle>
            <CardDescription>Visualize e gerencie as obras cadastradas.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome da Obra</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Orçamento</TableHead>
                  <TableHead>
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.projects.map((project) => (
                  <TableRow key={project.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <Link href={`/dashboard/projects/${project.id}`} className="hover:underline">
                        {project.name}
                      </Link>
                    </TableCell>
                    <TableCell>{project.client}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[project.status]}>{project.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(project.totalBudget)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                             <Link href={`/dashboard/projects/${project.id}`}>
                               <ArrowRight className="mr-2 h-4 w-4" /> Ver Detalhes
                             </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(project); }}>Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}>Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <DialogContent className="sm:max-w-3xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{editingProject ? 'Editar Obra' : 'Nova Obra'}</DialogTitle>
          <DialogDescription>
            {editingProject ? 'Atualize os detalhes da obra.' : 'Preencha as informações da nova obra.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
         <ProjectForm project={editingProject} onFinished={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
