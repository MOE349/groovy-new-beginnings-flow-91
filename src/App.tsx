import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Suspense, lazy } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { Layout } from "./components/Layout";

// Lazy load all page components for better performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Index = lazy(() => import("./pages/Index"));
const Asset = lazy(() => import("./pages/Asset"));
const CreateAsset = lazy(() => import("./pages/CreateAsset"));
const CreateEquipment = lazy(() => import("./pages/CreateEquipment"));
const CreateAttachment = lazy(() => import("./pages/CreateAttachment"));
const EditAsset = lazy(() => import("./pages/EditAsset"));
const Settings = lazy(() => import("./pages/Settings"));
const CreateSite = lazy(() => import("./pages/CreateSite"));
const EditSite = lazy(() => import("./pages/EditSite"));
const CreateLocation = lazy(() => import("./pages/CreateLocation"));
const EditLocation = lazy(() => import("./pages/EditLocation"));
const CreateEquipmentCategory = lazy(() => import("./pages/CreateEquipmentCategory"));
const CreateAttachmentCategory = lazy(() => import("./pages/CreateAttachmentCategory"));
const WorkOrders = lazy(() => import("./pages/WorkOrders"));
const CreateWorkOrder = lazy(() => import("./pages/CreateWorkOrder"));
const EditWorkOrder = lazy(() => import("./pages/EditWorkOrder"));
const Parts = lazy(() => import("./pages/Parts"));
const PurchaseOrders = lazy(() => import("./pages/PurchaseOrders"));
const Billing = lazy(() => import("./pages/Billing"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Users = lazy(() => import("./pages/Users"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading component for lazy-loaded routes
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            {/* Public routes without layout */}
            <Route path="/login" element={
              <Suspense fallback={<PageLoader />}>
                <Login />
              </Suspense>
            } />
            <Route path="/register" element={
              <Suspense fallback={<PageLoader />}>
                <Register />
              </Suspense>
            } />
            
            {/* Protected routes with layout */}
            <Route path="/" element={
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <Dashboard />
                </Suspense>
              </Layout>
            } />
            <Route path="/dashboard" element={
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <Dashboard />
                </Suspense>
              </Layout>
            } />
            <Route path="/asset" element={
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <Asset />
                </Suspense>
              </Layout>
            } />
            <Route path="/asset/create" element={
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <CreateAsset />
                </Suspense>
              </Layout>
            } />
            <Route path="/asset/equipment/create" element={
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <CreateEquipment />
                </Suspense>
              </Layout>
            } />
            <Route path="/asset/attachment/create" element={
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <CreateAttachment />
                </Suspense>
              </Layout>
            } />
            <Route path="/asset/edit/:id" element={
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <EditAsset />
                </Suspense>
              </Layout>
            } />
            <Route path="/workorders" element={
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <WorkOrders />
                </Suspense>
              </Layout>
            } />
            <Route path="/workorders/create" element={
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <CreateWorkOrder />
                </Suspense>
              </Layout>
            } />
            <Route path="/workorders/edit/:id" element={
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <EditWorkOrder />
                </Suspense>
              </Layout>
            } />
            <Route path="/parts" element={
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <Parts />
                </Suspense>
              </Layout>
            } />
            <Route path="/purchase-orders" element={
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <PurchaseOrders />
                </Suspense>
              </Layout>
            } />
            <Route path="/billing" element={
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <Billing />
                </Suspense>
              </Layout>
            } />
            <Route path="/analytics" element={
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <Analytics />
                </Suspense>
              </Layout>
            } />
            <Route path="/users" element={
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <Users />
                </Suspense>
              </Layout>
            } />
            <Route path="/settings" element={
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <Settings />
                </Suspense>
              </Layout>
            } />
            <Route path="/settings/sites/new" element={
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <CreateSite />
                </Suspense>
              </Layout>
            } />
            <Route path="/settings/sites/edit/:id" element={
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <EditSite />
                </Suspense>
              </Layout>
            } />
            <Route path="/settings/locations/new" element={
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <CreateLocation />
                </Suspense>
              </Layout>
            } />
            <Route path="/settings/locations/edit/:id" element={
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <EditLocation />
                </Suspense>
              </Layout>
            } />
            <Route path="/settings/equipment-categories/new" element={
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <CreateEquipmentCategory />
                </Suspense>
              </Layout>
            } />
            <Route path="/settings/attachment-categories/new" element={
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <CreateAttachmentCategory />
                </Suspense>
              </Layout>
            } />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={
              <Suspense fallback={<PageLoader />}>
                <NotFound />
              </Suspense>
            } />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
