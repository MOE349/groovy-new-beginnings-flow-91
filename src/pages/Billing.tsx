import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingState } from '@/components/LoadingState';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { useUIStore } from '@/stores/uiStore';
import {
  DollarSign,
  CreditCard,
  FileText,
  Download,
  Plus,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Receipt,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import type { DateRange } from 'react-day-picker';

// Mock data - in production, this would come from API
const invoices = [
  {
    id: 'INV-001',
    date: '2024-06-15',
    customer: 'ABC Transport Co.',
    amount: 5420.00,
    status: 'paid',
    dueDate: '2024-07-15',
  },
  {
    id: 'INV-002',
    date: '2024-06-20',
    customer: 'XYZ Logistics',
    amount: 3280.50,
    status: 'pending',
    dueDate: '2024-07-20',
  },
  {
    id: 'INV-003',
    date: '2024-06-25',
    customer: 'Quick Delivery Inc.',
    amount: 7890.00,
    status: 'overdue',
    dueDate: '2024-06-25',
  },
  {
    id: 'INV-004',
    date: '2024-07-01',
    customer: 'Global Shipping Ltd.',
    amount: 4560.75,
    status: 'paid',
    dueDate: '2024-08-01',
  },
];

const expenses = [
  {
    id: 'EXP-001',
    date: '2024-06-10',
    category: 'Maintenance',
    vendor: 'AutoFix Service Center',
    amount: 1250.00,
    status: 'approved',
    description: 'Routine maintenance for Vehicle #A001',
  },
  {
    id: 'EXP-002',
    date: '2024-06-12',
    category: 'Fuel',
    vendor: 'PetroMax Station',
    amount: 850.50,
    status: 'approved',
    description: 'Fuel for fleet operations',
  },
  {
    id: 'EXP-003',
    date: '2024-06-18',
    category: 'Parts',
    vendor: 'TruckParts Warehouse',
    amount: 2340.00,
    status: 'pending',
    description: 'Replacement parts for Vehicle #B003',
  },
  {
    id: 'EXP-004',
    date: '2024-06-22',
    category: 'Insurance',
    vendor: 'SafeDrive Insurance',
    amount: 5600.00,
    status: 'approved',
    description: 'Monthly fleet insurance premium',
  },
];

const getStatusBadge = (status: string) => {
  const variants: Record<string, { variant: any; icon: any }> = {
    paid: { variant: 'default', icon: CheckCircle },
    approved: { variant: 'default', icon: CheckCircle },
    pending: { variant: 'secondary', icon: Clock },
    overdue: { variant: 'destructive', icon: XCircle },
    rejected: { variant: 'destructive', icon: XCircle },
  };

  const { variant, icon: Icon } = variants[status] || variants.pending;

  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

const Billing = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const { openModal } = useUIStore();

  // Calculate summary statistics
  const totalRevenue = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const pendingRevenue = invoices
    .filter((inv) => inv.status === 'pending')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalExpenses = expenses
    .filter((exp) => exp.status === 'approved')
    .reduce((sum, exp) => sum + exp.amount, 0);

  const netProfit = totalRevenue - totalExpenses;

  const handleCreateInvoice = () => {
    openModal({
      title: 'Create New Invoice',
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="customer">Customer</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="abc">ABC Transport Co.</SelectItem>
                <SelectItem value="xyz">XYZ Logistics</SelectItem>
                <SelectItem value="quick">Quick Delivery Inc.</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" placeholder="0.00" />
          </div>
          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input id="dueDate" type="date" />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" placeholder="Invoice description" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button>Create Invoice</Button>
          </div>
        </div>
      ),
      size: 'md',
    });
  };

  const handleAddExpense = () => {
    openModal({
      title: 'Record New Expense',
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="fuel">Fuel</SelectItem>
                <SelectItem value="parts">Parts</SelectItem>
                <SelectItem value="insurance">Insurance</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="vendor">Vendor</Label>
            <Input id="vendor" placeholder="Vendor name" />
          </div>
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" placeholder="0.00" />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" placeholder="Expense description" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button>Add Expense</Button>
          </div>
        </div>
      ),
      size: 'md',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing & Finance</h1>
          <p className="text-muted-foreground">
            Manage invoices, expenses, and financial reports
          </p>
        </div>
        <div className="flex gap-2">
          <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-500" /> 12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Revenue</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">3 pending invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="inline h-3 w-3 text-red-500" /> 5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.abs(netProfit).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Invoices</CardTitle>
                  <CardDescription>Manage customer invoices and payments</CardDescription>
                </div>
                <Button onClick={handleCreateInvoice}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Invoice
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices
                    .filter(
                      (invoice) =>
                        (statusFilter === 'all' || invoice.status === statusFilter) &&
                        (searchTerm === '' ||
                          invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          invoice.id.toLowerCase().includes(searchTerm.toLowerCase()))
                    )
                    .map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>{format(new Date(invoice.date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{invoice.customer}</TableCell>
                        <TableCell className="font-medium">
                          ${invoice.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Expenses</CardTitle>
                  <CardDescription>Track and manage business expenses</CardDescription>
                </div>
                <Button onClick={handleAddExpense}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Expense
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Expense #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.id}</TableCell>
                      <TableCell>{format(new Date(expense.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{expense.category}</Badge>
                      </TableCell>
                      <TableCell>{expense.vendor}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {expense.description}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${expense.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(expense.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>Overview of financial performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Total Income</span>
                  <span className="font-bold text-green-600">
                    ${totalRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total Expenses</span>
                  <span className="font-bold text-red-600">
                    ${totalExpenses.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <span className="font-medium">Net Profit</span>
                  <span className={`font-bold text-lg ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(netProfit).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>Expenses by category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {['Maintenance', 'Fuel', 'Parts', 'Insurance'].map((category) => {
                  const categoryTotal = expenses
                    .filter((exp) => exp.category === category && exp.status === 'approved')
                    .reduce((sum, exp) => sum + exp.amount, 0);
                  const percentage = totalExpenses > 0 ? (categoryTotal / totalExpenses) * 100 : 0;

                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{category}</span>
                        <span className="text-sm font-medium">
                          ${categoryTotal.toLocaleString()} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Billing;