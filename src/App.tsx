import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ErrorBoundary } from "./components/common";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Projects from "./pages/Projects";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import { WorkLogsPage } from "./pages/WorkLogs";
import { WorkLogCreate } from "./pages/WorkLogCreate";
import { WorkLogEdit } from "./pages/WorkLogEdit";
import { WorkLogDetail } from "./pages/WorkLogDetail";
import Workload from "./pages/Workload";
import Notifications from "./pages/Notifications";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  // Define restricted routes and their required roles
  const restrictedRoutes = {
    '/projects': ['admin', 'pm'],
    '/users': ['admin', 'pm'],
    '/workload': ['admin'],
    '/settings': ['admin'],
    '/work-logs': ['admin', 'pm', 'dev', 'ba', 'test'],
    '/work-logs/create': ['pm', 'dev', 'ba', 'test'],
    '/work-logs/edit': ['pm', 'dev', 'ba', 'test']
  };

  // Check if current path is restricted and user doesn't have access
  const currentPath = location.pathname;
  let requiredRoles = restrictedRoutes[currentPath as keyof typeof restrictedRoutes];
  
  // Check for work-logs edit routes with dynamic IDs
  if (!requiredRoles && currentPath.startsWith('/work-logs/edit/')) {
    requiredRoles = restrictedRoutes['/work-logs/edit'];
  }
  
  // Check for work-logs routes
  if (!requiredRoles && currentPath.startsWith('/work-logs')) {
    requiredRoles = restrictedRoutes['/work-logs'];
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  const DashboardComponent = ['dev', 'ba', 'test'].includes(user.role) ? EmployeeDashboard :
                            user.role === 'pm' ? EmployeeDashboard : Dashboard;

  return (
    <Routes>
      <Route path="/" element={<Layout><DashboardComponent /></Layout>} />

      {/* Work Log routes - accessible to all authenticated users */}
      <Route path="/work-logs" element={<Layout><WorkLogsPage /></Layout>} />
      <Route path="/work-logs/create" element={<Layout><WorkLogCreate /></Layout>} />
      <Route path="/work-logs/edit/:id" element={<Layout><WorkLogEdit /></Layout>} />
      <Route path="/work-logs/:id" element={<Layout><WorkLogDetail /></Layout>} />

      {/* Notifications route - accessible to all authenticated users */}
      <Route path="/notifications" element={<Layout><Notifications /></Layout>} />

      {(user.role === 'admin' || user.role === 'pm') && (
        <>
          <Route path="/projects" element={<Layout><Projects /></Layout>} />
          <Route path="/users" element={<Layout><Users /></Layout>} />
        </>
      )}
      {user.role === 'admin' && (
        <>
          <Route path="/workload" element={<Layout><Workload /></Layout>} />
          <Route path="/settings" element={<Layout><Settings /></Layout>} />
        </>
      )}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <BrowserRouter>
              <ErrorBoundary>
                <AppContent />
              </ErrorBoundary>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
