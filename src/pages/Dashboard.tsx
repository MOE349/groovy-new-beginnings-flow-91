import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { dashboardService } from "@/services/dashboard.service";
import { LoadingState } from "@/components/LoadingState";
import { Link } from "react-router-dom";
import { 
  Activity, 
  Truck, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Settings,
  RefreshCw
} from "lucide-react";

const Dashboard = () => {
  // Fetch dashboard data using React Query
  const {
    data: dashboardData,
    isLoading,
    error,
    isError,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => dashboardService.getDashboardData(),
    refetchInterval: 60000, // Refresh every minute
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  if (isLoading) {
    return <LoadingState variant="gear" message="Loading dashboard..." />;
  }

  if (isError && !dashboardData) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard data. {error?.message || 'Please try again later.'}
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  // Use data from API - no fallbacks
  const stats = dashboardData?.stats;
  const fleetStatus = dashboardData?.fleetStatus;
  const performance = dashboardData?.performance;
  const recentActivity = dashboardData?.recentActivity || [];
  const alerts = dashboardData?.alerts || [];
  const workOrdersSummary = dashboardData?.workOrdersSummary;
  const costSummary = dashboardData?.costSummary;

  // Handle missing data gracefully
  if (!stats || !fleetStatus || !performance) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Dashboard data is incomplete. Some sections may not be displayed.
        </AlertDescription>
      </Alert>
    );
  }

  // Stats Cards Data
  const statsCards = [
    {
      title: "Total Assets",
      value: stats.totalAssets,
      change: stats.assetsChange,
      trend: stats.assetsChange.startsWith('+') ? "up" : "down",
      icon: Truck,
      color: "text-blue-600"
    },
    {
      title: "Maintenance Tasks",
      value: stats.activeWorkorders,
      change: stats.workordersChange,
      trend: stats.workordersChange.startsWith('+') ? "up" : "down",
      icon: FileText,
      color: "text-orange-600"
    },
    {
      title: "Monthly Revenue",
      value: stats.revenue,
      change: stats.revenueChange,
      trend: stats.revenueChange.startsWith('+') ? "up" : "down",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Fleet Utilization",
      value: `${stats.utilization}%`,
      change: stats.utilizationChange,
      trend: stats.utilizationChange.startsWith('+') ? "up" : "down",
      icon: Activity,
      color: "text-purple-600"
    }
  ];

  // Quick Actions with proper routing
  const quickActions = [
    { title: "Add Asset", icon: Truck, color: "bg-green-500", to: "/asset/equipment/create" },
    { title: "Schedule Maintenance", icon: Calendar, color: "bg-orange-500", to: "/workorders/create" },
    { title: "View Reports", icon: Activity, color: "bg-purple-500", to: "/analytics" },
    { title: "Manage Settings", icon: Settings, color: "bg-blue-500", to: "/settings" }
  ];

  return (
    <div className="space-y-6 min-w-0">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <Button 
          onClick={() => refetch()} 
          variant="outline" 
          size="sm"
          disabled={isRefetching}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error banner for partial failures */}
      {isError && dashboardData && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Some data may be outdated. Last updated: {new Date().toLocaleTimeString()}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                {stat.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={stat.trend === "up" ? "text-green-500" : "text-red-500"}>
                  {stat.change}
                </span>
                <span>from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Fleet Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Truck className="mr-2 h-5 w-5" />
              Fleet Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Operational</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{fleetStatus.operational}%</span>
                  <Progress value={fleetStatus.operational} className="w-20" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Under Maintenance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{fleetStatus.maintenance}%</span>
                  <Progress value={fleetStatus.maintenance} className="w-20" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Out of Service</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{fleetStatus.outOfService}%</span>
                  <Progress value={fleetStatus.outOfService} className="w-20" />
                </div>
              </div>
            </div>
            {fleetStatus.total && (
              <p className="text-xs text-muted-foreground mt-2">
                Total fleet size: {fleetStatus.total} assets
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.to}
                  className="flex flex-col items-center justify-center p-3 rounded-lg border hover:bg-muted transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full ${action.color} flex items-center justify-center mb-2`}>
                    <action.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xs text-center font-medium">{action.title}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Work Orders Summary - new section */}
        {workOrdersSummary && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Work Orders Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-sm font-medium">{workOrdersSummary.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <span className="text-sm font-medium text-yellow-600">{workOrdersSummary.pending}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">In Progress</span>
                  <span className="text-sm font-medium text-blue-600">{workOrdersSummary.inProgress}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <span className="text-sm font-medium text-green-600">{workOrdersSummary.completed}</span>
                </div>
                {workOrdersSummary.overdue > 0 && (
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Overdue</span>
                    <span className="text-sm font-medium text-red-600">{workOrdersSummary.overdue}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 text-sm">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      activity.type === 'asset' ? 'bg-blue-500' :
                      activity.type === 'workorder' ? 'bg-orange-500' :
                      activity.type === 'user' ? 'bg-green-500' :
                      'bg-gray-500'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      {activity.description && (
                        <p className="text-muted-foreground text-xs">{activity.description}</p>
                      )}
                      <p className="text-muted-foreground text-xs">
                        {activity.timestamp}
                        {activity.userName && ` • ${activity.userName}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent activities
              </p>
            )}
          </CardContent>
        </Card>

        {/* Alerts & Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Alerts & Notifications
              </span>
              {alerts.filter(a => !a.acknowledged).length > 0 && (
                <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                  {alerts.filter(a => !a.acknowledged).length}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.slice(0, 5).map((alert) => (
                  <Alert 
                    key={alert.id} 
                    variant={
                      alert.severity === "critical" || alert.severity === "high" 
                        ? "destructive" 
                        : "default"
                    }
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      <div className="flex justify-between items-start">
                        <span>{alert.message}</span>
                        {!alert.acknowledged && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 ml-2"
                            onClick={() => dashboardService.acknowledgeAlert(alert.id)}
                          >
                            Dismiss
                          </Button>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground block mt-1">
                        {alert.timestamp}
                      </span>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No active alerts
              </p>
            )}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Fuel Efficiency</span>
                <span className="text-sm">{performance.fuelEfficiency}%</span>
              </div>
              <Progress value={performance.fuelEfficiency} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">On-Time Delivery</span>
                <span className="text-sm">{performance.onTimeDelivery}%</span>
              </div>
              <Progress value={performance.onTimeDelivery} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Driver Satisfaction</span>
                <span className="text-sm">{performance.driverSatisfaction}%</span>
              </div>
              <Progress value={performance.driverSatisfaction} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Utilization</span>
                <span className="text-sm">{performance.utilization}%</span>
              </div>
              <Progress value={performance.utilization} />
            </div>
          </CardContent>
        </Card>

        {/* Cost Summary - new section */}
        {costSummary && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Monthly Cost Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Monthly Cost</p>
                  <p className="text-2xl font-bold">${costSummary.monthlyTotal.toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Maintenance</span>
                    <span className="text-sm font-medium">${costSummary.maintenanceCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Fuel</span>
                    <span className="text-sm font-medium">${costSummary.fuelCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Labor</span>
                    <span className="text-sm font-medium">${costSummary.laborCost.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;