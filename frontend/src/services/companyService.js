// Frontend-only mock service (localStorage-backed) for activated tenants
// ("companies"). A company is provisioned the moment an admin approves a
// registration — see createFromRegistration(), called from
// CompanyRegistrationManagement. No backend endpoint exists yet; this
// mirrors the shape/async pattern of the real services so it can be
// swapped for real API calls later.

import { delay, genId, readStore, writeStore, daysAgo } from '../utils/mockStore';

const STORAGE_KEY = 'abytech_companies';

export const COMPANY_STATUS = { ACTIVE: 'ACTIVE', SUSPENDED: 'SUSPENDED' };

const SEED_COMPANIES = [
  {
    id: 'company-seed-1',
    registrationId: null,
    businessName: 'Sunset Lounge & Bar',
    businessType: 'Lounge',
    businessTypeOther: '',
    address: 'KG 7 Ave, Kacyiru',
    city: 'Kigali',
    country: 'Rwanda',
    contactName: 'Patrick Nshuti',
    contactRole: 'Manager',
    email: 'patrick@sunsetlounge.rw',
    phone: '+250 788 555 666',
    status: COMPANY_STATUS.ACTIVE,
    moduleAccess: ['order-management', 'pos', 'reservations', 'loyalty'],
    planId: 'plan-pro',
    createdAt: daysAgo(20),
  },
  {
    id: 'company-seed-2',
    registrationId: null,
    businessName: 'GreenLeaf Hotel',
    businessType: 'Hotel',
    businessTypeOther: '',
    address: 'KG 2 Roundabout',
    city: 'Kigali',
    country: 'Rwanda',
    contactName: 'Diane Mukamana',
    contactRole: 'General Manager',
    email: 'diane@greenleafhotel.rw',
    phone: '+250 788 222 999',
    status: COMPANY_STATUS.ACTIVE,
    moduleAccess: ['reservations', 'finance', 'hr-leave', 'reports'],
    planId: 'plan-enterprise',
    createdAt: daysAgo(50),
  },
  {
    id: 'company-seed-3',
    registrationId: null,
    businessName: 'Capital Mart Kigali',
    businessType: 'Supermarket',
    businessTypeOther: '',
    address: 'KN 78 St, Remera',
    city: 'Kigali',
    country: 'Rwanda',
    contactName: 'Solange Ingabire',
    contactRole: 'Store Manager',
    email: 'solange@capitalmart.rw',
    phone: '+250 788 606 707',
    status: COMPANY_STATUS.ACTIVE,
    moduleAccess: ['order-management', 'stock-management', 'reports'],
    planId: 'plan-starter',
    createdAt: daysAgo(38),
  },
  {
    id: 'company-seed-4',
    registrationId: null,
    businessName: 'Nyamirambo Family Restaurant',
    businessType: 'Restaurant',
    businessTypeOther: '',
    address: 'Nyamirambo, KG 21 Ave',
    city: 'Kigali',
    country: 'Rwanda',
    contactName: 'Olivier Bizimana',
    contactRole: 'Owner',
    email: 'olivier@nyamirambofr.rw',
    phone: '+250 788 808 909',
    status: COMPANY_STATUS.ACTIVE,
    moduleAccess: ['order-management', 'pos', 'menu-management', 'stock-management', 'reports'],
    planId: 'plan-pro',
    createdAt: daysAgo(8),
  },
  {
    id: 'company-seed-5',
    registrationId: null,
    businessName: 'Skyline Business Hotel',
    businessType: 'Hotel',
    businessTypeOther: '',
    address: 'Boulevard de l’Umuganda',
    city: 'Huye',
    country: 'Rwanda',
    contactName: 'Immaculee Uwimana',
    contactRole: 'General Manager',
    email: 'immaculee@skylinehotel.rw',
    phone: '+250 788 505 606',
    status: COMPANY_STATUS.ACTIVE,
    moduleAccess: ['reservations', 'finance', 'hr-leave', 'payroll', 'reports', 'loyalty'],
    planId: 'plan-enterprise',
    createdAt: daysAgo(65),
  },
  {
    id: 'company-seed-6',
    registrationId: null,
    businessName: 'Kivu Breeze Bar & Grill',
    businessType: 'Bar',
    businessTypeOther: '',
    address: 'Lakefront Rd',
    city: 'Rubavu',
    country: 'Rwanda',
    contactName: 'Fabrice Nkurunziza',
    contactRole: 'Manager',
    email: 'fabrice@kivubreeze.rw',
    phone: '+250 788 303 404',
    status: COMPANY_STATUS.ACTIVE,
    moduleAccess: ['order-management', 'pos'],
    planId: null,
    createdAt: daysAgo(3),
  },
  {
    id: 'company-seed-7',
    registrationId: null,
    businessName: 'Downtown Quick Bites',
    businessType: 'Restaurant',
    businessTypeOther: '',
    address: 'KN 2 Ave, Downtown',
    city: 'Kigali',
    country: 'Rwanda',
    contactName: 'Vincent Habyarimana',
    contactRole: 'Owner',
    email: 'vincent@quickbites.rw',
    phone: '+250 788 202 303',
    status: COMPANY_STATUS.SUSPENDED,
    moduleAccess: ['order-management'],
    planId: 'plan-starter',
    createdAt: daysAgo(90),
  },
];

