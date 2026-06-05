const now = new Date();

export const mockClients = [
  { id: "c1", companyName: "Acme Corp", contactPerson: "Sarah Johnson", email: "sarah@acmecorp.com", phone: "+1 555-0101", status: "ACTIVE" as const, createdAt: now, updatedAt: now, _count: { projects: 1, notes: 1 } },
  { id: "c2", companyName: "TechFlow Solutions", contactPerson: "Michael Chen", email: "michael@techflow.io", phone: "+1 555-0102", status: "ACTIVE" as const, createdAt: now, updatedAt: now, _count: { projects: 1, notes: 0 } },
  { id: "c3", companyName: "GreenLeaf Retail", contactPerson: "Emma Williams", email: "emma@greenleaf.com", phone: null, status: "PROSPECT" as const, createdAt: now, updatedAt: now, _count: { projects: 1, notes: 0 } },
  { id: "c4", companyName: "Nova Digital", contactPerson: "James Park", email: "james@novadigital.com", phone: null, status: "LEAD" as const, createdAt: now, updatedAt: now, _count: { projects: 0, notes: 0 } },
  { id: "c5", companyName: "Summit Logistics", contactPerson: "Lisa Brown", email: "lisa@summitlog.com", phone: null, status: "INACTIVE" as const, createdAt: now, updatedAt: now, _count: { projects: 1, notes: 0 } },
];

export const mockLeads = [
  { id: "l1", name: "David Miller", company: "StartupXYZ", email: "david@startupxyz.com", phone: null, source: "Referral", stage: "NEW" as const, notes: null, clientId: null, createdAt: now, updatedAt: now, client: null },
  { id: "l2", name: "Anna Kowalski", company: "PolskaTech", email: "anna@polskatech.pl", phone: null, source: "LinkedIn", stage: "CONTACTED" as const, notes: null, clientId: null, createdAt: now, updatedAt: now, client: null },
  { id: "l3", name: "Robert Kim", company: "Kim Ventures", email: null, phone: null, source: "Website", stage: "MEETING_SCHEDULED" as const, notes: null, clientId: null, createdAt: now, updatedAt: now, client: null },
  { id: "l4", name: "Sophie Laurent", company: "Paris Design Co", email: "sophie@parisdesign.fr", phone: null, source: "Conference", stage: "PROPOSAL_SENT" as const, notes: null, clientId: null, createdAt: now, updatedAt: now, client: null },
  { id: "l5", name: "Tom Anderson", company: "Anderson Group", email: null, phone: null, source: null, stage: "NEGOTIATION" as const, notes: null, clientId: null, createdAt: now, updatedAt: now, client: null },
  { id: "l6", name: "Maria Garcia", company: "Garcia Holdings", email: null, phone: null, source: null, stage: "WON" as const, notes: null, clientId: "c1", createdAt: now, updatedAt: now, client: { companyName: "Acme Corp" } },
];

export const mockProjects = [
  { id: "p1", name: "Acme E-Commerce Platform", description: null, clientId: "c1", status: "ACTIVE" as const, budget: 45000, deadline: new Date(now.getFullYear(), now.getMonth() + 2, 15), createdAt: now, updatedAt: now, client: { companyName: "Acme Corp" }, _count: { tasks: 4, members: 2 } },
  { id: "p2", name: "TechFlow Dashboard", description: null, clientId: "c2", status: "ACTIVE" as const, budget: 28000, deadline: new Date(now.getFullYear(), now.getMonth() + 1, 30), createdAt: now, updatedAt: now, client: { companyName: "TechFlow Solutions" }, _count: { tasks: 2, members: 1 } },
  { id: "p3", name: "GreenLeaf Mobile App", description: null, clientId: "c3", status: "PLANNING" as const, budget: 35000, deadline: new Date(now.getFullYear(), now.getMonth() + 4, 1), createdAt: now, updatedAt: now, client: { companyName: "GreenLeaf Retail" }, _count: { tasks: 1, members: 0 } },
  { id: "p4", name: "Summit API Integration", description: null, clientId: "c5", status: "COMPLETED" as const, budget: 12000, deadline: new Date(now.getFullYear() - 1, 9, 1), createdAt: now, updatedAt: now, client: { companyName: "Summit Logistics" }, _count: { tasks: 0, members: 1 } },
];

