'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/hooks/use-data';
import type { Employee } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const employeeSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  role: z.string().min(1, 'Função é obrigatória'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  email: z.string().email('Email inválido'),
  salary: z.coerce.number().min(0, 'Salário deve ser positivo'),
  status: z.enum(['ativo', 'inativo']),
  linkedProjectIds: z.array(z.string()).min(1, 'Selecione ao menos um projeto'),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  employee?: Employee | null;
  onFinished: () => void;
}

export function EmployeeForm({ employee, onFinished }: EmployeeFormProps) {
  const { data, addEmployee, updateEmployee } = useData();
  const { toast } = useToast();

  const defaultValues: Partial<EmployeeFormValues> = employee
    ? { ...employee }
    : { status: 'ativo', linkedProjectIds: [] };

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues,
  });

  const onSubmit = (formData: EmployeeFormValues) => {
    if (employee) {
      updateEmployee({ ...employee, ...formData });
      toast({ title: 'Funcionário atualizado!', description: 'Os dados foram salvos.' });
    } else {
      addEmployee(formData);
      toast({ title: 'Funcionário adicionado!', description: 'O novo funcionário foi salvo.' });
    }
    onFinished();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <Input placeholder="João da Silva" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Função/Especialidade</FormLabel>
              <FormControl>
                <Input placeholder="Pedreiro" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input placeholder="(11) 99999-9999" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="joao.silva@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="salary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salário/Diária (R$)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="2500" {...field} />
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
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
         <FormField
            control={form.control}
            name="linkedProjectIds"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Obra(s) Vinculada(s)</FormLabel>
                    <Select onValueChange={(value) => field.onChange([value])} defaultValue={field.value?.[0]}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Selecione um projeto" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {data.projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        <Button type="submit">{employee ? 'Salvar Alterações' : 'Adicionar Funcionário'}</Button>
      </form>
    </Form>
  );
}
