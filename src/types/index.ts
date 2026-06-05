export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalClients: number;
  activeProjects: number;
  pendingTasks: number;
  teamMembers: number;
  candidatesCount: number;
  founderEarnings: {
    youssef: number;
    saif: number;
    youssefName: string;
    saifName: string;
    companyReserve: number;
  };
}
