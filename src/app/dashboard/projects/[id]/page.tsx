'use client';
import {useRouter, useParams} from 'next/navigation';
import React from 'react';
import {useData} from '@/hooks/use-data';
import {ArrowLeft, Building2, CalendarClock, DollarSign, Users, Package} from 'lucide-react';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import Link from 'next/link';

import TeamPageContent from '../../team/_components/team-page-content';
import FinancePageContent from '../../finance/page';
import SchedulePageContent from '../../schedule/page';
import InventoryPageContent from '../../inventory/page';

export default function ProjectDetailsPage() {
  const router = useRouter();
  const params = React.use(useParams());
  const {data} = useData();
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id;
  const project = data.projects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <h2 className="text-2xl font-bold">Obra não encontrada</h2>
        <Button onClick={() => router.push('/dashboard/projects')} className="mt-4">
          Voltar para Obras
        </Button>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(value);
  };
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR', {timeZone: 'UTC'});

  return (
    <div className="space-y-6">
      <Link href="/dashboard/projects" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para todas as obras
      </Link>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
        <p className="text-muted-foreground">{project.address}</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <Building2 className="mr-2 h-4 w-4" /> Visão Geral
          </TabsTrigger>
          <TabsTrigger value="schedule">
            <CalendarClock className="mr-2 h-4 w-4" /> Cronograma
          </TabsTrigger>
          <TabsTrigger value="finance">
            <DollarSign className="mr-2 h-4 w-4" /> Financeiro
          </TabsTrigger>
          <TabsTrigger value="inventory">
            <Package className="mr-2 h-4 w-4" /> Estoque
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="mr-2 h-4 w-4" /> Equipe
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Obra</CardTitle>
              <CardDescription>Informações gerais sobre o projeto.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Cliente</h3>
                  <p className="text-muted-foreground">{project.client}</p>
                </div>
                <div>
                  <h3 className="font-medium">Status</h3>
                  <p className="text-muted-foreground">{project.status}</p>
                </div>
                <div>
                  <h3 className="font-medium">Data de Início</h3>
                  <p className="text-muted-foreground">{formatDate(project.startDate)}</p>
                </div>
                <div>
                  <h3 className="font-medium">Data de Término</h3>
                  <p className="text-muted-foreground">{formatDate(project.endDate)}</p>
                </div>
                <div>
                  <h3 className="font-medium">Orçamento Total</h3>
                  <p className="text-muted-foreground">{formatCurrency(project.totalBudget)}</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium">Descrição</h3>
                <p className="text-muted-foreground">{project.description}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="schedule">
          <SchedulePageContent projectId={project.id} />
        </TabsContent>
        <TabsContent value="finance">
          <FinancePageContent projectId={project.id} />
        </TabsContent>
        <TabsContent value="inventory">
          <InventoryPageContent projectId={project.id} />
        </TabsContent>
        <TabsContent value="team">
          <TeamPageContent projectId={project.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
