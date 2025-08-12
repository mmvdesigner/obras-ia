'use client';

import { useState, useMemo, useCallback } from 'react';
import { PlusCircle, MoreHorizontal, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Search, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useData } from '@/hooks/use-data';
import type { Expense, ExpenseCategory, ExpenseStatus } from '@/lib/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ExpenseForm } from './_components/expense-form';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

const categoryLabels: Record<ExpenseCategory, string> = {
  material: 'Material de Construção',
  'mao de obra': 'Mão de Obra',
  equipamentos: 'Equipamentos/Ferramentas',
  servicos: 'Serviços Terceirizados',
  outros: 'Outros',
};

type SortKey = keyof Expense | 'none';

function ExpenseTable({ 
    title, 
    description, 
    icon: Icon, 
    expenses, 
    onEdit, 
    onDelete, 
    onMarkAsPaid, 
    showPagination = true,
    sortDescriptor,
    onSortChange,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onMarkAsPaid?: (expense: Expense) => void;
  showPagination?: boolean;
  sortDescriptor: { key: SortKey; direction: 'asc' | 'desc' };
  onSortChange: (key: SortKey) => void;
}) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const totalPages = Math.ceil(expenses.length / itemsPerPage);
    const paginatedExpenses = expenses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const renderSortIndicator = (key: SortKey) => {
        if (sortDescriptor.key !== key) return null;
        return sortDescriptor.direction === 'asc' ? ' ▲' : ' ▼';
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
                            <TableHead>
                                <Button variant="ghost" onClick={() => onSortChange('description')}>
                                    Descrição {renderSortIndicator('description')}
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button variant="ghost" onClick={() => onSortChange('supplier')}>
                                    Fornecedor {renderSortIndicator('supplier')}
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button variant="ghost" onClick={() => onSortChange('date')}>
                                    Data {renderSortIndicator('date')}
                                 </Button>
                            </TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">
                                <Button variant="ghost" onClick={() => onSortChange('amount')}>
                                    Valor {renderSortIndicator('amount')}
                                </Button>
                            </TableHead>
                            <TableHead>
                                <span className="sr-only">Ações</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedExpenses.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground">Nenhum registro encontrado.</TableCell>
                            </TableRow>
                        )}
                        {paginatedExpenses.map((expense) => (
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
            <CardFooter className="flex items-center justify-between">
               <div className="font-bold">
                 Total: {formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}
               </div>
               {showPagination && totalPages > 1 && (
                 <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                        <ChevronLeft className="h-4 w-4"/>
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Página {currentPage} de {totalPages}
                    </span>
                    <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                        <ChevronRight className="h-4 w-4"/>
                    </Button>
                 </div>
               )}
            </CardFooter>
        </Card>
    )
}

export default function FinancePageContent({ projectId }: FinancePageContentProps) {
  const { data, deleteExpense, updateExpense } = useData();
  const [open, setOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortDescriptor, setSortDescriptor] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });

  const project = useMemo(() => data.projects.find(p => p.id === projectId), [data.projects, projectId]);
  
  const projectExpenses = useMemo(() => {
    return data.expenses.filter(e => e.projectId === projectId);
  }, [data.expenses, projectId]);

  const filteredExpenses = useMemo(() => {
    return projectExpenses
      .filter(expense => {
        // Category filter
        if (categoryFilter !== 'all' && expense.category !== categoryFilter) {
            return false;
        }
        // Search term filter
        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            return (
                expense.description.toLowerCase().includes(lowerCaseSearch) ||
                expense.supplier.toLowerCase().includes(lowerCaseSearch)
            );
        }
        return true;
      })
  }, [projectExpenses, searchTerm, categoryFilter]);


  const sortedExpenses = useMemo(() => {
    const sorted = [...filteredExpenses];
    if (sortDescriptor.key !== 'none') {
        sorted.sort((a, b) => {
            const aValue = a[sortDescriptor.key as keyof Expense];
            const bValue = b[sortDescriptor.key as keyof Expense];

            if (aValue === undefined || bValue === undefined) return 0;
            
            if (aValue < bValue) return sortDescriptor.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDescriptor.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }
    return sorted;
  }, [filteredExpenses, sortDescriptor]);


  const handleSortChange = (key: SortKey) => {
    if (sortDescriptor.key === key) {
        setSortDescriptor({ key, direction: sortDescriptor.direction === 'asc' ? 'desc' : 'asc'});
    } else {
        setSortDescriptor({ key, direction: 'asc' });
    }
  };


  const pendingExpenses = useMemo(() => sortedExpenses.filter(e => e.status === 'a pagar'), [sortedExpenses]);
  const paidExpenses = useMemo(() => sortedExpenses.filter(e => e.status === 'pago'), [sortedExpenses]);
  
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
  
  const totalPaid = useMemo(() => projectExpenses.filter(e => e.status === 'pago').reduce((sum, e) => sum + e.amount, 0), [projectExpenses]);
  const totalPending = useMemo(() => projectExpenses.filter(e => e.status === 'a pagar').reduce((sum, e) => sum + e.amount, 0), [projectExpenses]);
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

        <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Pesquisar por descrição ou fornecedor..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[280px]">
                    <SelectValue placeholder="Filtrar por categoria" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todas as Categorias</SelectItem>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        
        <div className="space-y-6">
            <ExpenseTable 
                title="Contas a Pagar"
                description="Despesas registradas que ainda não foram pagas."
                icon={AlertCircle}
                expenses={pendingExpenses}
                onEdit={handleEdit}
                onDelete={deleteExpense}
                onMarkAsPaid={handleMarkAsPaid}
                sortDescriptor={sortDescriptor}
                onSortChange={handleSortChange}
            />
             <ExpenseTable 
                title="Histórico de Pagamentos"
                description="Todas as despesas que já foram pagas."
                icon={CheckCircle2}
                expenses={paidExpenses}
                onEdit={handleEdit}
                onDelete={deleteExpense}
                sortDescriptor={sortDescriptor}
                onSortChange={handleSortChange}
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
