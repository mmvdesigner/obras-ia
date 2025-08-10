'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';
import { useData } from '@/hooks/use-data';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

// Schema for editing an existing user
const editUserSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    email: z.string().email('Email inválido'),
    role: z.enum(['Administrator', 'Gerente de Obra']),
});

// Schema for creating a new user (password is required)
const newUserSchema = editUserSchema.extend({
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

interface UserFormProps {
  user?: User | null;
  onFinished: () => void;
}

export function UserForm({ user, onFinished }: UserFormProps) {
  const { addUser, updateUser } = useData();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine which schema and default values to use
  const isEditing = !!user;
  const formSchema = isEditing ? editUserSchema : newUserSchema;
  
  const defaultValues = isEditing
    ? { name: user.name, email: user.email, role: user.role }
    : { name: '', email: '', role: 'Gerente de Obra', password: '' };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (formData: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateUser({ ...user, ...formData });
        toast({ title: 'Usuário atualizado!', description: 'Os dados do usuário foram salvos.' });
      } else {
        // Here we'd normally call a backend function to create the auth user
        // For this prototype, we'll just add them to the Firestore collection
        await addUser(formData as Omit<User, 'id'>);
        toast({ title: 'Usuário criado!', description: 'O novo usuário foi adicionado.' });
      }
      onFinished();
    } catch (error) {
       console.error("Failed to save user:", error);
       toast({ variant: 'destructive', title: 'Erro!', description: `Não foi possível salvar o usuário.` });
    } finally {
        setIsSubmitting(false);
    }
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
                <Input placeholder="Nome do usuário" {...field} />
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
                <Input type="email" placeholder="usuario@email.com" {...field} disabled={isEditing} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {!isEditing && (
           <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                 <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Função</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Administrator">Administrator</SelectItem>
                  <SelectItem value="Gerente de Obra">Gerente de Obra</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onFinished} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Salvar Alterações' : 'Criar Usuário'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
