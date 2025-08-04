import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { NotificationProvider } from "./components/NotificationSystem";
import { lazy, Suspense } from "react";
import { Layout } from "./components/Layout";
import { LoadingState } from "./components/LoadingState";
import { GlobalModals, GlobalDrawers, GlobalLoadingOverlay } from "./components/GlobalModals";
import { queryClient } from "./lib/react-query";

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



// Wrapper component for lazy-loaded routes
const LazyRoute = ({ element }: { element: React.ReactNode }) => (
  <Suspense fallback={<LoadingState variant="gear" message="Loading page..." />}>
    {element}
  </Suspense>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <GlobalModals />
              <GlobalDrawers />
              <GlobalLoadingOverlay />
              <BrowserRouter>
          <Routes>
            {/* Public routes without layout */}
            <Route path="/login" element={<LazyRoute element={<Login />} />} />
            <Route path="/register" element={<LazyRoute element={<Register />} />} />
            
            {/* Protected routes with layout */}
            <Route path="/" element={<LazyRoute element={<Layout><Dashboard /></Layout>} />} />
            <Route path="/dashboard" element={<LazyRoute element={<Layout><Dashboard /></Layout>} />} />
            <Route path="/asset" element={<LazyRoute element={<Layout><Asset /></Layout>} />} />
            <Route path="/asset/create" element={<LazyRoute element={<Layout><CreateAsset /></Layout>} />} />
            <Route path="/asset/equipment/create" element={<LazyRoute element={<Layout><CreateEquipment /></Layout>} />} />
            <Route path="/asset/attachment/create" element={<LazyRoute element={<Layout><CreateAttachment /></Layout>} />} />
            <Route path="/asset/edit/:id" element={<LazyRoute element={<Layout><EditAsset /></Layout>} />} />
            <Route path="/workorders" element={<LazyRoute element={<Layout><WorkOrders /></Layout>} />} />
            <Route path="/workorders/create" element={<LazyRoute element={<Layout><CreateWorkOrder /></Layout>} />} />
            <Route path="/workorders/edit/:id" element={<LazyRoute element={<Layout><EditWorkOrder /></Layout>} />} />
            <Route path="/parts" element={<LazyRoute element={<Layout><Parts /></Layout>} />} />
            <Route path="/purchase-orders" element={<LazyRoute element={<Layout><PurchaseOrders /></Layout>} />} />
            <Route path="/billing" element={<LazyRoute element={<Layout><Billing /></Layout>} />} />
            <Route path="/analytics" element={<LazyRoute element={<Layout><Analytics /></Layout>} />} />
            <Route path="/users" element={<LazyRoute element={<Layout><Users /></Layout>} />} />
            <Route path="/settings" element={<LazyRoute element={<Layout><Settings /></Layout>} />} />
            <Route path="/settings/sites/new" element={<LazyRoute element={<Layout><CreateSite /></Layout>} />} />
            <Route path="/settings/sites/edit/:id" element={<LazyRoute element={<Layout><EditSite /></Layout>} />} />
            <Route path="/settings/locations/new" element={<LazyRoute element={<Layout><CreateLocation /></Layout>} />} />
            <Route path="/settings/locations/edit/:id" element={<LazyRoute element={<Layout><EditLocation /></Layout>} />} />
            <Route path="/settings/equipment-categories/new" element={<LazyRoute element={<Layout><CreateEquipmentCategory /></Layout>} />} />
            <Route path="/settings/attachment-categories/new" element={<LazyRoute element={<Layout><CreateAttachmentCategory /></Layout>} />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<LazyRoute element={<NotFound />} />} />
          </Routes>
        </BrowserRouter>
            </TooltipProvider>
          </ThemeProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
