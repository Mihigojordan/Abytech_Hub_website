// Frontend-only mock service (localStorage-backed) for per-company
// subscriptions and their invoices/payments. No backend endpoint exists
// yet — separate from the existing customer-facing Order Payment model,
// this tracks what a company pays Abytech Hub for platform access.

import { delay, genId, readStore, writeStore, daysFromNow, daysAgo } from '../utils/mockStore';

const SUBS_KEY = 'abytech_subscriptions';
const PAYMENTS_KEY = 'abytech_payments';

export const SUBSCRIPTION_STATUS = { TRIAL: 'TRIAL', ACTIVE: 'ACTIVE', EXPIRED: 'EXPIRED', CANCELLED: 'CANCELLED' };
export const PAYMENT_STATUS = { PAID: 'PAID', PENDING: 'PENDING', OVERDUE: 'OVERDUE' };
export const PAYMENT_METHODS = ['MOMO', 'CARD', 'BANK'];

const SEED_SUBSCRIPTIONS = [
  {
    id: 'sub-seed-1',
    companyId: 'company-seed-1', // Sunset Lounge & Bar
    planId: 'plan-pro',
    status: SUBSCRIPTION_STATUS.ACTIVE,
    startDate: daysAgo(20),
    endDate: daysFromNow(10),
    autoRenew: true,
    createdAt: daysAgo(20),
  },
  {
    id: 'sub-seed-2',
    companyId: 'company-seed-2', // GreenLeaf Hotel
    planId: 'plan-enterprise',
    status: SUBSCRIPTION_STATUS.ACTIVE,
    startDate: daysAgo(50),
    endDate: daysFromNow(3),
    autoRenew: false,
    createdAt: daysAgo(50),
  },
  {
    id: 'sub-seed-3',
    companyId: 'company-seed-3', // Capital Mart Kigali
    planId: 'plan-starter',
    status: SUBSCRIPTION_STATUS.ACTIVE,
    startDate: daysAgo(38),
    endDate: daysFromNow(22),
    autoRenew: true,
    createdAt: daysAgo(38),
  },
  {
    id: 'sub-seed-4',
    companyId: 'company-seed-4', // Nyamirambo Family Restaurant
    planId: 'plan-pro',
    status: SUBSCRIPTION_STATUS.TRIAL,
    startDate: daysAgo(8),
    endDate: daysFromNow(6),
    autoRenew: false,
    createdAt: daysAgo(8),
  },
  {
    id: 'sub-seed-5',
    companyId: 'company-seed-5', // Skyline Business Hotel
    planId: 'plan-enterprise',
    status: SUBSCRIPTION_STATUS.ACTIVE,
    startDate: daysAgo(65),
    endDate: daysFromNow(45),
    autoRenew: true,
    createdAt: daysAgo(65),
  },
  {
    id: 'sub-seed-6',
    companyId: 'company-seed-7', // Downtown Quick Bites — lapsed, matches its SUSPENDED status
    planId: 'plan-starter',
    status: SUBSCRIPTION_STATUS.EXPIRED,
    startDate: daysAgo(90),
    endDate: daysAgo(12),
    autoRenew: false,
    createdAt: daysAgo(90),
  },
  {
    id: 'sub-seed-7',
    companyId: 'company-seed-1', // Sunset Lounge & Bar — a prior, now-cancelled Starter run before they upgraded to Pro
    planId: 'plan-starter',
    status: SUBSCRIPTION_STATUS.CANCELLED,
    startDate: daysAgo(110),
    endDate: daysAgo(20),
    autoRenew: false,
    createdAt: daysAgo(110),
  },
  {
    id: 'sub-seed-8',
    companyId: 'company-seed-8', // Musanze Highland Supermarket
    planId: 'plan-pro',
    status: SUBSCRIPTION_STATUS.ACTIVE,
    startDate: daysAgo(45),
    endDate: daysFromNow(25),
    autoRenew: true,
    createdAt: daysAgo(45),
  },
  {
    id: 'sub-seed-9',
    companyId: 'company-seed-9', // Akagera Safari Lodge
    planId: 'plan-enterprise',
    status: SUBSCRIPTION_STATUS.ACTIVE,
    startDate: daysAgo(78),
    endDate: daysFromNow(55),
    autoRenew: true,
    createdAt: daysAgo(78),
  },
  {
    id: 'sub-seed-10',
    companyId: 'company-seed-10', // Rusizi Riverside Bar
    planId: 'plan-starter',
    status: SUBSCRIPTION_STATUS.ACTIVE,
    startDate: daysAgo(15),
    endDate: daysFromNow(18),
    autoRenew: true,
    createdAt: daysAgo(15),
  },
  {
    id: 'sub-seed-11',
    companyId: 'company-seed-11', // Kigali Fashion Boutique
    planId: 'plan-free',
    status: SUBSCRIPTION_STATUS.TRIAL,
    startDate: daysAgo(1),
    endDate: daysFromNow(13),
    autoRenew: false,
    createdAt: daysAgo(1),
  },
  {
    id: 'sub-seed-12',
    companyId: 'company-seed-12', // Muhanga Bakery & Café
    planId: 'plan-starter',
    status: SUBSCRIPTION_STATUS.ACTIVE,
    startDate: daysAgo(30),
    endDate: daysFromNow(12),
    autoRenew: true,
    createdAt: daysAgo(30),
  },
  {
    id: 'sub-seed-13',
    companyId: 'company-seed-13', // Karongi Lakeview Lounge
    planId: 'plan-pro',
    status: SUBSCRIPTION_STATUS.ACTIVE,
    startDate: daysAgo(58),
    endDate: daysFromNow(30),
    autoRenew: true,
    createdAt: daysAgo(58),
  },
  {
    id: 'sub-seed-14',
    companyId: 'company-seed-14', // Remera Grill House — cancelled, matches its SUSPENDED status
    planId: 'plan-starter',
    status: SUBSCRIPTION_STATUS.CANCELLED,
    startDate: daysAgo(100),
    endDate: daysAgo(5),
    autoRenew: false,
    createdAt: daysAgo(100),
  },
];