const ensureSeeded = () => {
  const existing = readStore(STORAGE_KEY);
  if (existing === null) {
    writeStore(STORAGE_KEY, SEED_COMPANIES);
    return SEED_COMPANIES;
  }
  return existing;
};

class CompanyService {
  async getAllCompanies({ search = '', status = '' } = {}) {
    await delay();
    let records = ensureSeeded();
    if (status) records = records.filter((c) => c.status === status);
    if (search) {
      const q = search.toLowerCase();
      records = records.filter((c) =>
        c.businessName.toLowerCase().includes(q) ||
        c.contactName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    }
    return [...records].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getCompanyById(id) {
    await delay(150);
    const records = ensureSeeded();
    const record = records.find((c) => c.id === id);
    if (!record) throw new Error('Company not found');
    return record;
  }

  // Called when a registration is approved — provisions the tenant with
  // whatever modules they expressed interest in at sign-up. Idempotent:
  // re-approving the same registration won't create a duplicate company.
  async createFromRegistration(registration) {
    await delay();
    const records = ensureSeeded();
    const already = records.find((c) => c.registrationId === registration.id);
    if (already) return already;

    const company = {
      id: genId(),
      registrationId: registration.id,
      businessName: registration.businessName,
      businessType: registration.businessType,
      businessTypeOther: registration.businessTypeOther,
      address: registration.address,
      city: registration.city,
      country: registration.country,
      contactName: registration.contactName,
      contactRole: registration.contactRole,
      email: registration.email,
      phone: registration.phone,
      status: COMPANY_STATUS.ACTIVE,
      moduleAccess: [...(registration.interestedModules || [])],
      planId: null,
      createdAt: new Date().toISOString(),
    };
    records.unshift(company);
    writeStore(STORAGE_KEY, records);
    return company;
  }

  async updateModuleAccess(id, modules) {
    await delay();
    const records = ensureSeeded();
    const idx = records.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Company not found');
    records[idx] = { ...records[idx], moduleAccess: modules };
    writeStore(STORAGE_KEY, records);
    return records[idx];
  }

  // Assigning a plan just sets which plan a tenant is on — it does not
  // change their module toggles. The plan only caps *how many* modules
  // they may have enabled; updateModuleAccess() enforces that cap.
  async assignPlan(id, planId) {
    await delay();
    const records = ensureSeeded();
    const idx = records.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Company not found');
    records[idx] = { ...records[idx], planId };
    writeStore(STORAGE_KEY, records);
    return records[idx];
  }

  async setStatus(id, status) {
    await delay();
    const records = ensureSeeded();
    const idx = records.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Company not found');
    records[idx] = { ...records[idx], status };
    writeStore(STORAGE_KEY, records);
    return records[idx];
  }
}

const companyService = new CompanyService();
export default companyService;
