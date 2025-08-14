'use server';

/**
 * @fileOverview A project expense summarization AI agent.
 *
 * - summarizeProjectExpenses - A function that handles the summarization of project expenses.
 * - SummarizeProjectExpensesInput - The input type for the summarizeProjectExpenses function.
 * - SummarizeProjectExpensesOutput - The return type for the summarizeProjectExpenses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeProjectExpensesInputSchema = z.object({
  projectParameters: z.string().describe('The parameters of the project, including budget, timeline, and goals.'),
  expenseReports: z.string().describe('The expense reports for the project, including category, description, and amount.'),
  supplierCosts: z.string().describe('A summary of total costs per supplier.'),
});
export type SummarizeProjectExpensesInput = z.infer<typeof SummarizeProjectExpensesInputSchema>;

const SummarizeProjectExpensesOutputSchema = z.object({
  summary: z.string().describe('Uma análise concisa em português sobre os gastos do projeto, destacando os pontos principais e sugerindo áreas para redução de custos.'),
});
export type SummarizeProjectExpensesOutput = z.infer<typeof SummarizeProjectExpensesOutputSchema>;

export async function summarizeProjectExpenses(input: SummarizeProjectExpensesInput): Promise<SummarizeProjectExpensesOutput> {
  return summarizeProjectExpensesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeProjectExpensesPrompt',
  input: {schema: SummarizeProjectExpensesInputSchema},
  output: {schema: SummarizeProjectExpensesOutputSchema},
  prompt: `Você é um gestor de projetos especialista em redução de custos para construção civil.

Analise os parâmetros do projeto, os relatórios de despesas e os custos por fornecedor para identificar áreas onde os custos podem ser reduzidos.

Sua resposta deve ser em **PORTUGUÊS**.

Forneça um resumo dos gastos e sugira áreas específicas para economia, sempre se baseando nos parâmetros do projeto. Seja claro e objetivo.

Parâmetros do Projeto: {{{projectParameters}}}
Relatórios de Despesas: {{{expenseReports}}}
Custos por Fornecedor: {{{supplierCosts}}}`,
});

const summarizeProjectExpensesFlow = ai.defineFlow(
  {
    name: 'summarizeProjectExpensesFlow',
    inputSchema: SummarizeProjectExpensesInputSchema,
    outputSchema: SummarizeProjectExpensesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
