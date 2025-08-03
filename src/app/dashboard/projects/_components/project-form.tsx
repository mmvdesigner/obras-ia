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
import { useRef, useState, useEffect, useCallback } from 'react';

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

interface ProjectFormProps {
  project?: Project | null;
  onFinished: () => void;
}

export function ProjectForm({ project, onFinished }: ProjectFormProps) {
  const { addProject, updateProject } = useData();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This state holds the "final" list of files. It can contain existing ProjectFile objects or new File objects.
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

  // Effect to reset form and files when the project prop changes (e.g., opening a new project in the dialog)
  useEffect(() => {
    form.reset(defaultValues);
    if (project?.files) {
      setCurrentFiles(project.files);
    } else {
      setCurrentFiles([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, form.reset]);


  const onSubmit = async (data: ProjectFormValues) => {
    setIsSubmitting(true);
    try {
      if (project) {
        // We now pass the final, desired state of files to the update function.
        await updateProject(project.id, data, currentFiles);
        toast({ title: 'Obra atualizada!', description: 'Os dados da obra foram salvos.' });
      } else {
        // For new projects, we only have new files to upload.
        const newFiles = currentFiles.filter((f): f is File => f instanceof File);
        await addProject(data, newFiles);
        toast({ title: 'Obra criada!', description: 'A nova obra foi adicionada com sucesso.' });
      }
      onFinished();
    } catch (error) {
      console.error("Failed to save project:", error);
      toast({ variant: 'destructive', title: 'Erro!', description: `Não foi possível salvar a obra: ${error instanceof Error ? error.message : String(error)}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // Append new files to the existing list
      setCurrentFiles(prev => [...prev, ...Array.from(files)]);
    }
    // Reset the input to allow re-uploading the same file if needed
    if (event.target) {
      event.target.value = ''; 
    }
  };
  
  // This function now simply removes the file from the "currentFiles" state.
  const handleRemoveFile = (fileToRemove: ProjectFile | File) => {
    setCurrentFiles(prev => prev.filter(file => file !== fileToRemove));
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
                 <div className="space-y-2 mt-2">
                    {currentFiles.map((file, index) => {
                        const isNew = file instanceof File;
                        const key = isNew ? `${file.name}-${index}` : file.path;
                        const name = isNew ? `${file.name} (novo)` : file.name;
                        const title = isNew ? file.name : file.name;

                        return (
                            <div key={key} className={`flex items-center justify-between rounded-md border p-2 ${isNew ? 'border-dashed' : ''}`}>
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <span className={`text-sm truncate ${isNew ? 'italic' : ''}`} title={title}>{name}</span>
                                </div>
                                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveFile(file)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        )
                    })}
                  </div>
                <div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                    className="hidden"
                    multiple
                  />
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="mt-2">
                      <Upload className="mr-2 h-4 w-4" /> Carregar Arquivos
                  </Button>
                </div>
                <FormMessage />
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
