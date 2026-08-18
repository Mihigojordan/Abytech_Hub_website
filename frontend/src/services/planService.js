// Frontend-only mock service (localStorage-backed) for the Plan catalog
// (Starter/Pro/Enterprise-style tiers). No backend endpoint exists yet.

import { delay, genId, readStore, writeStore, daysAgo } from '../utils/mockStore';

const STORAGE_KEY = 'abytech_plans';

export const BILLING_CYCLES = ['MONTHLY', 'YEARLY'];

// maxModules: null means unlimited (all modules in the registry allowed).
// The admin still picks *which* specific modules to turn on per tenant from
// Modules & Access — the plan only caps *how many* they can enable.
const SEED_PLANS = [
  {
    id: 'plan-starter',
    name: 'Starter',
    description: 'For small single-location businesses just getting going.',
    price: 30000,
    currency: 'RWF',
    billingCycle: 'MONTHLY',
    maxModules: 3,
    isActive: true,
    createdAt: daysAgo(60),
  },
  {
    id: 'plan-pro',
    name: 'Pro',
    description: 'For growing businesses with multiple branches and staff.',
    price: 80000,
    currency: 'RWF',
    billingCycle: 'MONTHLY',
    maxModules: 7,
    isActive: true,
    createdAt: daysAgo(60),
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise',
    description: 'Full platform access for large multi-branch operations.',
    price: 200000,
    currency: 'RWF',
    billingCycle: 'MONTHLY',
    maxModules: null,
    isActive: true,
    createdAt: daysAgo(60),
  },
];

const ensureSeeded = () => {
  const existing = readStore(STORAGE_KEY);
  if (existing === null) {
    writeStore(STORAGE_KEY, SEED_PLANS);
    return SEED_PLANS;
  }
  return existing;
};

class PlanService {
  async getAllPlans({ includeArchived = true } = {}) {
    await delay();
    let records = ensureSeeded();
    if (!includeArchived) records = records.filter((p) => p.isActive);
    return [...records].sort((a, b) => a.price - b.price);
  }

  async getPlanById(id) {
    await delay(150);
    const records = ensureSeeded();
    const record = records.find((p) => p.id === id);
    if (!record) throw new Error('Plan not found');
    return record;
  }

  async createPlan(data) {
    await delay();
    const records = ensureSeeded();
    const plan = {
      id: genId(),
      name: data.name?.trim() || '',
      description: data.description?.trim() || '',
      price: Number(data.price) || 0,
      currency: data.currency || 'RWF',
      billingCycle: data.billingCycle || 'MONTHLY',
      maxModules: data.maxModules === null || data.maxModules === '' ? null : Number(data.maxModules),
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    records.push(plan);
    writeStore(STORAGE_KEY, records);
    return plan;
  }

  async updatePlan(id, data) {
    await delay();
    const records = ensureSeeded();
    const idx = records.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Plan not found');
    records[idx] = {
      ...records[idx],
      name: data.name?.trim() ?? records[idx].name,
      description: data.description?.trim() ?? records[idx].description,
      price: data.price !== undefined ? Number(data.price) : records[idx].price,
      currency: data.currency ?? records[idx].currency,
      billingCycle: data.billingCycle ?? records[idx].billingCycle,
      maxModules: data.maxModules !== undefined
        ? (data.maxModules === null || data.maxModules === '' ? null : Number(data.maxModules))
        : records[idx].maxModules,
    };
    writeStore(STORAGE_KEY, records);
    return records[idx];
  }

  async setPlanActive(id, isActive) {
    await delay();
    const records = ensureSeeded();
    const idx = records.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Plan not found');
    records[idx] = { ...records[idx], isActive };
    writeStore(STORAGE_KEY, records);
    return records[idx];
  }

  async deletePlan(id) {
    await delay();
    const records = ensureSeeded();
    const next = records.filter((p) => p.id !== id);
    writeStore(STORAGE_KEY, next);
    return true;
  }
}

const planService = new PlanService();
export default planService;
