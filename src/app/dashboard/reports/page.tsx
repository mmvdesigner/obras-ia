'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Bot, Loader2, Printer, AlertCircle } from 'lucide-react';
import { useData } from '@/hooks/use-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { summarizeProjectExpenses, SummarizeProjectExpensesInput } from '@/ai/flows/summarize-project-expenses';
import { useReactToPrint } from 'react-to-print';
import { Badge } from '@/components/ui/badge';
import { DataProvider } from '@/hooks/use-data';

function ReportContent({ projectId }: { projectId: string }) {
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

    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    const totalSpent = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);
    const totalPaid = useMemo(() => expenses.filter(e => e.status === 'pago').reduce((sum, e) => sum + e.amount, 0), [expenses]);
    const totalPending = useMemo(() => pendingExpenses.reduce((sum, e) => sum + e.amount, 0), [pendingExpenses]);
    const tasksCompleted = useMemo(() => tasks.filter(t => t.status === 'concluída').length, [tasks]);

    if (!project) return null;

    return (
        <div className="space-y-6 p-4 print:p-0">
            <Card>
                <CardHeader>
                    <CardTitle>Relatório Geral: {project.name}</CardTitle>
                    <CardDescription>Emitido em: {new Date().toLocaleDateString('pt-BR')}</CardDescription>
                </CardHeader>
                <CardContent>
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
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Resumo Financeiro</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Orçamento Total</TableCell>
                                    <TableCell className="text-right font-bold">{formatCurrency(project.totalBudget)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Total Gasto (Pago)</TableCell>
                                    <TableCell className="text-right font-bold">{formatCurrency(totalPaid)}</TableCell>
                                </TableRow>
                                <TableRow className="text-destructive">
                                    <TableCell>Total a Pagar</TableCell>
                                    <TableCell className="text-right font-bold">{formatCurrency(totalPending)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Orçamento Restante</TableCell>
                                    <TableCell className="text-right font-bold">{formatCurrency(project.totalBudget - totalPaid)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Valor Total dos Gastos</TableCell>
                                    <TableCell className="text-right font-bold">{formatCurrency(totalSpent)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Resumo do Cronograma</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Total de Tarefas</TableCell>
                                    <TableCell className="text-right font-bold">{tasks.length}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Tarefas Concluídas</TableCell>
                                    <TableCell className="text-right font-bold">{tasksCompleted}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Progresso</TableCell>
                                    <TableCell className="text-right font-bold">{tasks.length > 0 ? `${((tasksCompleted / tasks.length) * 100).toFixed(0)}%` : 'N/A'}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                <CardTitle>Gastos por Categoria</CardTitle>
                </CardHeader>
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
            
            <Card>
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
                                {pendingExpenses.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">Nenhuma conta a pagar.</TableCell>
                                    </TableRow>
                                ) : (
                                    pendingExpenses.map(expense => (
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
                </Card>

            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bot /> Análise da IA
                </CardTitle>
                <CardDescription>
                    Resumo inteligente dos gastos e identificação de oportunidades de economia.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <Button onClick={handleGenerateSummary} disabled={!projectId || isLoading} className="w-full sm:w-auto">
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Bot className="mr-2 h-4 w-4" />
                    )}
                    Gerar Análise com IA
                    </Button>

                {(isLoading || summary) && (
                    <Card className="bg-muted/50">
                        <CardContent className="pt-6">
                            {isLoading ? (
                                <div className="space-y-2">
                                    <p className="animate-pulse">Analisando despesas...</p>
                                    <p className="animate-pulse w-3/4">Aguarde, a inteligência artificial está trabalhando...</p>
                                </div>
                            ) : (
                                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                                    {summary}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
                </CardContent>
            </Card>
        </div>
    )
}

function ReportsPage() {
  const { data } = useData();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isPrinting, setIsPrinting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const project = useMemo(() => data.projects.find(p => p.id === selectedProjectId), [data, selectedProjectId]);

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
    documentTitle: `Relatorio-${project?.name.replace(/\s/g, '_') || 'obra'}`,
    onBeforeGetContent: () => setIsPrinting(true),
    onAfterPrint: () => setIsPrinting(false),
  });

  // react-to-print needs a brief moment for the content to be available in the DOM.
  // We use a state `isPrinting` to render the component before calling print.
  useEffect(() => {
    if (isPrinting) {
      handlePrint();
    }
  }, [isPrinting, handlePrint]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios da Obra</h1>
          <p className="text-muted-foreground">Analise o desempenho de suas obras.</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 space-y-2 sm:space-y-0">
          <Select onValueChange={setSelectedProjectId} value={selectedProjectId}>
            <SelectTrigger className="w-full sm:w-[300px]">
              <SelectValue placeholder="Selecione uma obra" />
            </SelectTrigger>
            <SelectContent>
              {data.projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handlePrint} disabled={!selectedProjectId}>
            <Printer className="mr-2 h-4 w-4" />
            Exportar para PDF
          </Button>
        </div>
      </div>
      
      {!selectedProjectId ? (
        <Card className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Selecione uma obra para ver o relatório.</p>
        </Card>
      ) : (
        <div ref={reportRef}><ReportContent projectId={selectedProjectId} /></div>
      )}
    </div>
  );
}

export default function ReportsPageWrapper() {
  return (
    <DataProvider>
      <ReportsPage />
    </DataProvider>
  );
}
