'use client';

import { useState, useMemo, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Bot, Loader2, AlertCircle } from 'lucide-react';
import { useData } from '@/hooks/use-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { summarizeProjectExpenses, SummarizeProjectExpensesInput } from '@/ai/flows/summarize-project-expenses';
import { Badge } from '@/components/ui/badge';
import { LiderLogo } from '@/components/logo';
import type { Expense } from '@/lib/types';

function ReportHeader({ project, reportTitle }: { project: any, reportTitle: string }) {
    if (!project) return null;
    return (
        <div className="flex justify-between items-center mb-6">
            <div>
                <CardTitle>{reportTitle}: {project.name}</CardTitle>
                <CardDescription>Emitido em: {new Date().toLocaleDateString('pt-BR')}</CardDescription>
            </div>
             <div className="flex items-center gap-2">
                <LiderLogo className="w-8 h-8 text-primary" />
                <span className="text-xl font-semibold text-primary">LIDER Empreendimentos</span>
            </div>
        </div>
    )
}

// Reusable formatters
const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });


// General Report Component
function GeneralReport({ projectId }: { projectId: string }) {
    const { data } = useData();
    const [summary, setSummary] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    const project = useMemo(() => data.projects.find(p => p.id === projectId), [data, projectId]);
    const expenses = useMemo(() => data.expenses.filter(e => e.projectId === projectId), [data, projectId]);
    const tasks = useMemo(() => data.tasks.filter(t => t.projectId === projectId), [data, projectId]);
    const pendingExpenses = useMemo(() => expenses.filter(e => e.status === 'a pagar'), [expenses]);

    const handleGenerateSummary = async () => {
        if (!project) return;
        
        setIsLoading(true);
        setSummary('');

        const projectParameters = `
            Nome do Projeto: ${project.name}
            Orçamento Total: ${project.totalBudget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            Data de Início: ${new Date(project.startDate).toLocaleDateString('pt-BR')}
            Data de Fim: ${new Date(project.endDate).toLocaleDateString('pt-BR')}
            Descrição: ${project.description}
        `;

        const expenseReports = expenses.map(e => 
            `Categoria: ${e.category}, Descrição: ${e.description}, Valor: ${e.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}, Status: ${e.status}`
        ).join('\n');
        
        try {
            const input: SummarizeProjectExpensesInput = {
                projectParameters,
                expenseReports
            };
            const result = await summarizeProjectExpenses(input);
            setSummary(result.summary);
        } catch (error) {
            console.error('Error generating summary:', error);
            setSummary('Ocorreu um erro ao gerar o resumo. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const expensesByCategory = useMemo(() => {
        return expenses.reduce((acc, expense) => {
            const category = expense.category;
            if (!acc[category]) {
                acc[category] = 0;
            }
            acc[category] += expense.amount;
            return acc;
        }, {} as Record<string, number>);
    }, [expenses]);
    
    const chartData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, 'Valor (R$)': value }));

    const totalSpent = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);
    const totalPaid = useMemo(() => expenses.filter(e => e.status === 'pago').reduce((sum, e) => sum + e.amount, 0), [expenses]);
    const totalPending = useMemo(() => pendingExpenses.reduce((sum, e) => sum + e.amount, 0), [pendingExpenses]);
    const tasksCompleted = useMemo(() => tasks.filter(t => t.status === 'concluída').length, [tasks]);

    if (!project) return null;

    return (
        <div className="space-y-6">
             <Card className="print:shadow-none print:border-none">
                <CardContent className="pt-6">
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">Cliente</TableCell>
                                <TableCell>{project.client}</TableCell>
                                <TableCell className="font-medium">Status</TableCell>
                                <TableCell><Badge>{project.status}</Badge></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Endereço</TableCell>
                                <TableCell colSpan={3}>{project.address}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Data de Início</TableCell>
                                <TableCell>{formatDate(project.startDate)}</TableCell>
                                <TableCell className="font-medium">Data de Término</TableCell>
                                <TableCell>{formatDate(project.endDate)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-2">
                <Card className="print:shadow-none print:border">
                    <CardHeader><CardTitle>Resumo Financeiro</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableBody>
                                <TableRow><TableCell>Orçamento Total</TableCell><TableCell className="text-right font-bold">{formatCurrency(project.totalBudget)}</TableCell></TableRow>
                                <TableRow><TableCell>Total Gasto (Pago)</TableCell><TableCell className="text-right font-bold">{formatCurrency(totalPaid)}</TableCell></TableRow>
                                <TableRow className="text-destructive"><TableCell>Total a Pagar</TableCell><TableCell className="text-right font-bold">{formatCurrency(totalPending)}</TableCell></TableRow>
                                <TableRow><TableCell>Orçamento Restante</TableCell><TableCell className="text-right font-bold">{formatCurrency(project.totalBudget - totalPaid)}</TableCell></TableRow>
                                <TableRow><TableCell>Valor Total dos Gastos</TableCell><TableCell className="text-right font-bold">{formatCurrency(totalSpent)}</TableCell></TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Card className="print:shadow-none print:border">
                    <CardHeader><CardTitle>Resumo do Cronograma</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableBody>
                                <TableRow><TableCell>Total de Tarefas</TableCell><TableCell className="text-right font-bold">{tasks.length}</TableCell></TableRow>
                                <TableRow><TableCell>Tarefas Concluídas</TableCell><TableCell className="text-right font-bold">{tasksCompleted}</TableCell></TableRow>
                                <TableRow><TableCell>Progresso</TableCell><TableCell className="text-right font-bold">{tasks.length > 0 ? `${((tasksCompleted / tasks.length) * 100).toFixed(0)}%` : 'N/A'}</TableCell></TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            
            <Card className="print:shadow-none print:border">
                <CardHeader><CardTitle>Gastos por Categoria</CardTitle></CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => formatCurrency(Number(value))} />
                            <Tooltip formatter={(value) => formatCurrency(Number(value))}/>
                            <Legend />
                            <Bar dataKey="Valor (R$)" fill="hsl(var(--primary))" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="print:hidden">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Bot /> Análise da IA</CardTitle>
                        <CardDescription>Resumo inteligente dos gastos e identificação de oportunidades de economia.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button onClick={handleGenerateSummary} disabled={!projectId || isLoading} className="w-full sm:w-auto">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                            Gerar Análise com IA
                        </Button>
                        {(isLoading || summary) && (
                            <Card className="bg-muted/50"><CardContent className="pt-6">
                                {isLoading ? (
                                    <div className="space-y-2">
                                        <p className="animate-pulse">Analisando despesas...</p>
                                        <p className="animate-pulse w-3/4">Aguarde, a inteligência artificial está trabalhando...</p>
                                    </div>
                                ) : (
                                    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">{summary}</div>
                                )}
                            </CardContent></Card>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Pending Expenses Report
function PendingExpensesReport({ expenses }: { expenses: Expense[] }) {
    const totalPending = expenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <Card className="print:shadow-none print:border break-inside-avoid">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><AlertCircle className="text-destructive"/> Contas a Pagar</CardTitle>
                <CardDescription>Despesas registradas que ainda não foram quitadas.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Fornecedor</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {expenses.length === 0 ? (
                            <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Nenhuma conta a pagar.</TableCell></TableRow>
                        ) : (
                            expenses.map(expense => (
                                <TableRow key={expense.id}>
                                    <TableCell>{expense.description}</TableCell>
                                    <TableCell>{expense.supplier}</TableCell>
                                    <TableCell>{formatDate(expense.date)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter className="justify-end font-bold text-lg">
                Total a Pagar: {formatCurrency(totalPending)}
            </CardFooter>
        </Card>
    );
}

// Expenses by Category Report
function CategoryReport({ expenses }: { expenses: Expense[] }) {
    const expensesByCategory = useMemo(() => {
        return expenses.reduce((acc, expense) => {
            const category = expense.category;
            if (!acc[category]) {
                acc[category] = { total: 0, items: [] };
            }
            acc[category].total += expense.amount;
            acc[category].items.push(expense);
            return acc;
        }, {} as Record<string, { total: number; items: Expense[] }>);
    }, [expenses]);

    return (
        <div className="space-y-6">
            {Object.entries(expensesByCategory).map(([category, data]) => (
                <Card key={category} className="print:shadow-none print:border break-inside-avoid">
                    <CardHeader>
                        <CardTitle>{category.charAt(0).toUpperCase() + category.slice(1)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                             <TableHeader>
                                <TableRow>
                                    <TableHead>Descrição</TableHead>
                                    <TableHead>Fornecedor</TableHead>
                                    <TableHead>Data</TableHead>
                                    <TableHead className="text-right">Valor</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.items.map(expense => (
                                    <TableRow key={expense.id}>
                                        <TableCell>{expense.description}</TableCell>
                                        <TableCell>{expense.supplier}</TableCell>
                                        <TableCell>{formatDate(expense.date)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                     <CardFooter className="justify-end font-bold text-lg">
                        Total: {formatCurrency(data.total)}
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}

// Expenses by Supplier Report
function SupplierReport({ expenses }: { expenses: Expense[] }) {
     const expensesBySupplier = useMemo(() => {
        return expenses.reduce((acc, expense) => {
            const supplier = expense.supplier;
            if (!acc[supplier]) {
                acc[supplier] = { total: 0, items: [] };
            }
            acc[supplier].total += expense.amount;
            acc[supplier].items.push(expense);
            return acc;
        }, {} as Record<string, { total: number; items: Expense[] }>);
    }, [expenses]);

    return (
        <div className="space-y-6">
            {Object.entries(expensesBySupplier).map(([supplier, data]) => (
                <Card key={supplier} className="print:shadow-none print:border break-inside-avoid">
                    <CardHeader>
                        <CardTitle>{supplier}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                             <TableHeader>
                                <TableRow>
                                    <TableHead>Descrição</TableHead>
                                    <TableHead>Categoria</TableHead>
                                    <TableHead>Data</TableHead>
                                    <TableHead className="text-right">Valor</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.items.map(expense => (
                                    <TableRow key={expense.id}>
                                        <TableCell>{expense.description}</TableCell>
                                        <TableCell>{expense.category}</TableCell>
                                        <TableCell>{formatDate(expense.date)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                     <CardFooter className="justify-end font-bold text-lg">
                        Total: {formatCurrency(data.total)}
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}


const reportTypes = {
  'general': 'Relatório Geral',
  'pending': 'Contas a Pagar',
  'category': 'Despesas por Categoria',
  'supplier': 'Despesas por Fornecedor',
};

type ReportType = keyof typeof reportTypes;

function ReportsPage() {
  const { data } = useData();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [reportType, setReportType] = useState<ReportType>('general');
  
  const project = useMemo(() => data.projects.find(p => p.id === selectedProjectId), [data, selectedProjectId]);
  const projectExpenses = useMemo(() => data.expenses.filter(e => e.projectId === selectedProjectId), [data.expenses, selectedProjectId]);
  const pendingExpenses = useMemo(() => projectExpenses.filter(e => e.status === 'a pagar'), [projectExpenses]);
  const reportRef = useRef(null);

  const renderReportContent = () => {
    switch (reportType) {
      case 'general':
        return <GeneralReport projectId={selectedProjectId} />;
      case 'pending':
        return <PendingExpensesReport expenses={pendingExpenses} />;
      case 'category':
        return <CategoryReport expenses={projectExpenses} />;
      case 'supplier':
        return <SupplierReport expenses={projectExpenses} />;
      default:
        return <p>Selecione um tipo de relatório.</p>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios da Obra</h1>
          <p className="text-muted-foreground">Analise o desempenho de suas obras.</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 space-y-2 sm:space-y-0">
          <Select onValueChange={setSelectedProjectId} value={selectedProjectId}>
            <SelectTrigger className="w-full sm:w-[250px]">
              <SelectValue placeholder="Selecione uma obra" />
            </SelectTrigger>
            <SelectContent>
              {data.projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select onValueChange={(value) => setReportType(value as ReportType)} value={reportType} disabled={!selectedProjectId}>
            <SelectTrigger className="w-full sm:w-[250px]">
              <SelectValue placeholder="Selecione o tipo de relatório" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(reportTypes).map(([key, value]) => (
                <SelectItem key={key} value={key}>{value}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {!selectedProjectId ? (
        <Card className="flex items-center justify-center h-64 print:hidden"><p className="text-muted-foreground">Selecione uma obra para ver o relatório.</p></Card>
      ) : (
        <div ref={reportRef}>
            <div className="p-4 mb-4 border rounded-lg">
                <ReportHeader project={project} reportTitle={reportTypes[reportType]} />
            </div>
            {renderReportContent()}
        </div>
      )}
    </div>
  );
}

export default function ReportsPageWrapper() {
  return <ReportsPage />;
}
