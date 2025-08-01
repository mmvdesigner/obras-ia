'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/hooks/use-data';
import { Activity, Users, DollarSign, Building2 } from 'lucide-react';
import { DataProvider } from '@/hooks/use-data';
import { useMemo } from 'react';

function DashboardPageContent() {
  const { data } = useData();

  const activeProjects = useMemo(() => data.projects.filter(p => p.status === 'em andamento').length, [data.projects]);
  const activeEmployees = useMemo(() => data.employees.filter(e => e.status === 'ativo').length, [data.employees]);
  const totalExpensesMonth = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return data.expenses
      .filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
      })
      .reduce((sum, e) => sum + e.amount, 0);
  }, [data.expenses]);
  
  const completedProjects = useMemo(() => data.projects.filter(p => p.status === 'concluída').length, [data.projects]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Obras em Andamento</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
            <p className="text-xs text-muted-foreground">Projetos atualmente ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funcionários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEmployees}</div>
            <p className="text-xs text-muted-foreground">Colaboradores na equipe</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpensesMonth)}</div>
            <p className="text-xs text-muted-foreground">Total de despesas no mês corrente</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Obras Concluídas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{completedProjects}</div>
            <p className="text-xs text-muted-foreground">Total de projetos finalizados</p>
          </CardContent>
        </Card>
      </div>
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Visão Geral das Obras</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {/* Placeholder for a chart */}
            <div className="h-[350px] w-full flex items-center justify-center text-muted-foreground bg-gray-100 dark:bg-gray-800 rounded-md">
                Chart Placeholder
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.tasks.slice(0, 5).map(task => (
                <div key={task.id} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{task.name}</p>
                    <p className="text-sm text-muted-foreground">Projeto: {data.projects.find(p => p.id === task.projectId)?.name}</p>
                  </div>
                  <div className="ml-auto font-medium">{task.status}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


export default function DashboardPage() {
    return (
        <DataProvider>
            <DashboardPageContent />
        </DataProvider>
    )
}
