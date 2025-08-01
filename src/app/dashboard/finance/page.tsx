'use client';

import { useState, useMemo } from 'react';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useData } from '@/hooks/use-data';
import type { Expense } from '@/lib/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ExpenseForm } from './_components/expense-form';

interface FinancePageContentProps {
  projectId: string;
}

export default function FinancePageContent({ projectId }: FinancePageContentProps) {
  const { data, deleteExpense } = useData();
  const [open, setOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const project = useMemo(() => data.projects.find(p => p.id === projectId), [data.projects, projectId]);
  
  const projectExpenses = useMemo(() => {
    return data.expenses.filter(e => e.projectId === projectId);
  }, [data.expenses, projectId]);

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingExpense(null);
    setOpen(true);
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };
  
  const totalExpenses = useMemo(() => projectExpenses.reduce((sum, e) => sum + e.amount, 0), [projectExpenses]);
  const budgetProgress = project ? (totalExpenses / project.totalBudget) * 100 : 0;

  if (!project) {
    return <div>Carregando...</div>
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Resumo Financeiro da Obra</CardTitle>
                <CardDescription>
                    Orçamento Total: {formatCurrency(project.totalBudget)}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm font-medium">Total de Gastos: {formatCurrency(totalExpenses)}</p>
                <Progress value={budgetProgress} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">{budgetProgress.toFixed(2)}% do orçamento utilizado</p>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
             <div className="flex items-center justify-between">
              <div>
                <CardTitle>Registro de Gastos</CardTitle>
                <CardDescription>Lista de todas as despesas registradas para esta obra.</CardDescription>
              </div>
              <DialogTrigger asChild>
                <Button onClick={handleAddNew}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Novo Gasto
                </Button>
              </DialogTrigger>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{expense.category}</Badge>
                    </TableCell>
                    <TableCell>{new Date(expense.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleEdit(expense)}>Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteExpense(expense.id)}>Excluir</DropdownMenuItem>
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

      <DialogContent className="sm:max-w-[625px]">
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
