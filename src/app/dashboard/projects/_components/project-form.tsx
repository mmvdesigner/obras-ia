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

type FileWithId = {
  id: string;
  file: File;
};
interface ProjectFormProps {
  project?: Project | null;
  onFinished: () => void;
}

export function ProjectForm({ project, onFinished }: ProjectFormProps) {
  const { addProject, updateProject } = useData();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for files already uploaded (from `project.files`)
  const [existingFiles, setExistingFiles] = useState<ProjectFile[]>([]);
  // State for newly added files (from file input)
  const [newFiles, setNewFiles] = useState<FileWithId[]>([]);
  // State for paths of existing files to be deleted
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]);
  
  useEffect(() => {
    // When the project prop changes (e.g., when opening the dialog), reset the state
    if (project?.files) {
      setExistingFiles(project.files);
    } else {
      setExistingFiles([]);
    }
    // Always clear new files and deletion list when the form is opened
    setNewFiles([]);
    setFilesToDelete([]);
  }, [project]);


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
    form.reset(defaultValues);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, form.reset]);


  const onSubmit = async (data: ProjectFormValues) => {
    setIsSubmitting(true);
    try {
      if (project) {
        // Pass the original project, the form data, new files, and paths of files to delete
        await updateProject(project, data, newFiles.map(f => f.file), filesToDelete);
        toast({ title: 'Obra atualizada!', description: 'Os dados da obra foram salvos.' });
      } else {
        await addProject(data, newFiles.map(f => f.file));
        toast({ title: 'Obra criada!', description: 'A nova obra foi adicionada com sucesso.' });
      }
      onFinished();
    } catch (error) {
      console.error("Failed to save project:", error);
      toast({ variant: 'destructive', title: 'Erro!', description: 'Não foi possível salvar a obra.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const filesWithIds: FileWithId[] = Array.from(files).map(file => ({
          id: `${file.name}-${file.lastModified}-${Math.random()}`,
          file,
      }));
      setNewFiles(prev => [...prev, ...filesWithIds]);
    }
    if (event.target) {
      event.target.value = ''; // Reset the input to allow re-uploading the same file
    }
  };

  const handleRemoveNewFile = (idToRemove: string) => {
    setNewFiles(prev => prev.filter((fwid) => fwid.id !== idToRemove));
  };
  
  const handleRemoveExistingFile = (fileToRemove: ProjectFile) => {
    // Remove from the display list
    setExistingFiles(prev => prev.filter(file => file.path !== fileToRemove.path));
    // Add its path to the deletion list
    if (fileToRemove.path) {
      setFilesToDelete(prev => [...prev, fileToRemove.path]);
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
                 <div className="space-y-2 mt-2">
                    {/* List existing files */}
                    {existingFiles.map((file, index) => (
                      <div key={`${file.path}-${index}`} className="flex items-center justify-between rounded-md border p-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm truncate" title={file.name}>{file.name}</span>
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveExistingFile(file)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    {/* List new files to be uploaded */}
                    {newFiles.map((fwid) => (
                       <div key={fwid.id} className="flex items-center justify-between rounded-md border border-dashed p-2">
                          <div className="flex items-center gap-2 overflow-hidden">
                              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm italic truncate" title={fwid.file.name}>{fwid.file.name} (novo)</span>
                          </div>
                          <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveNewFile(fwid.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                      </div>
                    ))}
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
