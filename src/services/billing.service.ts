import { apiClient, PaginatedResponse } from './api.base';
import type { DateString } from '@/types/common.types';

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  customer_name: string;
  date: DateString;
  due_date: DateString;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  payment_date?: DateString;
  payment_method?: string;
  notes?: string;
  items: InvoiceItem[];
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Expense {
  id: string;
  expense_number: string;
  date: DateString;
  category: ExpenseCategory;
  vendor: string;
  description: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'reimbursed';
  payment_method?: string;
  receipt_url?: string;
  approved_by?: string;
  approved_date?: DateString;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
}

export interface CreateInvoiceDto {
  customer_id: string;
  date: DateString;
  due_date: DateString;
  items: Omit<InvoiceItem, 'id'>[];
  notes?: string;
}

export interface CreateExpenseDto {
  date: DateString;
  category_id: string;
  vendor: string;
  description: string;
  amount: number;
  tax_amount?: number;
  payment_method?: string;
  notes?: string;
}

export interface BillingFilters {
  status?: string;
  date_from?: DateString;
  date_to?: DateString;
  customer_id?: string;
  category_id?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface BillingSummary {
  total_revenue: number;
  pending_revenue: number;
  total_expenses: number;
  net_profit: number;
  revenue_trend: number; // percentage change
  expense_trend: number; // percentage change
  invoice_count: {
    total: number;
    paid: number;
    pending: number;
    overdue: number;
  };
  expense_count: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
}

class BillingService {
  // Invoices
  async getInvoices(filters?: BillingFilters): Promise<PaginatedResponse<Invoice>> {
    const response = await apiClient.get<PaginatedResponse<Invoice>>('/billing/invoices', {
      params: filters,
    });
    return response.data;
  }

  async getInvoice(id: string): Promise<Invoice> {
    const response = await apiClient.get<Invoice>(`/billing/invoices/${id}`);
    return response.data;
  }

  async createInvoice(data: CreateInvoiceDto): Promise<Invoice> {
    const response = await apiClient.post<Invoice>('/billing/invoices', data);
    return response.data;
  }

  async updateInvoice(id: string, data: Partial<CreateInvoiceDto>): Promise<Invoice> {
    const response = await apiClient.patch<Invoice>(`/billing/invoices/${id}`, data);
    return response.data;
  }

  async deleteInvoice(id: string): Promise<void> {
    await apiClient.delete(`/billing/invoices/${id}`);
  }

  async markInvoiceAsPaid(id: string, paymentData: {
    payment_date: DateString;
    payment_method: string;
    amount: number;
  }): Promise<Invoice> {
    const response = await apiClient.post<Invoice>(`/billing/invoices/${id}/payment`, paymentData);
    return response.data;
  }

  async sendInvoice(id: string, recipientEmail?: string): Promise<void> {
    await apiClient.post(`/billing/invoices/${id}/send`, { email: recipientEmail });
  }

  // Expenses
  async getExpenses(filters?: BillingFilters): Promise<PaginatedResponse<Expense>> {
    const response = await apiClient.get<PaginatedResponse<Expense>>('/billing/expenses', {
      params: filters,
    });
    return response.data;
  }

  async getExpense(id: string): Promise<Expense> {
    const response = await apiClient.get<Expense>(`/billing/expenses/${id}`);
    return response.data;
  }

  async createExpense(data: CreateExpenseDto): Promise<Expense> {
    const response = await apiClient.post<Expense>('/billing/expenses', data);
    return response.data;
  }

  async updateExpense(id: string, data: Partial<CreateExpenseDto>): Promise<Expense> {
    const response = await apiClient.patch<Expense>(`/billing/expenses/${id}`, data);
    return response.data;
  }

  async deleteExpense(id: string): Promise<void> {
    await apiClient.delete(`/billing/expenses/${id}`);
  }

  async approveExpense(id: string): Promise<Expense> {
    const response = await apiClient.post<Expense>(`/billing/expenses/${id}/approve`);
    return response.data;
  }

  async rejectExpense(id: string, reason?: string): Promise<Expense> {
    const response = await apiClient.post<Expense>(`/billing/expenses/${id}/reject`, { reason });
    return response.data;
  }

  // Categories
  async getExpenseCategories(): Promise<ExpenseCategory[]> {
    const response = await apiClient.get<{ data: ExpenseCategory[] }>('/billing/expense-categories');
    return response.data.data || response.data;
  }

  async createExpenseCategory(data: { name: string; description?: string }): Promise<ExpenseCategory> {
    const response = await apiClient.post<ExpenseCategory>('/billing/expense-categories', data);
    return response.data;
  }

  // Summary & Reports
  async getBillingSummary(dateRange?: { from: DateString; to: DateString }): Promise<BillingSummary> {
    const response = await apiClient.get<BillingSummary>('/billing/summary', {
      params: dateRange,
    });
    return response.data;
  }

  async exportInvoices(filters?: BillingFilters): Promise<Blob> {
    const response = await apiClient.get('/billing/invoices/export', {
      params: filters,
      customHeaders: {
        Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
    return new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  async exportExpenses(filters?: BillingFilters): Promise<Blob> {
    const response = await apiClient.get('/billing/expenses/export', {
      params: filters,
      customHeaders: {
        Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
    return new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  // Upload receipt
  async uploadReceipt(expenseId: string, file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post(`/billing/expenses/${expenseId}/receipt`, formData, {
      customHeaders: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }
}

export const billingService = new BillingService();