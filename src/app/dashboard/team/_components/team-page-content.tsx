'use client';

import { useState, useMemo } from 'react';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useData } from '@/hooks/use-data';
import type { Employee } from '@/lib/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EmployeeForm } from './employee-form';

interface TeamPageContentProps {
  projectId: string;
}

export default function TeamPageContent({ projectId }: TeamPageContentProps) {
  const { data, deleteEmployee } = useData();
  const [open, setOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const projectEmployees = useMemo(
    () => data.employees.filter(e => e.linkedProjectIds.includes(projectId)),
    [data.employees, projectId]
  );

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setOpen(true);
  };

  const handleAddNew = () => {
    setEditingEmployee(null);
    setOpen(true);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Equipe da Obra</CardTitle>
                <CardDescription>Funcionários alocados para este projeto.</CardDescription>
              </div>
              <DialogTrigger asChild>
                <Button onClick={handleAddNew}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Novo Funcionário
                </Button>
              </DialogTrigger>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>
                      <Badge variant={employee.status === 'ativo' ? 'default' : 'outline'}>{employee.status}</Badge>
                    </TableCell>
                    <TableCell>{employee.email}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleEdit(employee)}>Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteEmployee(employee.id)}>Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{editingEmployee ? 'Editar Funcionário' : 'Novo Funcionário'}</DialogTitle>
          <DialogDescription>
            {editingEmployee ? 'Atualize os detalhes do funcionário.' : 'Preencha as informações do novo funcionário.'}
          </DialogDescription>
        </DialogHeader>
        <EmployeeForm employee={editingEmployee} onFinished={() => setOpen(false)} projectId={projectId} />
      </DialogContent>
    </Dialog>
  );
}
