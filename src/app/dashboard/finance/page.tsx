'use client';

import { useState, useMemo } from 'react';
import { PlusCircle, MoreHorizontal, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useData } from '@/hooks/use-data';
import type { Expense, ExpenseStatus } from '@/lib/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ExpenseForm } from './_components/expense-form';
import { Separator } from '@/components/ui/separator';

interface FinancePageContentProps {
  projectId: string;
}

const statusVariant: Record<ExpenseStatus, 'default' | 'destructive'> = {
  pago: 'default',
  'a pagar': 'destructive',
};

const statusLabel: Record<ExpenseStatus, string> = {
    pago: 'Pago',
    'a pagar': 'A Pagar',
}


function ExpenseTable({ title, description, icon: Icon, expenses, onEdit, onDelete, onMarkAsPaid }: {
  title: string;
  description: string;
  icon: React.ElementType;
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onMarkAsPaid?: (expense: Expense) => void;
}) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start gap-4">
                    <Icon className="h-6 w-6 text-muted-foreground" />
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Fornecedor</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                            <TableHead>
                                <span className="sr-only">Ações</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {expenses.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground">Nenhum registro encontrado.</TableCell>
                            </TableRow>
                        )}
                        {expenses.map((expense) => (
                            <TableRow key={expense.id}>
                                <TableCell className="font-medium">{expense.description}</TableCell>
                                <TableCell>{expense.supplier}</TableCell>
                                <TableCell>{new Date(expense.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                                <TableCell>
                                    <Badge variant={statusVariant[expense.status]}>{statusLabel[expense.status]}</Badge>
                                </TableCell>
                                <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
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
                                            {onMarkAsPaid && expense.status === 'a pagar' && (
                                                <DropdownMenuItem onClick={() => onMarkAsPaid(expense)}>Marcar como Pago</DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem onClick={() => onEdit(expense)}>Editar</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onDelete(expense.id)}>Excluir</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter className="justify-end font-bold">
               Total: {formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}
            </CardFooter>
        </Card>
    )
}

export default function FinancePageContent({ projectId }: FinancePageContentProps) {
  const { data, deleteExpense, updateExpense } = useData();
  const [open, setOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const project = useMemo(() => data.projects.find(p => p.id === projectId), [data.projects, projectId]);
  
  const projectExpenses = useMemo(() => {
    return data.expenses.filter(e => e.projectId === projectId);
  }, [data.expenses, projectId]);

  const pendingExpenses = useMemo(() => projectExpenses.filter(e => e.status === 'a pagar'), [projectExpenses]);
  const paidExpenses = useMemo(() => projectExpenses.filter(e => e.status === 'pago'), [projectExpenses]);
  
  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingExpense(null);
    setOpen(true);
  }

  const handleMarkAsPaid = (expense: Expense) => {
    updateExpense({ ...expense, status: 'pago' });
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };
  
  const totalPaid = useMemo(() => paidExpenses.reduce((sum, e) => sum + e.amount, 0), [paidExpenses]);
  const totalPending = useMemo(() => pendingExpenses.reduce((sum, e) => sum + e.amount, 0), [pendingExpenses]);
  const budgetProgress = project ? (totalPaid / project.totalBudget) * 100 : 0;

  if (!project) {
    return <div>Carregando...</div>
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <CardTitle>Resumo Financeiro</CardTitle>
            <DialogTrigger asChild>
                <Button onClick={handleAddNew}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Novo Gasto
                </Button>
            </DialogTrigger>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Visão Geral do Orçamento</CardTitle>
                <CardDescription>
                    Orçamento Total: {formatCurrency(project.totalBudget)}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
               <div className="flex flex-col space-y-1.5">
                   <p className="text-sm font-medium">Total Pago</p>
                   <p className="text-2xl font-bold">{formatCurrency(totalPaid)}</p>
               </div>
                <div className="flex flex-col space-y-1.5">
                   <p className="text-sm font-medium text-destructive">Contas a Pagar</p>
                   <p className="text-2xl font-bold text-destructive">{formatCurrency(totalPending)}</p>
               </div>
                <div className="flex flex-col space-y-1.5">
                   <p className="text-sm font-medium">Orçamento Restante</p>
                   <p className="text-2xl font-bold">{formatCurrency(project.totalBudget - totalPaid)}</p>
               </div>
            </CardContent>
            <CardFooter>
                 <div className="w-full">
                    <Progress value={budgetProgress} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">{budgetProgress.toFixed(2)}% do orçamento utilizado (baseado em pagamentos)</p>
                 </div>
            </CardFooter>
        </Card>

        <Separator />
        
        <div className="space-y-6">
            <ExpenseTable 
                title="Contas a Pagar"
                description="Despesas registradas que ainda não foram pagas."
                icon={AlertCircle}
                expenses={pendingExpenses}
                onEdit={handleEdit}
                onDelete={deleteExpense}
                onMarkAsPaid={handleMarkAsPaid}
            />
             <ExpenseTable 
                title="Histórico de Pagamentos"
                description="Todas as despesas que já foram pagas."
                icon={CheckCircle2}
                expenses={paidExpenses}
                onEdit={handleEdit}
                onDelete={deleteExpense}
            />
        </div>

      </div>

      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{editingExpense ? 'Editar Gasto' : 'Novo Gasto'}</DialogTitle>
          <DialogDescription>
            {editingExpense ? 'Atualize os detalhes do gasto.' : 'Preencha as informações do novo gasto.'}
          </DialogDescription>
        </DialogHeader>
        <ExpenseForm expense={editingExpense} onFinished={() => setOpen(false)} projectId={projectId}/>
      </DialogContent>
    </Dialog>
  );
}
