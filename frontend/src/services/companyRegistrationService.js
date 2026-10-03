// Frontend-only mock service (localStorage-backed) for company/business
// registrations onto Abydash. No backend endpoint exists yet — this mirrors
// the shape/async pattern of the other services so it can be swapped for
// real API calls later without touching the pages that consume it.

const STORAGE_KEY = 'abytech_company_registrations';

export const BUSINESS_TYPES = [
  'Restaurant',
  'Supermarket',
  'Shop',
  'Hotel',
  'Bar',
  'Lounge',
  'Other',
];

export const EMPLOYEE_RANGES = ['1 - 5', '6 - 20', '21 - 50', '51 - 200', '200+'];

export const HEAR_ABOUT_OPTIONS = [
  'Social Media',
  'Referral from another business',
  'Google Search',
  'Event / Conference',
  'Sales Outreach',
  'Other',
];

export const MODULES = [
  { key: 'order-management', label: 'Order Management' },
  { key: 'menu-management', label: 'Menu Management' },
  { key: 'stock-management', label: 'Stock / Inventory' },
  { key: 'payroll', label: 'Payroll' },
  { key: 'finance', label: 'Finance' },
  { key: 'hr-leave', label: 'HR & Leave' },
  { key: 'procurement', label: 'Procurement' },
  { key: 'delivery', label: 'Delivery' },
  { key: 'loyalty', label: 'Loyalty & Rewards' },
  { key: 'reservations', label: 'Reservations' },
  { key: 'pos', label: 'POS' },
  { key: 'reports', label: 'Reports & Analytics' },
];

export const STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

