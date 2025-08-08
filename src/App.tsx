import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./contexts/AuthContext";
import { Layout } from "./components/Layout";
import { AdminLayout } from "./components/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import AdminDashboard from "./pages/AdminDashboard";
import Asset from "./pages/Asset";
import CreateAsset from "./pages/CreateAsset";
import CreateEquipment from "./pages/CreateEquipment";
import CreateAttachment from "./pages/CreateAttachment";
import EditAsset from "./pages/EditAsset";
import Settings from "./pages/Settings";
import CreateSite from "./pages/CreateSite";
import EditSite from "./pages/EditSite";
import CreateLocation from "./pages/CreateLocation";
import EditLocation from "./pages/EditLocation";
import CreateEquipmentCategory from "./pages/CreateEquipmentCategory";
import CreateAttachmentCategory from "./pages/CreateAttachmentCategory";
import WorkOrders from "./pages/WorkOrders";
import CreateWorkOrder from "./pages/CreateWorkOrder";
import EditWorkOrder from "./pages/EditWorkOrder";
import Parts from "./pages/Parts";
import PurchaseOrders from "./pages/PurchaseOrders";
import Billing from "./pages/Billing";
import Analytics from "./pages/Analytics";
import Users from "./pages/Users";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function getHostContext() {
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  if (!hostname) return { kind: "landing" as const, sub: null };

  // Local development parity
  if (
    hostname === "localhost" ||
    /^\d+\.\d+\.\d+\.\d+$/.test(hostname) ||
    hostname === "::1"
  ) {
    // Root localhost acts as landing
    return { kind: "landing" as const, sub: null };
  }
  if (hostname.endsWith(".localhost")) {
    const sub = hostname.split(".")[0];
    if (sub === "admin") return { kind: "admin" as const, sub };
    return { kind: "tenant" as const, sub };
  }

  // Production
  const parts = hostname.split(".");
  const root = "alfrih.com";
  const domain = parts.slice(-2).join(".");
  if (domain !== root) return { kind: "unknown" as const, sub: null };
  const sub = parts.length > 2 ? parts[0] : null;
  if (!sub || sub === "www") return { kind: "landing" as const, sub: null };
  if (sub === "admin") return { kind: "admin" as const, sub };
  return { kind: "tenant" as const, sub };
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Landing host: render landing page only */}
              {(() => {
                const ctx = getHostContext();
                if (ctx.kind === "landing") {
                  return (
                    <>
                      <Route path="/" element={<Landing />} />
                    </>
                  );
                }
                if (ctx.kind === "admin") {
                  return (
                    <>
                      <Route
                        path="/"
                        element={
                          <AdminLayout>
                            <AdminDashboard />
                          </AdminLayout>
                        }
                      />
                      <Route
                        path="/dashboard"
                        element={
                          <AdminLayout>
                            <AdminDashboard />
                          </AdminLayout>
                        }
                      />
                      {/* Keep admin minimal for now; extend later */}
                    </>
                  );
                }
                // Tenant or local/unknown fall back to tenant app
                return (
                  <>
                    <Route
                      path="/"
                      element={
                        <Layout>
                          <Dashboard />
                        </Layout>
                      }
                    />
                    <Route
                      path="/dashboard"
                      element={
                        <Layout>
                          <Dashboard />
                        </Layout>
                      }
                    />
                    <Route
                      path="/asset"
                      element={
                        <Layout>
                          <Asset />
                        </Layout>
                      }
                    />
                    <Route
                      path="/asset/create"
                      element={
                        <Layout>
                          <CreateAsset />
                        </Layout>
                      }
                    />
                    <Route
                      path="/asset/equipment/create"
                      element={
                        <Layout>
                          <CreateEquipment />
                        </Layout>
                      }
                    />
                    <Route
                      path="/asset/attachment/create"
                      element={
                        <Layout>
                          <CreateAttachment />
                        </Layout>
                      }
                    />
                    <Route
                      path="/asset/edit/:id"
                      element={
                        <Layout>
                          <EditAsset />
                        </Layout>
                      }
                    />
                    <Route
                      path="/workorders"
                      element={
                        <Layout>
                          <WorkOrders />
                        </Layout>
                      }
                    />
                    <Route
                      path="/workorders/create"
                      element={
                        <Layout>
                          <CreateWorkOrder />
                        </Layout>
                      }
                    />
                    <Route
                      path="/workorders/edit/:id"
                      element={
                        <Layout>
                          <EditWorkOrder />
                        </Layout>
                      }
                    />
                    <Route
                      path="/parts"
                      element={
                        <Layout>
                          <Parts />
                        </Layout>
                      }
                    />
                    <Route
                      path="/purchase-orders"
                      element={
                        <Layout>
                          <PurchaseOrders />
                        </Layout>
                      }
                    />
                    <Route
                      path="/billing"
                      element={
                        <Layout>
                          <Billing />
                        </Layout>
                      }
                    />
                    <Route
                      path="/analytics"
                      element={
                        <Layout>
                          <Analytics />
                        </Layout>
                      }
                    />
                    <Route
                      path="/users"
                      element={
                        <Layout>
                          <Users />
                        </Layout>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <Layout>
                          <Settings />
                        </Layout>
                      }
                    />
                    <Route
                      path="/settings/sites/new"
                      element={
                        <Layout>
                          <CreateSite />
                        </Layout>
                      }
                    />
                    <Route
                      path="/settings/sites/edit/:id"
                      element={
                        <Layout>
                          <EditSite />
                        </Layout>
                      }
                    />
                    <Route
                      path="/settings/locations/new"
                      element={
                        <Layout>
                          <CreateLocation />
                        </Layout>
                      }
                    />
                    <Route
                      path="/settings/locations/edit/:id"
                      element={
                        <Layout>
                          <EditLocation />
                        </Layout>
                      }
                    />
                    <Route
                      path="/settings/equipment-categories/new"
                      element={
                        <Layout>
                          <CreateEquipmentCategory />
                        </Layout>
                      }
                    />
                    <Route
                      path="/settings/attachment-categories/new"
                      element={
                        <Layout>
                          <CreateAttachmentCategory />
                        </Layout>
                      }
                    />
                  </>
                );
              })()}

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
