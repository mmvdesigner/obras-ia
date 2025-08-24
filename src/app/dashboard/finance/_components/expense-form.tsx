'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/hooks/use-data';
import type { Expense, ExpenseCategory, ExpenseStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';

const expenseSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.coerce.number().min(0.01, 'Valor deve ser positivo'),
  date: z.string().min(1, 'Data é obrigatória'),
  category: z.enum(['material', 'mao de obra', 'equipamentos', 'servicos', 'documentacao', 'outros']),
  projectId: z.string().min(1, 'Obra é obrigatória'),
  supplier: z.string().min(1, 'Fornecedor é obrigatório'),
  status: z.enum(['pago', 'a pagar']),
  receipt: z.string().optional(),
  paymentDate: z.string().optional(),
  // Inventory fields - optional in the object, but required by form logic if category is material
  materialName: z.string().optional(),
  quantity: z.coerce.number().optional(),
  unitPrice: z.coerce.number().optional(),
  unit: z.string().optional(),
}).refine(data => {
    if (data.category === 'material') {
        return !!data.materialName && (data.quantity ?? 0) > 0 && (data.unitPrice ?? 0) > 0 && !!data.unit;
    }
    return true;
}, {
    message: "Para a categoria 'Material', o nome, quantidade, unidade e preço unitário são obrigatórios.",
    path: ['materialName'],
});


type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  expense?: Expense | null;
  onFinished: () => void;
  projectId: string;
}

const categoryLabels: Record<ExpenseCategory, string> = {
  material: 'Material de Construção',
  'mao de obra': 'Mão de Obra',
  equipamentos: 'Equipamentos/Ferramentas',
  servicos: 'Serviços Terceirizados',
  documentacao: 'Documentação',
  outros: 'Outros',
};

const statusLabels: Record<ExpenseStatus, string> = {
  pago: 'Pago',
  'a pagar': 'A Pagar',
};

export function ExpenseForm({ expense, onFinished, projectId }: ExpenseFormProps) {
  const { data, addExpense, updateExpense } = useData();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: Partial<ExpenseFormValues> = expense
    ? { 
        ...expense,
        date: expense.date.split('T')[0],
        paymentDate: expense.paymentDate ? expense.paymentDate.split('T')[0] : '',
      }
    : {
        date: new Date().toISOString().split('T')[0],
        paymentDate: '',
        category: 'material',
        status: 'pago',
        projectId,
        description: '',
        amount: 0,
        supplier: '',
        receipt: '',
        materialName: '',
        quantity: 0,
        unitPrice: 0,
        unit: '',
      };

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues,
  });

  const watchedCategory = useWatch({ control: form.control, name: 'category' });
  const watchedQuantity = useWatch({ control: form.control, name: 'quantity' });
  const watchedUnitPrice = useWatch({ control: form.control, name: 'unitPrice' });
  const watchedStatus = useWatch({ control: form.control, name: 'status' });

  useEffect(() => {
    if(watchedCategory === 'material' && watchedQuantity && watchedUnitPrice) {
        const total = watchedQuantity * watchedUnitPrice;
        form.setValue('amount', total, { shouldValidate: true });
    }
  }, [watchedQuantity, watchedUnitPrice, watchedCategory, form])

  useEffect(() => {
    // If status is 'pago' and there's no paymentDate, set it to today
    if (watchedStatus === 'pago' && !form.getValues('paymentDate')) {
        form.setValue('paymentDate', new Date().toISOString().split('T')[0]);
    }
  }, [watchedStatus, form]);

  const onSubmit = async (formData: ExpenseFormValues) => {
    setIsSubmitting(true);
    
    // Ensure paymentDate is null if status is 'a pagar'
    const finalData = {
        ...formData,
        paymentDate: formData.status === 'pago' ? (formData.paymentDate || new Date().toISOString().split('T')[0]) : undefined,
    }

    try {
        if (expense) {
            await updateExpense({ ...expense, ...finalData });
            toast({ title: 'Gasto atualizado!', description: 'O gasto foi salvo com sucesso.' });
        } else {
            await addExpense(finalData);
            toast({ title: 'Gasto registrado!', description: 'O novo gasto foi adicionado.' });
        }
        onFinished();
    } catch(error) {
        console.error("Failed to save expense:", error);
        toast({ variant: "destructive", title: "Erro!", description: "Não foi possível salvar o gasto." });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ScrollArea className="h-[70vh] max-h-[70vh] md:h-[60vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-6">
                <div className="md:col-span-2">
                    <FormField
                        control={form.control}
                        name="projectId"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Obra Vinculada</FormLabel>
                            <Input disabled value={data.projects.find(p => p.id === projectId)?.name} />
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>

                <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {Object.entries(categoryLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                            {label}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                            <Input placeholder="Compra de cimento" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                {watchedCategory === 'material' && (
                    <>
                        <FormField
                            control={form.control}
                            name="materialName"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nome do Material</FormLabel>
                                <FormControl>
                                    <Input placeholder="Cimento CPII" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="unit"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Unidade</FormLabel>
                                <FormControl>
                                    <Input placeholder="saco, m³, unidade" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Quantidade</FormLabel>
                                <FormControl>
                                <Input type="number" placeholder="10" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="unitPrice"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Preço Unitário (R$)</FormLabel>
                                <FormControl>
                                <Input type="number" step="0.01" placeholder="50.00" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </>
                )}

                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Valor Total (R$)</FormLabel>
                        <FormControl>
                        <Input type="number" placeholder="1500.00" {...field} disabled={watchedCategory === 'material'} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Data da Despesa</FormLabel>
                        <FormControl>
                        <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                
                <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Fornecedor</FormLabel>
                    <FormControl>
                        <Input placeholder="Casa do Construtor" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Status do Pagamento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {Object.entries(statusLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                            {label}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                
                {watchedStatus === 'pago' && (
                    <FormField
                        control={form.control}
                        name="paymentDate"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Data do Pagamento</FormLabel>
                            <FormControl>
                            <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                )}

                <div className="md:col-span-2">
                    <FormField
                    control={form.control}
                    name="receipt"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Comprovante (Descrição/Link)</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Nota fiscal N-12345 ou link para o arquivo" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
            </div>
        </ScrollArea>
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onFinished} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {expense ? 'Salvar Alterações' : 'Registrar Gasto'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
