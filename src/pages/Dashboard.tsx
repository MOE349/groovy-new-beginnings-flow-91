import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiCall } from "@/utils/apis";
import GearSpinner from "@/components/ui/gear-spinner";
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
  Users,
  Calendar,
  MapPin,
  Settings
} from "lucide-react";

const Dashboard = () => {
  // Temporarily disabled API calls - using static data
  // const {
  //   data: dashboardData,
  //   isLoading,
  //   error,
  //   isError,
  // } = useQuery({
  //   queryKey: ["dashboard"],
  //   queryFn: async () => {
  //     const response = await apiGet("/dashboard");
  //     return response.data.data || response.data;
  //   },
  // });

  // Static fallback data for now
  const stats = {
    totalAssets: 24,
    assetsChange: "+12%",
    activeWorkorders: 8,
    workordersChange: "-5%",
    revenue: "$45,230",
    revenueChange: "+18%",
    utilization: 87,
    utilizationChange: "+3%"
  };
  const recentActivity: any[] = [];
  const alerts: any[] = [];
  const workorders = { active: 8 };
  const assets = { 
    total: 24, 
    operational: 85, 
    maintenance: 10, 
    outOfService: 5 
  };
  const performance = {
    utilization: 87,
    fuelEfficiency: 92,
    onTimeDelivery: 96,
    driverSatisfaction: 88
  };

  // Stats Cards Data
  const statsCards = [
    {
      title: "Total Assets",
      value: stats.totalAssets || assets.total || 0,
      change: stats.assetsChange || "+12%",
      trend: "up",
      icon: Truck,
      color: "text-blue-600"
    },
    {
      title: "Maintenance Tasks",
      value: stats.activeWorkorders || workorders.active || 0,
      change: stats.workordersChange || "-5%",
      trend: "down",
      icon: FileText,
      color: "text-orange-600"
    },
    {
      title: "Monthly Revenue",
      value: stats.revenue || "$0",
      change: stats.revenueChange || "+18%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Fleet Utilization",
      value: `${stats.utilization || performance.utilization || 0}%`,
      change: stats.utilizationChange || "+3%",
      trend: "up",
      icon: Activity,
      color: "text-purple-600"
    }
  ];

  // Quick Actions
  const quickActions = [
    { title: "Add Asset", icon: Truck, color: "bg-green-500" },
    { title: "Schedule Maintenance", icon: Calendar, color: "bg-orange-500" },
    { title: "View Reports", icon: Activity, color: "bg-purple-500" },
    { title: "Manage Settings", icon: Settings, color: "bg-blue-500" }
  ];

  return (
    <div className="space-y-6 min-w-0">
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
                  <span className="text-sm font-medium">{assets.operational || 85}%</span>
                  <Progress value={assets.operational || 85} className="w-20" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Under Maintenance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{assets.maintenance || 10}%</span>
                  <Progress value={assets.maintenance || 10} className="w-20" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Out of Service</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{assets.outOfService || 5}%</span>
                  <Progress value={assets.outOfService || 5} className="w-20" />
                </div>
              </div>
            </div>
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
                <button
                  key={index}
                  className="flex flex-col items-center justify-center p-3 rounded-lg border hover:bg-muted transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full ${action.color} flex items-center justify-center mb-2`}>
                    <action.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xs text-center font-medium">{action.title}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 5).map((activity: any, index: number) => (
                  <div key={index} className="flex items-start space-x-3 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">{activity.title || `Activity ${index + 1}`}</p>
                      <p className="text-muted-foreground text-xs">
                        {activity.timestamp || "2 hours ago"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                // Fallback activities
                [
                  { title: "Vehicle maintenance completed", time: "2 hours ago" },
                  { title: "Asset status updated", time: "4 hours ago" },
                  { title: "Driver check-in completed", time: "6 hours ago" },
                  { title: "Route optimization updated", time: "1 day ago" },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-muted-foreground text-xs">{activity.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Alerts & Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.length > 0 ? (
                alerts.slice(0, 3).map((alert: any, index: number) => (
                  <Alert key={index} variant={alert.severity === "high" ? "destructive" : "default"}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {alert.message || `Alert ${index + 1}`}
                    </AlertDescription>
                  </Alert>
                ))
              ) : (
                // Fallback alerts
                [
                  { message: "Vehicle #A001 requires maintenance", severity: "medium" },
                  { message: "Driver license expires in 30 days", severity: "low" },
                  { message: "Route efficiency below 85%", severity: "medium" },
                ].map((alert, index) => (
                  <Alert key={index} variant={alert.severity === "high" ? "destructive" : "default"}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {alert.message}
                    </AlertDescription>
                  </Alert>
                ))
              )}
            </div>
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
                <span className="text-sm">{performance.fuelEfficiency || 92}%</span>
              </div>
              <Progress value={performance.fuelEfficiency || 92} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">On-Time Delivery</span>
                <span className="text-sm">{performance.onTimeDelivery || 96}%</span>
              </div>
              <Progress value={performance.onTimeDelivery || 96} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Driver Satisfaction</span>
                <span className="text-sm">{performance.driverSatisfaction || 88}%</span>
              </div>
              <Progress value={performance.driverSatisfaction || 88} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;