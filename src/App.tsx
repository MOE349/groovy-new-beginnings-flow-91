import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./contexts/AuthContext";
import { Layout } from "./components/Layout";
import { lazy, Suspense } from "react";
import GearSpinner from "./components/ui/gear-spinner";

// Lazy load pages for better performance
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes  
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

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
            <Route path="/login" element={<Suspense fallback={<GearSpinner fullscreen />}><Login /></Suspense>} />
            <Route path="/register" element={<Suspense fallback={<GearSpinner fullscreen />}><Register /></Suspense>} />
            
            {/* Protected routes with layout */}
            <Route path="/" element={<Layout><Suspense fallback={<GearSpinner fullscreen />}><Dashboard /></Suspense></Layout>} />
            <Route path="/dashboard" element={<Layout><Suspense fallback={<GearSpinner fullscreen />}><Dashboard /></Suspense></Layout>} />
            <Route path="/asset" element={<Layout><Suspense fallback={<GearSpinner fullscreen />}><Asset /></Suspense></Layout>} />
            <Route path="/asset/create" element={<Layout><Suspense fallback={<GearSpinner fullscreen />}><CreateAsset /></Suspense></Layout>} />
            <Route path="/asset/equipment/create" element={<Layout><Suspense fallback={<GearSpinner fullscreen />}><CreateEquipment /></Suspense></Layout>} />
            <Route path="/asset/attachment/create" element={<Layout><Suspense fallback={<GearSpinner fullscreen />}><CreateAttachment /></Suspense></Layout>} />
            <Route path="/asset/edit/:id" element={<Layout><Suspense fallback={<GearSpinner fullscreen />}><EditAsset /></Suspense></Layout>} />
            <Route path="/workorders" element={<Layout><Suspense fallback={<GearSpinner fullscreen />}><WorkOrders /></Suspense></Layout>} />
            <Route path="/workorders/create" element={<Layout><Suspense fallback={<GearSpinner fullscreen />}><CreateWorkOrder /></Suspense></Layout>} />
            <Route path="/workorders/edit/:id" element={<Layout><Suspense fallback={<GearSpinner fullscreen />}><EditWorkOrder /></Suspense></Layout>} />
            <Route path="/parts" element={<Layout><Suspense fallback={<GearSpinner fullscreen />}><Parts /></Suspense></Layout>} />
            <Route path="/purchase-orders" element={<Layout><Suspense fallback={<GearSpinner fullscreen />}><PurchaseOrders /></Suspense></Layout>} />
            <Route path="/billing" element={<Layout><Suspense fallback={<GearSpinner fullscreen />}><Billing /></Suspense></Layout>} />
            <Route path="/analytics" element={<Layout><Suspense fallback={<GearSpinner fullscreen />}><Analytics /></Suspense></Layout>} />
            <Route path="/users" element={<Layout><Suspense fallback={<GearSpinner fullscreen />}><Users /></Suspense></Layout>} />
            <Route path="/settings" element={<Layout><Suspense fallback={<GearSpinner fullscreen />}><Settings /></Suspense></Layout>} />
            <Route path="/settings/sites/new" element={<Layout><Suspense fallback={<GearSpinner fullscreen />}><CreateSite /></Suspense></Layout>} />
            <Route path="/settings/sites/edit/:id" element={<Layout><Suspense fallback={<GearSpinner fullscreen />}><EditSite /></Suspense></Layout>} />
            <Route path="/settings/locations/new" element={<Layout><Suspense fallback={<GearSpinner fullscreen />}><CreateLocation /></Suspense></Layout>} />
            <Route path="/settings/locations/edit/:id" element={<Layout><Suspense fallback={<GearSpinner fullscreen />}><EditLocation /></Suspense></Layout>} />
            <Route path="/settings/equipment-categories/new" element={<Layout><Suspense fallback={<GearSpinner fullscreen />}><CreateEquipmentCategory /></Suspense></Layout>} />
            <Route path="/settings/attachment-categories/new" element={<Layout><Suspense fallback={<GearSpinner fullscreen />}><CreateAttachmentCategory /></Suspense></Layout>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<Suspense fallback={<GearSpinner fullscreen />}><NotFound /></Suspense>} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