const genId = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : `reg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const readAll = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeAll = (records) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

const hoursAgo = (n) => new Date(Date.now() - 1000 * 60 * 60 * n).toISOString();
const daysAgoIso = (n) => new Date(Date.now() - 1000 * 60 * 60 * 24 * n).toISOString();

const SEED_DATA = [
  {
    id: genId(),
    status: STATUS.PENDING,
    submittedAt: hoursAgo(6),
    reviewedAt: null,
    reviewedBy: null,
    rejectionReason: null,
    reviewNotes: null,
    businessName: 'Kigali Bites Restaurant',
    businessType: 'Restaurant',
    businessTypeOther: '',
    address: 'KG 11 Ave, Kimihurura',
    city: 'Kigali',
    country: 'Rwanda',
    numberOfBranches: '2',
    numberOfEmployees: '21 - 50',
    website: '',
    contactName: 'Aline Uwase',
    contactRole: 'Owner',
    email: 'aline.uwase@kigalibites.rw',
    phone: '+250 788 111 222',
    interestedModules: ['order-management', 'menu-management', 'stock-management', 'reports'],
    currentSystem: 'Paper receipts and a WhatsApp group for orders',
    reasonForInterest: 'We are opening a second branch and need one system to track orders and stock across both locations in real time.',
    hearAboutUs: 'Referral from another business',
    additionalNotes: '',
  },
  {
    id: genId(),
    status: STATUS.PENDING,
    submittedAt: hoursAgo(30),
    reviewedAt: null,
    reviewedBy: null,
    rejectionReason: null,
    reviewNotes: null,
    businessName: 'Mega Fresh Supermarket',
    businessType: 'Supermarket',
    businessTypeOther: '',
    address: 'KN 4 Rd, Nyarugenge',
    city: 'Kigali',
    country: 'Rwanda',
    numberOfBranches: '1',
    numberOfEmployees: '51 - 200',
    website: 'https://megafresh.example.com',
    contactName: 'Eric Habimana',
    contactRole: 'General Manager',
    email: 'eric@megafresh.example.com',
    phone: '+250 788 333 444',
    interestedModules: ['stock-management', 'procurement', 'finance', 'payroll', 'reports'],
    currentSystem: 'Excel spreadsheets',
    reasonForInterest: 'Our stock counts keep going out of sync between the warehouse and the shop floor, we need proper inventory control.',
    hearAboutUs: 'Google Search',
    additionalNotes: 'Would like a demo before committing to a plan.',
  },
  {
    id: genId(),
    status: STATUS.PENDING,
    submittedAt: hoursAgo(50),
    reviewedAt: null,
    reviewedBy: null,
    rejectionReason: null,
    reviewNotes: null,
    businessName: 'Golden Spoon Diner',
    businessType: 'Restaurant',
    businessTypeOther: '',
    address: 'NR3, Muhanga Town',
    city: 'Muhanga',
    country: 'Rwanda',
    numberOfBranches: '1',
    numberOfEmployees: '6 - 20',
    website: '',
    contactName: 'Claudine Mukamurenzi',
    contactRole: 'Owner',
    email: 'claudine@goldenspoon.rw',
    phone: '+250 788 909 111',
    interestedModules: ['order-management', 'pos', 'menu-management'],
    currentSystem: 'A cash register with handwritten tickets',
    reasonForInterest: 'We need a proper POS at the counter and a simple menu system for our new location outside Kigali.',
    hearAboutUs: 'Social Media',
    additionalNotes: '',
  },
  {
    id: genId(),
    status: STATUS.PENDING,
    submittedAt: hoursAgo(72),
    reviewedAt: null,
    reviewedBy: null,
    rejectionReason: null,
    reviewNotes: null,
    businessName: 'Cloud Nine Rooftop Bar',
    businessType: 'Bar',
    businessTypeOther: '',
    address: 'KG 9 Ave, Kiyovu',
    city: 'Kigali',
    country: 'Rwanda',
    numberOfBranches: '1',
    numberOfEmployees: '6 - 20',
    website: 'https://cloudninekigali.example.com',
    contactName: 'Yves Mugisha',
    contactRole: 'Operations Manager',
    email: 'yves@cloudnine.rw',
    phone: '+250 788 404 505',
    interestedModules: ['order-management', 'pos', 'reservations'],
    currentSystem: 'A tablet-based POS that keeps crashing',
    reasonForInterest: 'Our current POS vendor shut down support — we need a reliable replacement before the holiday season.',
    hearAboutUs: 'Sales Outreach',
    additionalNotes: 'Urgent — would like to be onboarded within two weeks.',
  },
  {
    id: genId(),
    status: STATUS.APPROVED,
    submittedAt: daysAgoIso(5),
    reviewedAt: daysAgoIso(4),
    reviewedBy: 'Admin User',
    rejectionReason: null,
    reviewNotes: 'Verified business registration certificate over email. Onboarded manually.',
    businessName: 'Sunset Lounge & Bar',
    businessType: 'Lounge',
    businessTypeOther: '',
    address: 'KG 7 Ave, Kacyiru',
    city: 'Kigali',
    country: 'Rwanda',
    numberOfBranches: '1',
    numberOfEmployees: '6 - 20',
    website: '',
    contactName: 'Patrick Nshuti',
    contactRole: 'Manager',
    email: 'patrick@sunsetlounge.rw',
    phone: '+250 788 555 666',
    interestedModules: ['order-management', 'pos', 'reservations', 'loyalty'],
    currentSystem: 'A basic POS with no reporting',
    reasonForInterest: 'We want table service tracking and a loyalty program to bring regulars back.',
    hearAboutUs: 'Event / Conference',
    additionalNotes: '',
  },
  {
    id: genId(),
    status: STATUS.APPROVED,
    submittedAt: daysAgoIso(14),
    reviewedAt: daysAgoIso(13),
    reviewedBy: 'Admin User',
    rejectionReason: null,
    reviewNotes: 'Long-standing hospitality client, fast-tracked approval.',
    businessName: 'GreenLeaf Hotel',
    businessType: 'Hotel',
    businessTypeOther: '',
    address: 'KG 2 Roundabout',
    city: 'Kigali',
    country: 'Rwanda',
    numberOfBranches: '1',
    numberOfEmployees: '51 - 200',
    website: 'https://greenleafhotel.example.com',
    contactName: 'Diane Mukamana',
    contactRole: 'General Manager',
    email: 'diane@greenleafhotel.rw',
    phone: '+250 788 222 999',
    interestedModules: ['reservations', 'finance', 'hr-leave', 'reports'],
    currentSystem: 'A legacy hotel management system with no support contract',
    reasonForInterest: 'Our old PMS vendor is discontinuing support — we need reservations, finance and HR in one place.',
    hearAboutUs: 'Referral from another business',
    additionalNotes: '',
  },
  {
    id: genId(),
    status: STATUS.REJECTED,
    submittedAt: daysAgoIso(9),
    reviewedAt: daysAgoIso(8),
    reviewedBy: 'Admin User',
    rejectionReason: 'Could not verify a physical business address, follow up requested but no response after two attempts.',
    reviewNotes: null,
    businessName: 'QuickStop Shop',
    businessType: 'Shop',
    businessTypeOther: '',
    address: 'Unknown',
    city: 'Musanze',
    country: 'Rwanda',
    numberOfBranches: '1',
    numberOfEmployees: '1 - 5',
    website: '',
    contactName: 'Jean Claude',
    contactRole: 'Owner',
    email: 'jc.quickstop@example.com',
    phone: '+250 788 777 888',
    interestedModules: ['order-management'],
    currentSystem: 'Notebook',
    reasonForInterest: 'Want a simple sales tracker.',
    hearAboutUs: 'Social Media',
    additionalNotes: '',
  },
  {
    id: genId(),
    status: STATUS.REJECTED,
    submittedAt: daysAgoIso(20),
    reviewedAt: daysAgoIso(18),
    reviewedBy: 'Admin User',
    rejectionReason: 'Duplicate application — this business already has an active Abydash account under a different contact.',
    reviewNotes: null,
    businessName: 'Rubavu Lakeside Bar',
    businessType: 'Bar',
    businessTypeOther: '',
    address: 'Lake Kivu Rd',
    city: 'Rubavu',
    country: 'Rwanda',
    numberOfBranches: '1',
    numberOfEmployees: '1 - 5',
    website: '',
    contactName: 'Emmanuel Ndayisenga',
    contactRole: 'Manager',
    email: 'emmanuel@lakesidebar.rw',
    phone: '+250 788 121 314',
    interestedModules: ['order-management', 'pos'],
    currentSystem: 'None',
    reasonForInterest: 'Need to track drink sales.',
    hearAboutUs: 'Other',
    additionalNotes: '',
  },
  {
    id: genId(),
    status: STATUS.PENDING,
    submittedAt: hoursAgo(2),
    reviewedAt: null,
    reviewedBy: null,
    rejectionReason: null,
    reviewNotes: null,
    businessName: 'Byumba Fresh Market',
    businessType: 'Supermarket',
    businessTypeOther: '',
    address: 'RN2, Byumba Town',
    city: 'Gicumbi',
    country: 'Rwanda',
    numberOfBranches: '1',
    numberOfEmployees: '21 - 50',
    website: '',
    contactName: 'Chantal Nyirasafari',
    contactRole: 'Owner',
    email: 'chantal@byumbamarket.rw',
    phone: '+250 788 232 343',
    interestedModules: ['order-management', 'stock-management', 'reports'],
    currentSystem: 'A basic cash register',
    reasonForInterest: 'We are expanding our produce section and need stock tracking to avoid waste.',
    hearAboutUs: 'Google Search',
    additionalNotes: '',
  },
  {
    id: genId(),
    status: STATUS.PENDING,
    submittedAt: hoursAgo(15),
    reviewedAt: null,
    reviewedBy: null,
    rejectionReason: null,
    reviewNotes: null,
    businessName: 'Nyanza Palace Hotel',
    businessType: 'Hotel',
    businessTypeOther: '',
    address: 'Palace Rd, Nyanza',
    city: 'Nyanza',
    country: 'Rwanda',
    numberOfBranches: '1',
    numberOfEmployees: '21 - 50',
    website: 'https://nyanzapalace.example.com',
    contactName: 'Frank Rugamba',
    contactRole: 'General Manager',
    email: 'frank@nyanzapalace.rw',
    phone: '+250 788 454 565',
    interestedModules: ['reservations', 'finance', 'reports'],
    currentSystem: 'Paper booking ledger',
    reasonForInterest: 'Guests keep double-booking rooms because our ledger is not shared between the front desk shifts.',
    hearAboutUs: 'Referral from another business',
    additionalNotes: '',
  },
  {
    id: genId(),
    status: STATUS.PENDING,
    submittedAt: hoursAgo(40),
    reviewedAt: null,
    reviewedBy: null,
    rejectionReason: null,
    reviewNotes: null,
    businessName: 'Kicukiro Grill & Chill',
    businessType: 'Restaurant',
    businessTypeOther: '',
    address: 'KK 15 Ave, Kicukiro',
    city: 'Kigali',
    country: 'Rwanda',
    numberOfBranches: '1',
    numberOfEmployees: '6 - 20',
    website: '',
    contactName: 'Moses Byiringiro',
    contactRole: 'Owner',
    email: 'moses@grillandchill.rw',
    phone: '+250 788 565 676',
    interestedModules: ['order-management', 'pos', 'menu-management'],
    currentSystem: 'A cash box',
    reasonForInterest: 'Want to move off cash-only and start accepting mobile money at the counter with proper receipts.',
    hearAboutUs: 'Social Media',
    additionalNotes: '',
  },
  {
    id: genId(),
    status: STATUS.PENDING,
    submittedAt: daysAgoIso(2),
    reviewedAt: null,
    reviewedBy: null,
    rejectionReason: null,
    reviewNotes: null,
    businessName: 'Gisenyi Beach Bar',
    businessType: 'Bar',
    businessTypeOther: '',
    address: 'Beach Rd, Gisenyi',
    city: 'Rubavu',
    country: 'Rwanda',
    numberOfBranches: '1',
    numberOfEmployees: '6 - 20',
    website: '',
    contactName: 'Herve Nsanzimana',
    contactRole: 'Manager',
    email: 'herve@gisenyibeachbar.rw',
    phone: '+250 788 676 787',
    interestedModules: ['order-management', 'pos', 'reservations'],
    currentSystem: 'None',
    reasonForInterest: 'Busy weekends need faster order taking and a way to reserve beachfront tables.',
    hearAboutUs: 'Event / Conference',
    additionalNotes: '',
  },
  {
    id: genId(),
    status: STATUS.APPROVED,
    submittedAt: daysAgoIso(25),
    reviewedAt: daysAgoIso(24),
    reviewedBy: 'Admin User',
    rejectionReason: null,
    reviewNotes: 'Approved after a short onboarding call.',
    businessName: 'Kigali Convention Suites',
    businessType: 'Hotel',
    businessTypeOther: '',
    address: 'KG 15 Ave, Kimihurura',
    city: 'Kigali',
    country: 'Rwanda',
    numberOfBranches: '1',
    numberOfEmployees: '51 - 200',
    website: 'https://kigaliconventionsuites.example.com',
    contactName: 'Esperance Mukandayisenga',
    contactRole: 'Operations Director',
    email: 'esperance@convsuites.rw',
    phone: '+250 788 787 898',
    interestedModules: ['reservations', 'finance', 'hr-leave', 'payroll', 'reports'],
    currentSystem: 'A property management system without local support',
    reasonForInterest: 'We need a locally-supported platform ahead of the conference season.',
    hearAboutUs: 'Sales Outreach',
    additionalNotes: '',
  },
  {
    id: genId(),
    status: STATUS.APPROVED,
    submittedAt: daysAgoIso(32),
    reviewedAt: daysAgoIso(30),
    reviewedBy: 'Admin User',
    rejectionReason: null,
    reviewNotes: null,
    businessName: 'Nyarutarama Fine Dining',
    businessType: 'Restaurant',
    businessTypeOther: '',
    address: 'KG 9 Ave, Nyarutarama',
    city: 'Kigali',
    country: 'Rwanda',
    numberOfBranches: '1',
    numberOfEmployees: '21 - 50',
    website: '',
    contactName: 'Liliane Ishimwe',
    contactRole: 'Owner',
    email: 'liliane@nyarutaramadining.rw',
    phone: '+250 788 898 909',
    interestedModules: ['order-management', 'pos', 'menu-management', 'reports'],
    currentSystem: 'A dated POS with no menu editor',
    reasonForInterest: 'Our seasonal menu changes constantly and our current system makes updates painful.',
    hearAboutUs: 'Referral from another business',
    additionalNotes: '',
  },
  {
    id: genId(),
    status: STATUS.REJECTED,
    submittedAt: daysAgoIso(28),
    reviewedAt: daysAgoIso(26),
    reviewedBy: 'Admin User',
    rejectionReason: 'Incomplete business documentation submitted — no valid trading licence provided after two reminders.',
    reviewNotes: null,
    businessName: 'Bugesera Budget Shop',
    businessType: 'Shop',
    businessTypeOther: '',
    address: 'Nyamata Town',
    city: 'Bugesera',
    country: 'Rwanda',
    numberOfBranches: '1',
    numberOfEmployees: '1 - 5',
    website: '',
    contactName: 'Ange Mutesi',
    contactRole: 'Owner',
    email: 'ange@bugeserashop.rw',
    phone: '+250 788 909 010',
    interestedModules: ['order-management'],
    currentSystem: 'Notebook',
    reasonForInterest: 'Want basic sales tracking.',
    hearAboutUs: 'Social Media',
    additionalNotes: '',
  },
  {
    id: genId(),
    status: STATUS.REJECTED,
    submittedAt: daysAgoIso(15),
    reviewedAt: daysAgoIso(13),
    reviewedBy: 'Admin User',
    rejectionReason: 'Applicant did not respond to our request for an age-verification and licensing policy for a nightlife venue.',
    reviewNotes: null,
    businessName: 'Musanze Nightclub Lounge',
    businessType: 'Lounge',
    businessTypeOther: '',
    address: 'Musanze Town Centre',
    city: 'Musanze',
    country: 'Rwanda',
    numberOfBranches: '1',
    numberOfEmployees: '6 - 20',
    website: '',
    contactName: 'Bosco Habiyaremye',
    contactRole: 'Manager',
    email: 'bosco@musanzenightclub.rw',
    phone: '+250 788 010 121',
    interestedModules: ['order-management', 'pos'],
    currentSystem: 'None',
    reasonForInterest: 'Track bar sales and entry tickets.',
    hearAboutUs: 'Other',
    additionalNotes: '',
  },
];

const ensureSeeded = () => {
  const existing = readAll();
  if (existing === null) {
    writeAll(SEED_DATA);
    return SEED_DATA;
  }
  return existing;
};

class CompanyRegistrationService {
  // Submit a new registration (public form)
  async submitRegistration(data) {
    await delay();
    const records = ensureSeeded();

    const record = {
      id: genId(),
      status: STATUS.PENDING,
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null,
      rejectionReason: null,
      reviewNotes: null,

      businessName: data.businessName?.trim() || '',
      businessType: data.businessType || '',
      businessTypeOther: data.businessTypeOther?.trim() || '',
      address: data.address?.trim() || '',
      city: data.city?.trim() || '',
      country: data.country?.trim() || '',
      numberOfBranches: data.numberOfBranches || '',
      numberOfEmployees: data.numberOfEmployees || '',
      website: data.website?.trim() || '',

      contactName: data.contactName?.trim() || '',
      contactRole: data.contactRole?.trim() || '',
      email: data.email?.trim() || '',
      phone: data.phone?.trim() || '',

      interestedModules: Array.isArray(data.interestedModules) ? data.interestedModules : [],
      currentSystem: data.currentSystem?.trim() || '',
      reasonForInterest: data.reasonForInterest?.trim() || '',
      hearAboutUs: data.hearAboutUs || '',
      additionalNotes: data.additionalNotes?.trim() || '',
    };

    records.unshift(record);
    writeAll(records);
    return record;
  }

  // List registrations with optional filters (admin)
  async getAllRegistrations({ search = '', status = '', businessType = '' } = {}) {
    await delay();
    let records = ensureSeeded();

    if (status) records = records.filter((r) => r.status === status);
    if (businessType) records = records.filter((r) => r.businessType === businessType);

    if (search) {
      const q = search.toLowerCase();
      records = records.filter((r) =>
        r.businessName.toLowerCase().includes(q) ||
        r.contactName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q)
      );
    }

    records = [...records].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    return records;
  }

  async getStats() {
    await delay(150);
    const records = ensureSeeded();
    return {
      total: records.length,
      pending: records.filter((r) => r.status === STATUS.PENDING).length,
      approved: records.filter((r) => r.status === STATUS.APPROVED).length,
      rejected: records.filter((r) => r.status === STATUS.REJECTED).length,
    };
  }

  async getRegistrationById(id) {
    await delay(150);
    const records = ensureSeeded();
    const record = records.find((r) => r.id === id);
    if (!record) throw new Error('Registration not found');
    return record;
  }

  async approveRegistration(id, { reviewedBy = 'Admin', reviewNotes = '' } = {}) {
    await delay();
    const records = ensureSeeded();
    const idx = records.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Registration not found');

    records[idx] = {
      ...records[idx],
      status: STATUS.APPROVED,
      reviewedAt: new Date().toISOString(),
      reviewedBy,
      reviewNotes: reviewNotes?.trim() || null,
      rejectionReason: null,
    };
    writeAll(records);
    return records[idx];
  }

  async rejectRegistration(id, { reviewedBy = 'Admin', rejectionReason }) {
    await delay();
    if (!rejectionReason?.trim()) throw new Error('A rejection reason is required');
    const records = ensureSeeded();
    const idx = records.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Registration not found');

    records[idx] = {
      ...records[idx],
      status: STATUS.REJECTED,
      reviewedAt: new Date().toISOString(),
      reviewedBy,
      rejectionReason: rejectionReason.trim(),
    };
    writeAll(records);
    return records[idx];
  }

  // Move a reviewed registration back to pending (undo)
  async resetToPending(id) {
    await delay();
    const records = ensureSeeded();
    const idx = records.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Registration not found');

    records[idx] = {
      ...records[idx],
      status: STATUS.PENDING,
      reviewedAt: null,
      reviewedBy: null,
      rejectionReason: null,
      reviewNotes: null,
    };
    writeAll(records);
    return records[idx];
  }

  async deleteRegistration(id) {
    await delay();
    const records = ensureSeeded();
    const next = records.filter((r) => r.id !== id);
    writeAll(next);
    return true;
  }
}

const companyRegistrationService = new CompanyRegistrationService();
export default companyRegistrationService;
