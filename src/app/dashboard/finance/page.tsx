'use client';

import { useState } from 'react';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DataProvider, useData } from '@/hooks/use-data';
import type { Expense } from '@/lib/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ExpenseForm } from './_components/expense-form';

function FinancePageContent() {
  const { data, deleteExpense } = useData();
  const [open, setOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

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
  
  const getProjectExpenses = (projectId: string) => {
    return data.expenses.filter(e => e.projectId === projectId).reduce((sum, e) => sum + e.amount, 0);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
            <p className="text-muted-foreground">Controle os gastos e o orçamento das suas obras.</p>
          </div>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" /> Novo Gasto
            </Button>
          </DialogTrigger>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
            {data.projects.map(project => {
                const totalExpenses = getProjectExpenses(project.id);
                const budgetProgress = (totalExpenses / project.totalBudget) * 100;
                return (
                    <Card key={project.id}>
                        <CardHeader>
                            <CardTitle>{project.name}</CardTitle>
                            <CardDescription>
                                Orçamento: {formatCurrency(project.totalBudget)}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm font-medium">Gastos: {formatCurrency(totalExpenses)}</p>
                            <Progress value={budgetProgress} className="mt-2" />
                            <p className="text-xs text-muted-foreground mt-1">{budgetProgress.toFixed(2)}% do orçamento utilizado</p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registro de Gastos</CardTitle>
            <CardDescription>Lista de todas as despesas registradas.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Obra</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell>{data.projects.find(p => p.id === expense.projectId)?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{expense.category}</Badge>
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
        <ExpenseForm expense={editingExpense} onFinished={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

export default function FinancePage() {
  return (
    <DataProvider>
      <FinancePageContent />
    </DataProvider>
  );
}