export const mockTasks = [
  { id: "t1", title: "Design product listing page", priority: "HIGH" as const, status: "IN_PROGRESS" as const, dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5), project: { name: "Acme E-Commerce Platform" }, assignee: { name: "Alex Rivera" } },
  { id: "t2", title: "Implement checkout flow", priority: "CRITICAL" as const, status: "TODO" as const, dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10), project: { name: "Acme E-Commerce Platform" }, assignee: null },
  { id: "t3", title: "Build analytics charts", priority: "HIGH" as const, status: "IN_PROGRESS" as const, dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7), project: { name: "TechFlow Dashboard" }, assignee: { name: "Alex Rivera" } },
  { id: "t4", title: "API endpoint documentation", priority: "MEDIUM" as const, status: "REVIEW" as const, dueDate: null, project: { name: "TechFlow Dashboard" }, assignee: null },
  { id: "t5", title: "Wireframe mobile screens", priority: "MEDIUM" as const, status: "TODO" as const, dueDate: null, project: { name: "GreenLeaf Mobile App" }, assignee: null },
  { id: "t6", title: "Set up CI/CD pipeline", priority: "HIGH" as const, status: "DONE" as const, dueDate: null, project: { name: "Acme E-Commerce Platform" }, assignee: { name: "Alex Rivera" } },
  { id: "t7", title: "Client onboarding docs", priority: "LOW" as const, status: "DONE" as const, dueDate: null, project: null, assignee: null },
  { id: "t8", title: "Security audit review", priority: "CRITICAL" as const, status: "TODO" as const, dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3), project: { name: "Acme E-Commerce Platform" }, assignee: null },
];

export const mockPeople = [
  { id: "pe1", fullName: "Alex Rivera", email: "alex@build8.com", position: "Senior Developer", status: "ACTIVE" as const, yearsExperience: 6, currentSalary: 85000, skills: [] },
  { id: "pe2", fullName: "Jordan Lee", email: "jordan@build8.com", position: "UI/UX Designer", status: "ACTIVE" as const, yearsExperience: 4, currentSalary: 72000, skills: [] },
  { id: "pe3", fullName: "Sam Patel", email: "sam@build8.com", position: "Project Manager", status: "ACTIVE" as const, yearsExperience: 8, currentSalary: 90000, skills: [] },
  { id: "pe4", fullName: "Chris Morgan", email: "chris@freelance.dev", position: "Backend Developer", status: "FREELANCER" as const, yearsExperience: 5, currentSalary: null, skills: [] },
  { id: "pe5", fullName: "Taylor Brooks", email: "taylor@former.com", position: "Junior Developer", status: "FORMER_MEMBER" as const, yearsExperience: 2, currentSalary: null, skills: [] },
];

export const mockCandidates = [
  { id: "ca1", stage: "NEW" as const, experienceLevel: "Mid", interviewNotes: "Strong portfolio", testResults: null, person: { fullName: "Nina Hoffmann", position: "Full Stack Developer" } },
  { id: "ca2", stage: "INTERVIEW" as const, experienceLevel: "Mid", interviewNotes: null, testResults: "Passed coding challenge", person: { fullName: "Omar Hassan", position: "React Developer" } },
  { id: "ca3", stage: "TECHNICAL_TEST" as const, experienceLevel: "Senior", interviewNotes: null, testResults: null, person: { fullName: "Priya Sharma", position: "Product Designer" } },
  { id: "ca4", stage: "ACCEPTED" as const, experienceLevel: "Senior", interviewNotes: "Excellent system design skills", testResults: null, person: { fullName: "Lucas Ferreira", position: "DevOps Engineer" } },
];

export const mockRevenues = [
  { id: "r1", amount: 10500, date: new Date(now.getFullYear(), now.getMonth(), 15), description: "Milestone payment", paymentMethod: "BANK_TRANSFER" as const, client: { companyName: "Acme Corp" }, project: { name: "Acme E-Commerce Platform" } },
  { id: "r2", amount: 6500, date: new Date(now.getFullYear(), now.getMonth(), 20), description: null, paymentMethod: "BANK_TRANSFER" as const, client: { companyName: "TechFlow Solutions" }, project: { name: "TechFlow Dashboard" } },
  { id: "r3", amount: 16500, date: new Date(now.getFullYear(), now.getMonth() - 1, 10), description: "Phase 1 payment", paymentMethod: "BANK_TRANSFER" as const, client: { companyName: "Acme Corp" }, project: { name: "Acme E-Commerce Platform" } },
];

export const mockExpenses = [
  { id: "e1", category: "SOFTWARE" as const, amount: 299, date: new Date(now.getFullYear(), now.getMonth(), 1), description: "Figma Team plan" },
  { id: "e2", category: "HOSTING" as const, amount: 150, date: new Date(now.getFullYear(), now.getMonth(), 1), description: "Vercel Pro" },
  { id: "e3", category: "SALARIES" as const, amount: 15000, date: new Date(now.getFullYear(), now.getMonth(), 1), description: "Monthly payroll" },
  { id: "e4", category: "MARKETING" as const, amount: 500, date: new Date(now.getFullYear(), now.getMonth() - 1, 10), description: "LinkedIn ads" },
];

