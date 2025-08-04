import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingState } from '@/components/LoadingState';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { dashboardService } from '@/services/dashboard.service';
import { assetsService } from '@/services/assets.service';
import { workOrdersService } from '@/services/workorders.service';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Download,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import type { DateRange } from 'react-day-picker';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Analytics = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(subMonths(new Date(), 2)),
    to: endOfMonth(new Date()),
  });
  const [selectedMetric, setSelectedMetric] = useState('assets');

  // Fetch analytics data
  const { data: assetStats, isLoading: loadingAssets } = useQuery({
    queryKey: ['asset-stats', dateRange],
    queryFn: () => assetsService.getAssetStats(),
  });

  const { data: workOrderStats, isLoading: loadingWorkOrders } = useQuery({
    queryKey: ['workorder-stats', dateRange],
    queryFn: () => workOrdersService.getWorkOrderStats(),
  });

  const { data: performanceData, isLoading: loadingPerformance } = useQuery({
    queryKey: ['performance-metrics', dateRange],
    queryFn: () => dashboardService.getPerformanceMetrics(),
  });

  const isLoading = loadingAssets || loadingWorkOrders || loadingPerformance;

  // Mock data for charts - in real app, this would come from API
  const monthlyTrends = [
    { month: 'Jan', assets: 20, workOrders: 45, costs: 12500 },
    { month: 'Feb', assets: 22, workOrders: 52, costs: 14200 },
    { month: 'Mar', assets: 24, workOrders: 48, costs: 13800 },
    { month: 'Apr', assets: 24, workOrders: 55, costs: 15500 },
    { month: 'May', assets: 26, workOrders: 50, costs: 14000 },
    { month: 'Jun', assets: 28, workOrders: 58, costs: 16200 },
  ];

  const categoryBreakdown = [
    { name: 'Trucks', value: 12, percentage: 50 },
    { name: 'Trailers', value: 6, percentage: 25 },
    { name: 'Equipment', value: 4, percentage: 17 },
    { name: 'Tools', value: 2, percentage: 8 },
  ];

  const maintenanceTypes = [
    { type: 'Preventive', count: 120, percentage: 60 },
    { type: 'Corrective', count: 50, percentage: 25 },
    { type: 'Emergency', count: 20, percentage: 10 },
    { type: 'Inspection', count: 10, percentage: 5 },
  ];

  const downloadReport = () => {
    // In real app, this would generate and download a PDF/Excel report
    alert('Report download feature coming soon!');
  };

  if (isLoading) {
    return <LoadingState variant="gear" message="Loading analytics data..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Reports</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your fleet performance
          </p>
        </div>
        <div className="flex gap-2">
          <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
          <Button onClick={downloadReport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assetStats?.total || 24}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-500" /> 12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Work Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workOrderStats?.completed || 158}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-500" /> 8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,230</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="inline h-3 w-3 text-red-500" /> 5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceData?.utilization || 87}%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-500" /> 3% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>
                Track key metrics over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="assets"
                      stroke="#8884d8"
                      name="Assets"
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="workOrders"
                      stroke="#82ca9d"
                      name="Work Orders"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="costs"
                      stroke="#ffc658"
                      name="Costs ($)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Assets by Category</CardTitle>
                <CardDescription>Distribution of your fleet assets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Asset Categories</CardTitle>
                <CardDescription>Detailed breakdown by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryBreakdown.map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{category.value}</p>
                        <p className="text-sm text-muted-foreground">{category.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Types Distribution</CardTitle>
              <CardDescription>Breakdown of maintenance activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={maintenanceTypes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8">
                      {maintenanceTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Fleet Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Utilization Rate</span>
                    <span className="text-sm font-bold">
                      {performanceData?.utilization || 87}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${performanceData?.utilization || 87}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Fuel Efficiency</span>
                    <span className="text-sm font-bold">
                      {performanceData?.fuelEfficiency || 92}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${performanceData?.fuelEfficiency || 92}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">On-Time Delivery</span>
                    <span className="text-sm font-bold">
                      {performanceData?.onTimeDelivery || 96}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${performanceData?.onTimeDelivery || 96}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis</CardTitle>
                <CardDescription>Monthly cost breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Maintenance</span>
                    <span className="font-bold">$25,400</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Fuel</span>
                    <span className="font-bold">$12,800</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Labor</span>
                    <span className="font-bold">$7,030</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="font-medium">Total</span>
                    <span className="font-bold text-lg">$45,230</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;