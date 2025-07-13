import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./contexts/AuthContext";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
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
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

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
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes with layout */}
            <Route path="/" element={<Layout><Dashboard /></Layout>} />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/asset" element={<Layout><Asset /></Layout>} />
            <Route path="/asset/create" element={<Layout><CreateAsset /></Layout>} />
            <Route path="/asset/equipment/create" element={<Layout><CreateEquipment /></Layout>} />
            <Route path="/asset/attachment/create" element={<Layout><CreateAttachment /></Layout>} />
            <Route path="/asset/edit/:id" element={<Layout><EditAsset /></Layout>} />
            <Route path="/workorders" element={<Layout><WorkOrders /></Layout>} />
            <Route path="/workorders/create" element={<Layout><CreateWorkOrder /></Layout>} />
            <Route path="/workorders/edit/:id" element={<Layout><EditWorkOrder /></Layout>} />
            <Route path="/parts" element={<Layout><Parts /></Layout>} />
            <Route path="/purchase-orders" element={<Layout><PurchaseOrders /></Layout>} />
            <Route path="/billing" element={<Layout><Billing /></Layout>} />
            <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
            <Route path="/settings" element={<Layout><Settings /></Layout>} />
            <Route path="/settings/sites/new" element={<Layout><CreateSite /></Layout>} />
            <Route path="/settings/sites/edit/:id" element={<Layout><EditSite /></Layout>} />
            <Route path="/settings/locations/new" element={<Layout><CreateLocation /></Layout>} />
            <Route path="/settings/locations/edit/:id" element={<Layout><EditLocation /></Layout>} />
            <Route path="/settings/equipment-categories/new" element={<Layout><CreateEquipmentCategory /></Layout>} />
            <Route path="/settings/attachment-categories/new" element={<Layout><CreateAttachmentCategory /></Layout>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
