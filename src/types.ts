export interface Company {
  id: string;
  name: string;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  budget: number;
  status: 'active' | 'completed';
  company_id?: string;
  split_percentage?: number;
  pu_no?: string;
  invoice_no?: string;
  pu_amount?: number;
  tax_amount?: number;
  created_at: string;
}

export interface Employee {
  id: string;
  project_id: string;
  name: string;
  created_at: string;
}

export interface Salary {
  id: string;
  employee_id: string;
  amount: number;
  date: string;
  type: 'advance' | 'daily';
  created_at: string;
}

export interface Expense {
  id: string;
  project_id: string;
  expense_name: string;
  amount: number;
  date: string;
  receipt_url?: string;
  created_at: string;
}

export interface Reminder {
  id: string;
  project_id: string;
  person_name: string;
  amount: number;
  date: string;
  status: 'pending' | 'received';
  created_at: string;
}

export interface Document {
  id: string;
  project_id: string;
  name: string;
  url: string;
  created_at: string;
}
