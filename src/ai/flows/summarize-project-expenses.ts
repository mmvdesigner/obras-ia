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
});
export type SummarizeProjectExpensesInput = z.infer<typeof SummarizeProjectExpensesInputSchema>;

const SummarizeProjectExpensesOutputSchema = z.object({
  summary: z.string().describe('A summary of the project expenses, including areas where costs can be reduced.'),
});
export type SummarizeProjectExpensesOutput = z.infer<typeof SummarizeProjectExpensesOutputSchema>;

export async function summarizeProjectExpenses(input: SummarizeProjectExpensesInput): Promise<SummarizeProjectExpensesOutput> {
  return summarizeProjectExpensesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeProjectExpensesPrompt',
  input: {schema: SummarizeProjectExpensesInputSchema},
  output: {schema: SummarizeProjectExpensesOutputSchema},
  prompt: `You are an expert project manager specializing in cost reduction.

You will use the project parameters and expense reports to identify areas where costs can be reduced. Provide a summary of the expenses, and suggest areas for cost reduction based on project parameters.

Project Parameters: {{{projectParameters}}}
Expense Reports: {{{expenseReports}}}`,
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
