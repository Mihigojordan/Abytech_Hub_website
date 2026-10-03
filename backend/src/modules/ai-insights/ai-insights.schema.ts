import { z } from 'zod';

// Shape Claude must return; each top-level key maps to a tab on the Predictions page
const confidence = z.enum(['low', 'medium', 'high']);
const trend = z.enum(['increasing', 'decreasing', 'stable', 'insufficient_data']);

export const InsightsSchema = z.object({
  overview: z.object({
    headline: z.string().describe('One-sentence summary of how the organisation is doing'),
    healthScore: z.number().describe('Overall operational health, 0-100'),
    highlights: z.array(z.string()),
    concerns: z.array(z.string()),
  }),
  expenses: z.object({
    summary: z.string(),
    trend,
    nextMonthForecast: z.number().describe('Predicted total expense amount next month, in RWF'),
    forecastReasoning: z.string(),
    insights: z.array(z.string()),
  }),
  moneyUsage: z.object({
    summary: z.string(),
    usedTotal: z.number().describe('Total RWF already used in the period'),
    plannedUpcomingTotal: z.number().describe('Total RWF planned to be used in the future'),
    cashflowRisks: z.array(z.string()),
    insights: z.array(z.string()),
  }),
  salaries: z.object({
    summary: z.string(),
    trend,
    nextMonthForecast: z.number().describe('Predicted total net salary payout next month, in RWF'),
    insights: z.array(z.string()),
  }),
  reports: z.object({
    summary: z.string(),
    keyThemes: z.array(z.string()).describe('Recurring topics found by reading report contents'),
    employees: z.array(
      z.object({
        name: z.string(),
        reportsCount: z.number(),
        performance: z.enum(['excellent', 'good', 'needs_attention', 'inactive']),
        note: z.string(),
      }),
    ),
  }),
  goals: z.object({
    summary: z.string(),
    completionRate: z.number().describe('Percent of weekly goals completed, 0-100'),
    insights: z.array(z.string()),
  }),
  schedule: z.object({
    summary: z.string(),
    upcomingHighlights: z.array(z.string()),
    workloadNotes: z.array(z.string()),
  }),
  research: z.object({
    summary: z.string(),
    insights: z.array(z.string()),
  }),
  predictions: z.array(
    z.object({
      area: z.string(),
      prediction: z.string(),
      timeframe: z.string(),
      confidence,
    }),
  ),
  recommendations: z.array(
    z.object({
      priority: z.enum(['high', 'medium', 'low']),
      action: z.string(),
      reason: z.string(),
    }),
  ),
});

export type Insights = z.infer<typeof InsightsSchema>;
