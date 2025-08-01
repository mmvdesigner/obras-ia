'use client';

import { useState, useMemo, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Bot, Loader2, Printer } from 'lucide-react';
import { useData } from '@/hooks/use-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { summarizeProjectExpenses, SummarizeProjectExpensesInput } from '@/ai/flows/summarize-project-expenses';
import { useReactToPrint } from 'react-to-print';

function ReportsPage() {
  const { data } = useData();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const reportRef = useRef(null);

  const project = useMemo(() => data.projects.find(p => p.id === selectedProjectId), [data, selectedProjectId]);
  const expenses = useMemo(() => data.expenses.filter(e => e.projectId === selectedProjectId), [data, selectedProjectId]);
  const tasks = useMemo(() => data.tasks.filter(t => t.projectId === selectedProjectId), [data, selectedProjectId]);
  
  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
    documentTitle: `Relatorio-${project?.name.replace(/\s/g, '_') || 'obra'}`
  });

  const handleGenerateSummary = async () => {
    if (!project) return;
    
    setIsLoading(true);
    setSummary('');

    const projectParameters = `
        Nome do Projeto: ${project.name}
        Orçamento Total: ${project.totalBudget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        Data de Início: ${project.startDate}
        Data de Fim: ${project.endDate}
        Descrição: ${project.description}
    `;

    const expenseReports = expenses.map(e => 
        `Categoria: ${e.category}, Descrição: ${e.description}, Valor: ${e.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
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
          <Button onClick={handlePrint} disabled={!selectedProjectId} className="w-full sm:w-auto">
            <Printer className="mr-2 h-4 w-4" />
            Exportar para PDF
          </Button>
        </div>
      </div>
      
      {project ? (
        <div ref={reportRef} className="space-y-6 p-4 @media print:p-0">
          <Card>
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>Resumo financeiro e de progresso</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div>
                  <h3 className="font-semibold">Orçamento Total</h3>
                  <p>{formatCurrency(project.totalBudget)}</p>
              </div>
              <div>
                  <h3 className="font-semibold">Total Gasto</h3>
                  <p>{formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}</p>
              </div>
              <div>
                  <h3 className="font-semibold">Progresso das Tarefas</h3>
                  <p>{tasks.filter(t => t.status === 'concluída').length} de {tasks.length} tarefas concluídas</p>
              </div>
            </CardContent>
          </Card>
          
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
              <CardTitle className="flex items-center gap-2">
                <Bot /> Análise da IA
              </CardTitle>
              <CardDescription>
                Resumo inteligente dos gastos e identificação de oportunidades de economia.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <Button onClick={handleGenerateSummary} disabled={!selectedProjectId || isLoading} className="w-full sm:w-auto">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Bot className="mr-2 h-4 w-4" />
                  )}
                  Gerar Resumo da IA
                </Button>

              {(isLoading || summary) && (
                  <Card className="bg-muted/50">
                      <CardContent className="pt-6">
                          {isLoading ? (
                              <div className="space-y-2">
                                  <p className="animate-pulse">Analisando despesas...</p>
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
      ) : (
        <Card className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Selecione uma obra para ver o relatório.</p>
        </Card>
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