export const mockQuotations = [
  { id: "q1", number: `QUO-${now.getFullYear()}-0001`, title: "GreenLeaf Mobile App Proposal", total: 38500, status: "SENT" as const, validUntil: new Date(now.getFullYear(), now.getMonth() + 1, 1), client: { companyName: "GreenLeaf Retail" }, _count: { items: 3 } },
  { id: "q2", number: `QUO-${now.getFullYear()}-0002`, title: "Nova Digital Website Redesign", total: 19800, status: "DRAFT" as const, validUntil: null, client: { companyName: "Nova Digital" }, _count: { items: 2 } },
];

export const mockInvoices = [
  { id: "i1", number: `INV-${now.getFullYear()}-0001`, total: 16500, status: "PAID" as const, dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 15), paidAt: new Date(now.getFullYear(), now.getMonth() - 1, 10), client: { companyName: "Acme Corp" }, _count: { items: 1 } },
  { id: "i2", number: `INV-${now.getFullYear()}-0002`, total: 11000, status: "SENT" as const, dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14), paidAt: null, client: { companyName: "TechFlow Solutions" }, _count: { items: 1 } },
  { id: "i3", number: `INV-${now.getFullYear()}-0003`, total: 8800, status: "OVERDUE" as const, dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 1), paidAt: null, client: { companyName: "Acme Corp" }, _count: { items: 1 } },
];

export const mockDocuments = [
  { id: "d1", name: "Acme Corp - Service Agreement.pdf", category: "CONTRACT" as const, folderPath: "/contracts", createdAt: now, client: { companyName: "Acme Corp" }, project: null, uploader: { name: "Youssef" } },
  { id: "d2", name: "TechFlow - NDA.pdf", category: "CONTRACT" as const, folderPath: "/contracts", createdAt: now, client: { companyName: "TechFlow Solutions" }, project: null, uploader: { name: "Youssef" } },
  { id: "d3", name: "E-Commerce Wireframes.fig", category: "PROJECT_FILE" as const, folderPath: "/projects/acme", createdAt: now, client: { companyName: "Acme Corp" }, project: { name: "Acme E-Commerce Platform" }, uploader: { name: "Youssef" } },
  { id: "d4", name: "Build8 Employee Handbook.pdf", category: "TEAM_DOCUMENT" as const, folderPath: "/team", createdAt: now, client: null, project: null, uploader: { name: "Youssef" } },
  { id: "d5", name: "Nina Hoffmann - CV.pdf", category: "CANDIDATE_CV" as const, folderPath: "/candidates", createdAt: now, client: null, project: null, uploader: { name: "Youssef" } },
];

export const mockActivities = [
  { id: "a1", type: "CLIENT_CREATED" as const, title: "New client: Acme Corp", description: null, createdAt: new Date(now.getTime() - 3600000) },
  { id: "a2", type: "PROJECT_CREATED" as const, title: "New project: Acme E-Commerce Platform", description: null, createdAt: new Date(now.getTime() - 7200000) },
  { id: "a3", type: "PAYMENT_RECEIVED" as const, title: "Payment received: $16,500 from Acme Corp", description: null, createdAt: new Date(now.getTime() - 86400000) },
  { id: "a4", type: "CANDIDATE_ADDED" as const, title: "New candidate: Nina Hoffmann", description: null, createdAt: new Date(now.getTime() - 172800000) },
  { id: "a5", type: "TEAM_MEMBER_ADDED" as const, title: "New team member: Alex Rivera", description: null, createdAt: new Date(now.getTime() - 259200000) },
];

export const mockDashboardStats = {
  totalRevenue: 87500,
  totalExpenses: 15949,
  netProfit: 71551,
  totalClients: 2,
  activeProjects: 2,
  pendingTasks: 5,
  teamMembers: 3,
  candidatesCount: 4,
  founderEarnings: { youssef: 21465.3, saif: 21465.3, youssefName: "Youssef", saifName: "Saif", companyReserve: 28620.4 },
};

export function mockMonthlyFinancialData() {
  return Array.from({ length: 6 }, (_, i) => {
    const month = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const revenue = 12000 + i * 1500;
    const expenses = 8000 + i * 400;
    return {
      month: month.toLocaleString("en-US", { month: "short" }),
      revenue,
      expenses,
      profit: revenue - expenses,
    };
  });
}