const SEED_PAYMENTS = [
  {
    id: 'pay-seed-1',
    subscriptionId: 'sub-seed-1',
    companyId: 'company-seed-1',
    invoiceNumber: 'INV-0001',
    amount: 80000,
    currency: 'RWF',
    method: 'MOMO',
    status: PAYMENT_STATUS.PAID,
    dueDate: daysAgo(20),
    paidAt: daysAgo(19),
    createdAt: daysAgo(20),
  },
  {
    id: 'pay-seed-2',
    subscriptionId: 'sub-seed-2',
    companyId: 'company-seed-2',
    invoiceNumber: 'INV-0002',
    amount: 200000,
    currency: 'RWF',
    method: 'BANK',
    status: PAYMENT_STATUS.PENDING,
    dueDate: daysAgo(2),
    paidAt: null,
    createdAt: daysAgo(20),
  },
  {
    id: 'pay-seed-3',
    subscriptionId: 'sub-seed-3',
    companyId: 'company-seed-3',
    invoiceNumber: 'INV-0003',
    amount: 30000,
    currency: 'RWF',
    method: 'MOMO',
    status: PAYMENT_STATUS.PAID,
    dueDate: daysAgo(8),
    paidAt: daysAgo(8),
    createdAt: daysAgo(9),
  },
  {
    id: 'pay-seed-4',
    subscriptionId: 'sub-seed-3',
    companyId: 'company-seed-3',
    invoiceNumber: 'INV-0004',
    amount: 30000,
    currency: 'RWF',
    method: 'MOMO',
    status: PAYMENT_STATUS.PAID,
    dueDate: daysAgo(38),
    paidAt: daysAgo(37),
    createdAt: daysAgo(39),
  },
  {
    id: 'pay-seed-5',
    subscriptionId: 'sub-seed-4',
    companyId: 'company-seed-4',
    invoiceNumber: 'INV-0005',
    amount: 80000,
    currency: 'RWF',
    method: 'CARD',
    status: PAYMENT_STATUS.PENDING,
    dueDate: daysFromNow(6),
    paidAt: null,
    createdAt: daysAgo(8),
  },
  {
    id: 'pay-seed-6',
    subscriptionId: 'sub-seed-5',
    companyId: 'company-seed-5',
    invoiceNumber: 'INV-0006',
    amount: 200000,
    currency: 'RWF',
    method: 'BANK',
    status: PAYMENT_STATUS.PAID,
    dueDate: daysAgo(10),
    paidAt: daysAgo(9),
    createdAt: daysAgo(11),
  },
  {
    id: 'pay-seed-7',
    subscriptionId: 'sub-seed-5',
    companyId: 'company-seed-5',
    invoiceNumber: 'INV-0007',
    amount: 200000,
    currency: 'RWF',
    method: 'BANK',
    status: PAYMENT_STATUS.PAID,
    dueDate: daysAgo(40),
    paidAt: daysAgo(39),
    createdAt: daysAgo(41),
  },
  {
    id: 'pay-seed-8',
    subscriptionId: 'sub-seed-6',
    companyId: 'company-seed-7',
    invoiceNumber: 'INV-0008',
    amount: 30000,
    currency: 'RWF',
    method: 'MOMO',
    status: PAYMENT_STATUS.PENDING,
    dueDate: daysAgo(15),
    paidAt: null,
    createdAt: daysAgo(16),
  },
  {
    id: 'pay-seed-9',
    subscriptionId: 'sub-seed-8',
    companyId: 'company-seed-8',
    invoiceNumber: 'INV-0009',
    amount: 80000,
    currency: 'RWF',
    method: 'MOMO',
    status: PAYMENT_STATUS.PAID,
    dueDate: daysAgo(45),
    paidAt: daysAgo(44),
    createdAt: daysAgo(46),
  },
  {
    id: 'pay-seed-10',
    subscriptionId: 'sub-seed-9',
    companyId: 'company-seed-9',
    invoiceNumber: 'INV-0010',
    amount: 200000,
    currency: 'RWF',
    method: 'BANK',
    status: PAYMENT_STATUS.PAID,
    dueDate: daysAgo(78),
    paidAt: daysAgo(76),
    createdAt: daysAgo(79),
  },
  {
    id: 'pay-seed-11',
    subscriptionId: 'sub-seed-9',
    companyId: 'company-seed-9',
    invoiceNumber: 'INV-0011',
    amount: 200000,
    currency: 'RWF',
    method: 'BANK',
    status: PAYMENT_STATUS.PAID,
    dueDate: daysAgo(18),
    paidAt: daysAgo(17),
    createdAt: daysAgo(19),
  },
  {
    id: 'pay-seed-12',
    subscriptionId: 'sub-seed-10',
    companyId: 'company-seed-10',
    invoiceNumber: 'INV-0012',
    amount: 30000,
    currency: 'RWF',
    method: 'MOMO',
    status: PAYMENT_STATUS.PAID,
    dueDate: daysAgo(15),
    paidAt: daysAgo(14),
    createdAt: daysAgo(16),
  },
  {
    id: 'pay-seed-13',
    subscriptionId: 'sub-seed-12',
    companyId: 'company-seed-12',
    invoiceNumber: 'INV-0013',
    amount: 30000,
    currency: 'RWF',
    method: 'CARD',
    status: PAYMENT_STATUS.PAID,
    dueDate: daysAgo(30),
    paidAt: daysAgo(29),
    createdAt: daysAgo(31),
  },
  {
    id: 'pay-seed-14',
    subscriptionId: 'sub-seed-13',
    companyId: 'company-seed-13',
    invoiceNumber: 'INV-0014',
    amount: 80000,
    currency: 'RWF',
    method: 'MOMO',
    status: PAYMENT_STATUS.PAID,
    dueDate: daysAgo(58),
    paidAt: daysAgo(57),
    createdAt: daysAgo(59),
  },
  {
    id: 'pay-seed-15',
    subscriptionId: 'sub-seed-13',
    companyId: 'company-seed-13',
    invoiceNumber: 'INV-0015',
    amount: 80000,
    currency: 'RWF',
    method: 'MOMO',
    status: PAYMENT_STATUS.PENDING,
    dueDate: daysFromNow(2),
    paidAt: null,
    createdAt: daysAgo(28),
  },
  {
    id: 'pay-seed-16',
    subscriptionId: 'sub-seed-14',
    companyId: 'company-seed-14',
    invoiceNumber: 'INV-0016',
    amount: 30000,
    currency: 'RWF',
    method: 'MOMO',
    status: PAYMENT_STATUS.OVERDUE,
    dueDate: daysAgo(6),
    paidAt: null,
    createdAt: daysAgo(7),
  },
  {
    id: 'pay-seed-17',
    subscriptionId: 'sub-seed-11',
    companyId: 'company-seed-11',
    invoiceNumber: 'INV-0017',
    amount: 0,
    currency: 'RWF',
    method: 'MOMO',
    status: PAYMENT_STATUS.PAID,
    dueDate: daysAgo(1),
    paidAt: daysAgo(1),
    createdAt: daysAgo(1),
  },
];

