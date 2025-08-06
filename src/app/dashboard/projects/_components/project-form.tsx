
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Project, ProjectFile } from '@/lib/types';
import { useData } from '@/hooks/use-data';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Trash2, Upload, Loader2 } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

const projectSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  address: z.string().min(1, 'Endereço é obrigatório'),
  client: z.string().min(1, 'Cliente é obrigatório'),
  startDate: z.string().min(1, 'Data de início é obrigatória'),
  endDate: z.string().min(1, 'Data de término é obrigatória'),
  status: z.enum(['planejamento', 'em andamento', 'pausada', 'concluída']),
  totalBudget: z.coerce.number().min(0, 'Orçamento deve ser positivo'),
  description: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

type FileListItem = ProjectFile | { id: string; file: File };

interface ProjectFormProps {
  project?: Project | null;
  onFinished: () => void;
}

export function ProjectForm({ project, onFinished }: ProjectFormProps) {
  const { addProject, updateProject } = useData();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentFiles, setCurrentFiles] = useState<(ProjectFile | File)[]>([]);

  const defaultValues: Partial<ProjectFormValues> = project
    ? {
        ...project,
        startDate: project.startDate.split('T')[0],
        endDate: project.endDate.split('T')[0],
      }
    : {
        status: 'planejamento',
      };

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues,
  });

  useEffect(() => {
    if (project) {
        form.reset({
            ...project,
            startDate: project.startDate.split('T')[0],
            endDate: project.endDate.split('T')[0],
        });
        setCurrentFiles(project.files || []);
    } else {
        form.reset({ status: 'planejamento' });
        setCurrentFiles([]);
    }
  }, [project, form]);


  const onSubmit = async (data: ProjectFormValues) => {
    setIsSubmitting(true);
    try {
      if (project) {
        // Since file uploads are removed, we just pass the existing files
        await updateProject(project.id, data, project.files || [], project.files || []);
        toast({ title: 'Obra atualizada!', description: 'Os dados da obra foram salvos.' });
      } else {
        await addProject(data, []);
        toast({ title: 'Obra criada!', description: 'A nova obra foi adicionada com sucesso.' });
      }
      onFinished();
    } catch (error) {
      console.error("Failed to save project:", error);
      const errorMessage = error instanceof Error ? error.message : `Não foi possível salvar a obra.`;
      toast({ variant: 'destructive', title: 'Erro!', description: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-4 pr-6 pl-1 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Obra</FormLabel>
                    <FormControl>
                      <Input placeholder="Residencial Sol Nascente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input placeholder="Rua das Acácias, 123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="client"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <FormControl>
                      <Input placeholder="Construtora Confiança" {...field} />
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
                      <FormLabel>Previsão de Término</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                  control={form.control}
                  name="totalBudget"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Orçamento Total</FormLabel>
                      <FormControl>
                          <Input type="number" placeholder="500000" {...field} />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
                  />
                  <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                          <SelectTrigger>
                              <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                          <SelectItem value="planejamento">Planejamento</SelectItem>
                          <SelectItem value="em andamento">Em Andamento</SelectItem>
                          <SelectItem value="pausada">Pausada</SelectItem>
                          <SelectItem value="concluída">Concluída</SelectItem>
                          </SelectContent>
                      </Select>
                      <FormMessage />
                      </FormItem>
                  )}
                  />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Detalhes sobre a obra..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormItem>
                <FormLabel>Documentos da Obra</FormLabel>
                <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-md text-center">
                  A funcionalidade de upload de arquivos está temporariamente desativada.
                </div>
              </FormItem>
            </div>
          </ScrollArea>
        </div>
        <div className="flex justify-end pt-4 gap-2 border-t">
            <Button type="button" variant="ghost" onClick={onFinished} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Salvando...' : (project ? 'Salvar Alterações' : 'Criar Obra')}
            </Button>
        </div>
      </form>
    </Form>
  );
}
