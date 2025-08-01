'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Project } from '@/lib/types';
import { useData } from '@/hooks/use-data';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { FileText, Trash2, Upload } from 'lucide-react';

const projectSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  address: z.string().min(1, 'Endereço é obrigatório'),
  client: z.string().min(1, 'Cliente é obrigatório'),
  startDate: z.string().min(1, 'Data de início é obrigatória'),
  endDate: z.string().min(1, 'Data de término é obrigatória'),
  status: z.enum(['planejamento', 'em andamento', 'pausada', 'concluída']),
  totalBudget: z.coerce.number().min(0, 'Orçamento deve ser positivo'),
  description: z.string().optional(),
  files: z.array(z.string()),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  project?: Project | null;
  onFinished: () => void;
}

export function ProjectForm({ project, onFinished }: ProjectFormProps) {
  const { addProject, updateProject } = useData();
  const { toast } = useToast();
  const [fileName, setFileName] = useState('');

  const defaultValues: Partial<ProjectFormValues> = project
    ? {
        ...project,
        startDate: project.startDate.split('T')[0],
        endDate: project.endDate.split('T')[0],
        files: project.files || [],
      }
    : {
        status: 'planejamento',
        files: [],
      };

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues,
  });

  const onSubmit = (data: ProjectFormValues) => {
    if (project) {
      updateProject({ ...project, ...data });
      toast({ title: 'Obra atualizada!', description: 'Os dados da obra foram salvos.' });
    } else {
      addProject(data);
      toast({ title: 'Obra criada!', description: 'A nova obra foi adicionada com sucesso.' });
    }
    onFinished();
  };
  
  const handleAddFile = () => {
    if (fileName.trim()) {
        const currentFiles = form.getValues('files');
        form.setValue('files', [...currentFiles, fileName.trim()]);
        setFileName('');
    }
  };

  const handleRemoveFile = (fileToRemove: string) => {
    const currentFiles = form.getValues('files');
    form.setValue('files', currentFiles.filter(f => f !== fileToRemove));
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        
        <FormField
          control={form.control}
          name="files"
          render={() => (
            <FormItem>
              <FormLabel>Documentos da Obra</FormLabel>
              <div className="flex gap-2">
                <Input 
                    type="text" 
                    placeholder="Nome do arquivo (ex: planta.pdf)" 
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                />
                <Button type="button" onClick={handleAddFile} variant="outline">
                    <Upload className="mr-2 h-4 w-4" /> Adicionar
                </Button>
              </div>
               <div className="space-y-2 mt-2">
                 {form.getValues('files').map((file, index) => (
                    <div key={index} className="flex items-center justify-between rounded-md border p-2">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{file}</span>
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveFile(file)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                 ))}
               </div>
              <FormMessage />
            </FormItem>
          )}
        />


        <Button type="submit">{project ? 'Salvar Alterações' : 'Criar Obra'}</Button>
      </form>
    </Form>
  );
}