import { z } from 'zod';

// Shape Claude must return. Numbers and scores are computed in ai-insights.metrics.ts;
// Claude adds the qualitative layer: what the numbers mean and what to do about them.
//
// Every section shares ONE shape, defined once: the API compiles the schema into a
// grammar with a size limit, and per-section objects exceed it. toInsights() then
// reshapes the output into one object per tab for the frontend.
const SECTIONS = ['overview', 'expenses', 'moneyUsage', 'salaries', 'reports', 'goals', 'schedule', 'research'] as const;
const trend = z.enum(['increasing', 'decreasing', 'stable', 'insufficient_data']);

export const AiOutputSchema = z.object({
  headline: z.string().describe('One-sentence summary of how the organisation is doing'),
  highlights: z.array(z.string()),
  concerns: z.array(z.string()),
  sections: z
    .array(
      z.object({
        section: z.enum(SECTIONS),
        summary: z.string().describe('Short summary of the section'),
        meaning: z.string().describe('2-3 simple sentences explaining what the computed numbers and score mean for the business, quoting key figures and naming the weakest score factor'),
        points: z.array(z.string()).describe('Key observations. moneyUsage: cash-flow risks first. reports: recurring themes from reading the reports. schedule: upcoming highlights and workload notes'),
        advice: z
          .array(
            z.object({
              action: z.string().describe('A concrete step the admin can take this week'),
              calculation: z.string().describe('The arithmetic behind it with real figures, e.g. "470,000 RWF forecast - 390,000 RWF average = cut 80,000 RWF"'),
              impact: z.string().describe('Expected effect, ideally in score points or RWF'),
            }),
          )
          .describe('2-4 actions, most important first'),
      }),
    )
    .describe(`Exactly one entry for each of: ${SECTIONS.join(', ')}`),
  forecasts: z.object({
    expensesNextMonth: z.number().describe('Your judgement of total expenses next month in RWF, starting from the computed trend forecast'),
    expensesTrend: trend,
    expensesReasoning: z.string().describe('Why your forecast agrees or differs from the computed trend forecast'),
    salariesNextMonth: z.number().describe('Your judgement of total net salary payout next month in RWF'),
    salariesTrend: trend,
  }),
  reportEmployees: z.array(
    z.object({
      name: z.string(),
      performance: z.enum(['excellent', 'good', 'needs_attention', 'inactive']),
      note: z.string(),
    }),
  ),
  predictions: z.array(
    z.object({
      area: z.string(),
      prediction: z.string(),
      expectedValue: z.string().describe('The predicted number with its unit, e.g. "420,000 RWF" or "65%"; "n/a" only if truly not numeric'),
      basis: z.string().describe('The computed figures the prediction is based on'),
      timeframe: z.string(),
      confidence: z.enum(['low', 'medium', 'high']),
    }),
  ),
  recommendations: z.array(
    z.object({
      priority: z.enum(['high', 'medium', 'low']),
      action: z.string(),
      reason: z.string(),
      expectedScoreGain: z.number().describe('Estimated points the overall score (0-100) could gain if done; 0 if unknown'),
    }),
  ),
});

export type AiOutput = z.infer<typeof AiOutputSchema>;
type Section = AiOutput['sections'][number];

// One object per tab, as the Predictions page reads it
export const toInsights = (ai: AiOutput) => {
  const bySection = new Map(ai.sections.map((s) => [s.section, s]));
  const sec = (key: Section['section']) => {
    const s = bySection.get(key);
    return { summary: s?.summary ?? '', meaning: s?.meaning ?? '', points: s?.points ?? [], advice: s?.advice ?? [] };
  };
  const { forecasts: f } = ai;

  return {
    overview: { headline: ai.headline, highlights: ai.highlights, concerns: ai.concerns, ...sec('overview') },
    expenses: { ...sec('expenses'), trend: f.expensesTrend, nextMonthForecast: f.expensesNextMonth, forecastReasoning: f.expensesReasoning },
    moneyUsage: sec('moneyUsage'),
    salaries: { ...sec('salaries'), trend: f.salariesTrend, nextMonthForecast: f.salariesNextMonth },
    reports: { ...sec('reports'), employees: ai.reportEmployees },
    goals: sec('goals'),
    schedule: sec('schedule'),
    research: sec('research'),
    predictions: ai.predictions,
    recommendations: ai.recommendations,
  };
};

export type Insights = ReturnType<typeof toInsights>;
