import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";

import { MainLayout } from "@/components/layout/main-layout";
import { AuthLayout } from "@/components/layout/auth-layout";
import { UserLayout } from "@/components/layout/user-layout";
import { AdminLayout } from "@/components/layout/admin-layout";

import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Plans from "@/pages/plans";
import FAQ from "@/pages/faq";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import AML from "@/pages/aml";
import KycPolicy from "@/pages/kyc-policy";

import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";

import Dashboard from "@/pages/user/dashboard";
import Investments from "@/pages/user/investments";
import Deposit from "@/pages/user/deposit";
import Withdraw from "@/pages/user/withdraw";
import Referrals from "@/pages/user/referrals";
import Profile from "@/pages/user/profile";
import Tickets from "@/pages/user/tickets";
import TicketDetail from "@/pages/user/ticket-detail";
import History from "@/pages/user/history";

import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminDeposits from "@/pages/admin/deposits";
import AdminWithdrawals from "@/pages/admin/withdrawals";
import AdminKyc from "@/pages/admin/kyc";
import AdminTickets from "@/pages/admin/tickets";
import AdminPlans from "@/pages/admin/plans";
import AdminInvestments from "@/pages/admin/investments";
import AdminLogs from "@/pages/admin/logs";
import AdminPromoCodes from "@/pages/admin/promo-codes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/"><Home /></Route>
      <Route path="/plans"><MainLayout><Plans /></MainLayout></Route>
      <Route path="/faq"><FAQ /></Route>
      <Route path="/terms"><Terms /></Route>
      <Route path="/privacy"><Privacy /></Route>
      <Route path="/aml"><AML /></Route>
      <Route path="/kyc-policy"><KycPolicy /></Route>

      <Route path="/login"><AuthLayout><Login /></AuthLayout></Route>
      <Route path="/register"><AuthLayout><Register /></AuthLayout></Route>

      <Route path="/dashboard"><UserLayout><Dashboard /></UserLayout></Route>
      <Route path="/investments"><UserLayout><Investments /></UserLayout></Route>
      <Route path="/deposit"><UserLayout><Deposit /></UserLayout></Route>
      <Route path="/withdraw"><UserLayout><Withdraw /></UserLayout></Route>
      <Route path="/referrals"><UserLayout><Referrals /></UserLayout></Route>
      <Route path="/profile"><UserLayout><Profile /></UserLayout></Route>
      <Route path="/tickets"><UserLayout><Tickets /></UserLayout></Route>
      <Route path="/tickets/:id">
        {(params) => <UserLayout><TicketDetail id={params.id} /></UserLayout>}
      </Route>
      <Route path="/history"><UserLayout><History /></UserLayout></Route>

      <Route path="/admin-login"><AdminLogin /></Route>

      <Route path="/admin"><AdminLayout><AdminDashboard /></AdminLayout></Route>
      <Route path="/admin/users"><AdminLayout><AdminUsers /></AdminLayout></Route>
      <Route path="/admin/deposits"><AdminLayout><AdminDeposits /></AdminLayout></Route>
      <Route path="/admin/withdrawals"><AdminLayout><AdminWithdrawals /></AdminLayout></Route>
      <Route path="/admin/investments"><AdminLayout><AdminInvestments /></AdminLayout></Route>
      <Route path="/admin/kyc"><AdminLayout><AdminKyc /></AdminLayout></Route>
      <Route path="/admin/tickets"><AdminLayout><AdminTickets /></AdminLayout></Route>
      <Route path="/admin/plans"><AdminLayout><AdminPlans /></AdminLayout></Route>
      <Route path="/admin/logs"><AdminLayout><AdminLogs /></AdminLayout></Route>
      <Route path="/admin/promo-codes"><AdminLayout><AdminPromoCodes /></AdminLayout></Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
