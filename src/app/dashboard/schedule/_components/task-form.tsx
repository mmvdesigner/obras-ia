'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/hooks/use-data';
import type { Task } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const taskSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  projectId: z.string().min(1, 'Obra é obrigatória'),
  responsible: z.string().min(1, 'Responsável é obrigatório'),
  startDate: z.string().min(1, 'Data de início é obrigatória'),
  endDate: z.string().min(1, 'Data de término é obrigatória'),
  status: z.enum(['nao iniciada', 'em andamento', 'concluída']),
  priority: z.enum(['baixa', 'media', 'alta']),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskFormProps {
  task?: Task | null;
  onFinished: () => void;
  projectId: string;
}

export function TaskForm({ task, onFinished, projectId }: TaskFormProps) {
  const { data, addTask, updateTask } = useData();
  const { toast } = useToast();

  const defaultValues: Partial<TaskFormValues> = task
    ? { 
        ...task,
        startDate: task.startDate.split('T')[0],
        endDate: task.endDate.split('T')[0],
      }
    : { 
        status: 'nao iniciada',
        priority: 'media',
        projectId,
      };

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues,
  });

  const onSubmit = (formData: TaskFormValues) => {
    if (task) {
      updateTask({ ...task, ...formData });
      toast({ title: 'Atividade atualizada!', description: 'A atividade foi salva com sucesso.' });
    } else {
      addTask(formData);
      toast({ title: 'Atividade criada!', description: 'A nova atividade foi adicionada.' });
    }
    onFinished();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
         <FormField
            control={form.control}
            name="projectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Obra</FormLabel>
                <Input disabled value={data.projects.find(p => p.id === projectId)?.name} />
                <FormMessage />
              </FormItem>
            )}
          />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Atividade</FormLabel>
              <FormControl>
                <Input placeholder="Instalação elétrica" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
       
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Início</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Término</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="responsible"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsável</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um funcionário" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {data.employees.filter(e => e.status === 'ativo' && e.linkedProjectIds.includes(projectId)).map(e => <SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="nao iniciada">Não Iniciada</SelectItem>
                    <SelectItem value="em andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluída">Concluída</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prioridade</FormLabel>
                <Select onValuechange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit">{task ? 'Salvar Alterações' : 'Criar Atividade'}</Button>
      </form>
    </Form>
  );
}
