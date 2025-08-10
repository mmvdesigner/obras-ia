'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useData } from '@/hooks/use-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserForm } from './_components/user-form';
import type { User } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const profileFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

function SettingsPageContent() {
    const { user, loading: authLoading } = useAuth();
    const { data, loading: dataLoading, updateUser, deleteUser } = useData();
    const router = useRouter();
    const { toast } = useToast();

    // Dialog states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    // Security check: Redirect non-admins away from this page.
    useEffect(() => {
        if (!authLoading && user?.role !== 'Administrator') {
            toast({
                variant: 'destructive',
                title: 'Acesso Negado',
                description: 'Você não tem permissão para acessar esta página.',
            });
            router.push('/dashboard');
        }
    }, [user, authLoading, router, toast]);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        values: {
            name: user?.name || '',
            email: user?.email || '',
        }
    });

    const onProfileSubmit = (formData: ProfileFormValues) => {
        if (user) {
            updateUser({ ...user, ...formData });
            toast({
                title: 'Perfil Atualizado!',
                description: 'Suas informações foram salvas com sucesso.',
            });
        }
    };

    const handleAddNew = () => {
        setEditingUser(null);
        setIsFormOpen(true);
    }
    
    const handleEdit = (userToEdit: User) => {
        setEditingUser(userToEdit);
        setIsFormOpen(true);
    }

    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
        setIsAlertOpen(true);
    }

    const handleConfirmDelete = async () => {
        if (userToDelete) {
            if (userToDelete.id === user?.id) {
                toast({ variant: 'destructive', title: 'Ação não permitida', description: 'Você não pode excluir seu próprio usuário.'});
                setIsAlertOpen(false);
                return;
            }
            try {
                await deleteUser(userToDelete.id);
                toast({ title: 'Usuário excluído!', description: 'O usuário foi removido do sistema.' });
            } catch (error) {
                toast({ variant: 'destructive', title: 'Erro!', description: 'Não foi possível excluir o usuário.' });
            }
            setIsAlertOpen(false);
            setUserToDelete(null);
        }
    }

    
    // Show a loading/skeleton state while we verify the user's role.
    if(authLoading || dataLoading || user?.role !== 'Administrator') {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-1/4" />
                <Skeleton className="h-6 w-1/2" />
                <Card>
                    <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-24" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
                    <CardContent>
                        <Skeleton className="h-40 w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
                <p className="text-muted-foreground">Gerencie as configurações da aplicação e seus usuários.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Meu Perfil</CardTitle>
                    <CardDescription>Atualize suas informações pessoais.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-4 max-w-lg">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Seu nome completo" {...field} />
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
                                            <Input type="email" placeholder="seu@email.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit">Salvar Alterações</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Gerenciamento de Usuários</CardTitle>
                        <CardDescription>Adicione, edite ou remova usuários do sistema.</CardDescription>
                    </div>
                    <DialogTrigger asChild>
                        <Button onClick={handleAddNew}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Novo Usuário
                        </Button>
                    </DialogTrigger>
                </CardHeader>
                <CardContent>
                   <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Usuário</TableHead>
                                <TableHead>Função</TableHead>
                                <TableHead><span className="sr-only">Ações</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.users.map(u => (
                                <TableRow key={u.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={u.avatar} />
                                                <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{u.name}</p>
                                                <p className="text-sm text-muted-foreground">{u.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={u.role === 'Administrator' ? 'default' : 'secondary'}>{u.role}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => handleEdit(u)}>Editar</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDeleteClick(u)} className="text-destructive">Excluir</DropdownMenuItem>
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
        <DialogContent>
            <DialogHeader>
            <DialogTitle>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
            <DialogDescription>
                {editingUser ? 'Atualize os detalhes do usuário.' : 'Preencha as informações para criar um novo usuário.'}
            </DialogDescription>
            </DialogHeader>
            <UserForm user={editingUser} onFinished={() => setIsFormOpen(false)} />
        </DialogContent>
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                       Esta ação não pode ser desfeita. Isso irá excluir permanentemente o usuário "{userToDelete?.name}" e remover seus dados dos servidores.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">Sim, excluir</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </Dialog>
    );
}

export default function SettingsPage() {
    return (
        <SettingsPageContent />
    );
}
