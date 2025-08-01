'use client';

import { useState } from 'react';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DataProvider, useData } from '@/hooks/use-data';
import type { Task, TaskStatus } from '@/lib/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TaskForm } from './_components/task-form';
import { format } from 'date-fns';

const statusVariant: Record<TaskStatus, 'default' | 'secondary' | 'outline'> = {
  'em andamento': 'default',
  'nao iniciada': 'secondary',
  'concluída': 'outline',
};

function SchedulePageContent() {
  const { data, deleteTask } = useData();
  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingTask(null);
    setOpen(true);
  }

  const formatDate = (dateString: string) => format(new Date(dateString), 'dd/MM/yyyy');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cronograma</h1>
            <p className="text-muted-foreground">Planeje e acompanhe as atividades das obras.</p>
          </div>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" /> Nova Atividade
            </Button>
          </DialogTrigger>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Lista de Atividades</CardTitle>
            <CardDescription>Todas as tarefas planejadas para as obras.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Atividade</TableHead>
                  <TableHead>Obra</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.name}</TableCell>
                    <TableCell>{data.projects.find(p => p.id === task.projectId)?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[task.status]}>{task.status}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(task.startDate)} - {formatDate(task.endDate)}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleEdit(task)}>Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteTask(task.id)}>Excluir</DropdownMenuItem>
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

      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{editingTask ? 'Editar Atividade' : 'Nova Atividade'}</DialogTitle>
          <DialogDescription>
            {editingTask ? 'Atualize os detalhes da atividade.' : 'Preencha as informações da nova atividade.'}
          </DialogDescription>
        </DialogHeader>
        <TaskForm task={editingTask} onFinished={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

export default function SchedulePage() {
  return (
    <DataProvider>
      <SchedulePageContent />
    </DataProvider>
  );
}
