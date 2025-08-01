'use client';

import { useState, useMemo } from 'react';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/hooks/use-data';
import type { Task, TaskStatus } from '@/lib/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TaskForm } from './_components/task-form';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const statusVariant: Record<TaskStatus, 'default' | 'secondary' | 'outline'> = {
  'em andamento': 'default',
  'nao iniciada': 'secondary',
  'concluída': 'outline',
};

interface SchedulePageContentProps {
  projectId: string;
}

export default function SchedulePageContent({ projectId }: SchedulePageContentProps) {
  const { data, deleteTask } = useData();
  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const projectTasks = useMemo(() => data.tasks.filter(t => t.projectId === projectId), [data.tasks, projectId]);

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
        <Card>
          <CardHeader>
             <div className="flex items-center justify-between">
              <div>
                <CardTitle>Cronograma de Atividades</CardTitle>
                <CardDescription>Todas as tarefas planejadas para esta obra.</CardDescription>
              </div>
              <DialogTrigger asChild>
                <Button onClick={handleAddNew}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Nova Atividade
                </Button>
              </DialogTrigger>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Atividade</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.name}</TableCell>
                    <TableCell>{task.responsible}</TableCell>
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

      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{editingTask ? 'Editar Atividade' : 'Nova Atividade'}</DialogTitle>
          <DialogDescription>
            {editingTask ? 'Atualize os detalhes da atividade.' : 'Preencha as informações da nova atividade.'}
          </DialogDescription>
        </DialogHeader>
        <TaskForm task={editingTask} onFinished={() => setOpen(false)} projectId={projectId} />
      </DialogContent>
    </Dialog>
  );
}
