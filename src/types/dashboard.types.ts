// types/dashboard.types.ts
export interface DashboardStats {
  total: number;
  read: number;
  unread: number;
  percentageChange: number;
  recentContacts: number;
  growthRate: number;
}

export interface ChartData {
  date: string;
  total: number;
  read: number;
  unread: number;
}

export interface RecentActivity {
  id: string;
  nome: string;
  email: string;
  subject: string;
  time: string;
  status: "read" | "unread";
}
