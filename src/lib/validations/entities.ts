import { z } from "zod";

const optionalNumber = z.number().optional();

export const leadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  company: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  source: z.string().optional(),
  stage: z.enum(["NEW", "CONTACTED", "MEETING_SCHEDULED", "PROPOSAL_SENT", "NEGOTIATION", "WON", "LOST"]),
  notes: z.string().optional(),
});

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  clientId: z.string().min(1, "Client is required"),
  status: z.enum(["PLANNING", "ACTIVE", "REVIEW", "COMPLETED", "CANCELLED"]),
  budget: optionalNumber,
  startDate: z.string().optional(),
  deadline: z.string().optional(),
});

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]),
  projectId: z.string().optional(),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
});

export const personSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
  position: z.string().optional(),
  status: z.enum(["CANDIDATE", "ACTIVE", "ON_HOLD", "FREELANCER", "FORMER_MEMBER"]),
  yearsExperience: optionalNumber,
  currentSalary: optionalNumber,
  expectedSalary: optionalNumber,
  portfolioUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  githubUrl: z.string().optional(),
});

export const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(1, "Min 1"),
  unitPrice: z.number().min(0, "Min 0"),
});

export const quotationSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  projectId: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  scope: z.string().optional(),
  tax: optionalNumber,
  status: z.enum(["DRAFT", "SENT", "ACCEPTED", "REJECTED"]),
  validUntil: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(lineItemSchema).min(1, "Add at least one line item"),
});

export const invoiceSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  projectId: z.string().optional(),
  tax: optionalNumber,
  status: z.enum(["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"]),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(lineItemSchema).min(1, "Add at least one line item"),
});

export const documentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  fileUrl: z.string().url("Valid file URL is required"),
  category: z.enum(["CONTRACT", "CLIENT_FILE", "PROJECT_FILE", "TEAM_DOCUMENT", "CANDIDATE_CV", "OTHER"]),
  folderPath: z.string().optional(),
  tags: z.string().optional(),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
});

export const candidateSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  position: z.string().optional(),
  yearsExperience: optionalNumber,
  experienceLevel: z.string().optional(),
  cvUrl: z.string().optional(),
  stage: z.enum(["NEW", "CONTACTED", "INTERVIEW", "TECHNICAL_TEST", "ACCEPTED", "REJECTED", "HIRED"]),
  interviewNotes: z.string().optional(),
  testResults: z.string().optional(),
});

export const revenueSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  projectId: z.string().optional(),
  amount: z.number().min(0.01, "Amount is required"),
  date: z.string().min(1, "Date is required"),
  paymentMethod: z.enum(["BANK_TRANSFER", "CASH", "CREDIT_CARD", "PAYPAL", "WISE", "OTHER"]),
  description: z.string().optional(),
  isAdvance: z.boolean().optional(),
});

export const expenseSchema = z.object({
  category: z.enum(["MARKETING", "HOSTING", "DOMAINS", "SOFTWARE", "SALARIES", "OPERATIONS", "OTHER"]),
  amount: z.number().min(0.01, "Amount is required"),
  date: z.string().min(1, "Date is required"),
  description: z.string().optional(),
});

export type LeadFormData = z.infer<typeof leadSchema>;
export type ProjectFormData = z.infer<typeof projectSchema>;
export type TaskFormData = z.infer<typeof taskSchema>;
export type PersonFormData = z.infer<typeof personSchema>;
export type LineItemFormData = z.infer<typeof lineItemSchema>;
export type QuotationFormData = z.infer<typeof quotationSchema>;
export type InvoiceFormData = z.infer<typeof invoiceSchema>;
export type DocumentFormData = z.infer<typeof documentSchema>;
export type CandidateFormData = z.infer<typeof candidateSchema>;
export type RevenueFormData = z.infer<typeof revenueSchema>;
export type ExpenseFormData = z.infer<typeof expenseSchema>;
