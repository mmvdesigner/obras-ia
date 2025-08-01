'use client';

import { useMemo } from 'react';
import { useData } from '@/hooks/use-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface InventoryPageContentProps {
  projectId: string;
}

export default function InventoryPageContent({ projectId }: InventoryPageContentProps) {
  const { data } = useData();

  const projectInventory = useMemo(
    () => data.inventory.filter(item => item.projectId === projectId),
    [data.inventory, projectId]
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Controle de Estoque</CardTitle>
        <CardDescription>Materiais e insumos disponíveis para esta obra.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Material</TableHead>
              <TableHead>Quantidade em Estoque</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead className="text-right">Preço Médio Unitário</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projectInventory.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Nenhum material em estoque. Adicione um gasto de material para começar.
                </TableCell>
              </TableRow>
            )}
            {projectInventory.map(item => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.averagePrice)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
