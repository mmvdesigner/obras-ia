'use client';

import { useMemo, useState } from 'react';
import { useData } from '@/hooks/use-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface InventoryPageContentProps {
  projectId: string;
}

export default function InventoryPageContent({ projectId }: InventoryPageContentProps) {
  const { data } = useData();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const projectInventory = useMemo(
    () => data.inventory.filter(item => item.projectId === projectId),
    [data.inventory, projectId]
  );
  
  const totalPages = Math.ceil(projectInventory.length / itemsPerPage);
  const paginatedInventory = projectInventory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
              <TableHead className="text-right">Valor Total em Estoque</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedInventory.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Nenhum material em estoque. Adicione um gasto de material para começar.
                </TableCell>
              </TableRow>
            )}
            {paginatedInventory.map(item => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.averagePrice)}</TableCell>
                <TableCell className="text-right font-bold">{formatCurrency(item.averagePrice * item.quantity)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
       <CardFooter className="flex items-center justify-end">
         {totalPages > 1 && (
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
  );
}