const ensureSeeded = (key, seed) => {
  const existing = readStore(key);
  if (existing === null) {
    writeStore(key, seed);
    return seed;
  }
  return existing;
};

const withComputedStatus = (payment) => ({
  ...payment,
  status: payment.status === PAYMENT_STATUS.PENDING && new Date(payment.dueDate) < new Date()
    ? PAYMENT_STATUS.OVERDUE
    : payment.status,
});

class SubscriptionService {
  // ── Subscriptions ─────────────────────────────────────
  async getAllSubscriptions({ status = '' } = {}) {
    await delay();
    let records = ensureSeeded(SUBS_KEY, SEED_SUBSCRIPTIONS);
    if (status) records = records.filter((s) => s.status === status);
    return [...records].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async createSubscription(data) {
    await delay();
    const records = ensureSeeded(SUBS_KEY, SEED_SUBSCRIPTIONS);
    const sub = {
      id: genId(),
      companyId: data.companyId,
      planId: data.planId,
      status: data.status || SUBSCRIPTION_STATUS.ACTIVE,
      startDate: data.startDate || new Date().toISOString(),
      endDate: data.endDate,
      autoRenew: !!data.autoRenew,
      createdAt: new Date().toISOString(),
    };
    records.unshift(sub);
    writeStore(SUBS_KEY, records);
    return sub;
  }

  async updateSubscription(id, data) {
    await delay();
    const records = ensureSeeded(SUBS_KEY, SEED_SUBSCRIPTIONS);
    const idx = records.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Subscription not found');
    records[idx] = { ...records[idx], ...data };
    writeStore(SUBS_KEY, records);
    return records[idx];
  }

  async cancelSubscription(id) {
    return this.updateSubscription(id, { status: SUBSCRIPTION_STATUS.CANCELLED, autoRenew: false });
  }

  async renewSubscription(id, extendDays = 30) {
    await delay();
    const records = ensureSeeded(SUBS_KEY, SEED_SUBSCRIPTIONS);
    const idx = records.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Subscription not found');
    const base = new Date(records[idx].endDate) > new Date() ? new Date(records[idx].endDate) : new Date();
    base.setDate(base.getDate() + extendDays);
    records[idx] = { ...records[idx], status: SUBSCRIPTION_STATUS.ACTIVE, endDate: base.toISOString() };
    writeStore(SUBS_KEY, records);
    return records[idx];
  }

  // ── Payments / Invoices ───────────────────────────────
  async getAllPayments({ status = '' } = {}) {
    await delay();
    let records = ensureSeeded(PAYMENTS_KEY, SEED_PAYMENTS).map(withComputedStatus);
    if (status) records = records.filter((p) => p.status === status);
    return [...records].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async createInvoice(data) {
    await delay();
    const records = ensureSeeded(PAYMENTS_KEY, SEED_PAYMENTS);
    const invoice = {
      id: genId(),
      subscriptionId: data.subscriptionId,
      companyId: data.companyId,
      invoiceNumber: data.invoiceNumber || `INV-${String(records.length + 1).padStart(4, '0')}`,
      amount: Number(data.amount) || 0,
      currency: data.currency || 'RWF',
      method: data.method || 'MOMO',
      status: PAYMENT_STATUS.PENDING,
      dueDate: data.dueDate,
      paidAt: null,
      createdAt: new Date().toISOString(),
    };
    records.unshift(invoice);
    writeStore(PAYMENTS_KEY, records);
    return invoice;
  }

  async recordPayment(id, method) {
    await delay();
    const records = ensureSeeded(PAYMENTS_KEY, SEED_PAYMENTS);
    const idx = records.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Invoice not found');
    records[idx] = {
      ...records[idx],
      status: PAYMENT_STATUS.PAID,
      paidAt: new Date().toISOString(),
      ...(method ? { method } : {}),
    };
    writeStore(PAYMENTS_KEY, records);
    return records[idx];
  }

  async getBillingStats() {
    await delay(150);
    const subs = ensureSeeded(SUBS_KEY, SEED_SUBSCRIPTIONS);
    const payments = ensureSeeded(PAYMENTS_KEY, SEED_PAYMENTS).map(withComputedStatus);
    const activeSubs = subs.filter((s) => s.status === SUBSCRIPTION_STATUS.ACTIVE);
    const overdue = payments.filter((p) => p.status === PAYMENT_STATUS.OVERDUE);
    const expiringSoon = activeSubs.filter((s) => {
      const days = (new Date(s.endDate) - new Date()) / (1000 * 60 * 60 * 24);
      return days >= 0 && days <= 7;
    });
    return {
      activeSubscriptions: activeSubs.length,
      overdueCount: overdue.length,
      expiringSoonCount: expiringSoon.length,
      totalCollected: payments.filter((p) => p.status === PAYMENT_STATUS.PAID).reduce((sum, p) => sum + p.amount, 0),
    };
  }
}

const subscriptionService = new SubscriptionService();
export default subscriptionService;
