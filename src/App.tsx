
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';

// Public Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFound from "./pages/NotFound";

// User Pages
import HomePage from "./pages/HomePage";
import EarnPage from "./pages/EarnPage";
import RewardsPage from "./pages/RewardsPage";
import TasksPage from "./pages/TasksPage";
import WithdrawPage from "./pages/WithdrawPage";
import ProfilePage from "./pages/ProfilePage";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminWithdrawalsPage from "./pages/admin/AdminWithdrawalsPage";
import AdminTasksPage from "./pages/admin/AdminTasksPage";
import AdminAdsPage from "./pages/admin/AdminAdsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* User Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/earn" element={<EarnPage />} />
              <Route path="/rewards" element={<RewardsPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/withdraw" element={<WithdrawPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/withdrawals" element={<AdminWithdrawalsPage />} />
              <Route path="/admin/tasks" element={<AdminTasksPage />} />
              <Route path="/admin/ads" element={<AdminAdsPage />} />
              
              {/* Fallback routes */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
