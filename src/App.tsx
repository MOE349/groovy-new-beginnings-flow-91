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
import Workorders from "./pages/Workorders";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import EntityForm from "./components/EntityForm";

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
            <Route path="/asset/create" element={<Layout><EntityForm entityType="assets" /></Layout>} />
            <Route path="/asset/edit/:id" element={<Layout><EntityForm entityType="assets" /></Layout>} />
            <Route path="/workorders" element={<Layout><Workorders /></Layout>} />
            <Route path="/workorders/create" element={<Layout><EntityForm entityType="work-orders" /></Layout>} />
            <Route path="/workorders/edit/:id" element={<Layout><EntityForm entityType="work-orders" /></Layout>} />
            <Route path="/settings" element={<Layout><Settings /></Layout>} />
            <Route path="/settings/sites/new" element={<Layout><EntityForm entityType="sites" /></Layout>} />
            <Route path="/settings/sites/edit/:id" element={<Layout><EntityForm entityType="sites" /></Layout>} />
            <Route path="/settings/locations/new" element={<Layout><EntityForm entityType="locations" /></Layout>} />
            <Route path="/settings/locations/edit/:id" element={<Layout><EntityForm entityType="locations" /></Layout>} />
            <Route path="/settings/equipment-categories/new" element={<Layout><EntityForm entityType="equipment-categories" /></Layout>} />
            <Route path="/settings/attachment-categories/new" element={<Layout><EntityForm entityType="attachment-categories" /></Layout>} />
            
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
