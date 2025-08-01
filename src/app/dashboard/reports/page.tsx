'use client';

import { useState } from 'react';
import { Bot, Loader2 } from 'lucide-react';
import { DataProvider, useData } from '@/hooks/use-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { summarizeProjectExpenses, SummarizeProjectExpensesInput } from '@/ai/flows/summarize-project-expenses';
import type { Project, Expense } from '@/lib/types';

function ExpenseAnalyzer() {
  const { data } = useData();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGenerateSummary = async () => {
    if (!selectedProjectId) return;
    
    setIsLoading(true);
    setSummary('');

    const project = data.projects.find(p => p.id === selectedProjectId);
    if (!project) {
        setIsLoading(false);
        return;
    }

    const expenses = data.expenses.filter(e => e.projectId === selectedProjectId);

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
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analisador de Despesas com IA</CardTitle>
        <CardDescription>
          Selecione uma obra para obter um resumo inteligente dos gastos e identificar oportunidades de economia.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 space-y-2 sm:space-y-0">
          <Select onValueChange={setSelectedProjectId} value={selectedProjectId}>
            <SelectTrigger className="w-full sm:w-[300px]">
              <SelectValue placeholder="Selecione uma obra" />
            </SelectTrigger>
            <SelectContent>
              {data.projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleGenerateSummary} disabled={!selectedProjectId || isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Bot className="mr-2 h-4 w-4" />
            )}
            Gerar Resumo
          </Button>
        </div>

        {(isLoading || summary) && (
            <Card className="bg-muted/50">
                <CardHeader className="flex flex-row items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Resumo da IA</CardTitle>
                </CardHeader>
                <CardContent>
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
  );
}

function ReportsPageContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">Analise o desempenho de suas obras.</p>
      </div>
      <ExpenseAnalyzer />
    </div>
  );
}

export default function ReportsPage() {
  return (
    <DataProvider>
      <ReportsPageContent />
    </DataProvider>
  );
}
