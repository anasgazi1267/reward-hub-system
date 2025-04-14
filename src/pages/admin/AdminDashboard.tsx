
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import MainLayout from '@/components/layout/MainLayout';
import PageTitle from '@/components/shared/PageTitle';
import StatCard from '@/components/home/StatCard';
import { 
  LayoutDashboard, 
  Users, 
  Gift, 
  FileCheck, 
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// No chart imports needed
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { WithdrawalRequest } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useEffect } from 'react';

// No Chart.js registration needed

const AdminDashboard = () => {
  const { user } = useAuth();
  const { tasks, rewards, withdrawalRequests, settings } = useData();
  const navigate = useNavigate();
  
  // Redirect if not admin
  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  if (!user?.isAdmin) return null;
  
  // Admin analytics
  const totalUsers = JSON.parse(localStorage.getItem('rewardHubUsers') || '[]').length;
  const pendingWithdrawals = withdrawalRequests.filter(wr => wr.status === 'pending').length;
  const approvedWithdrawals = withdrawalRequests.filter(wr => wr.status === 'approved').length;
  const rejectedWithdrawals = withdrawalRequests.filter(wr => wr.status === 'rejected').length;
  
  // Recent withdrawal requests
  const recentWithdrawals = [...withdrawalRequests]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  
  const getBadgeForStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Clock size={12} className="mr-1" /> Pending
        </Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle2 size={12} className="mr-1" /> Approved
        </Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle size={12} className="mr-1" /> Rejected
        </Badge>;
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageTitle 
          title="Admin Dashboard" 
          description="Monitor and manage your reward system"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={totalUsers}
            icon={<Users size={24} />}
            className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
          />
          <StatCard
            title="Active Rewards"
            value={rewards.filter(r => r.available).length}
            icon={<Gift size={24} />}
            className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
          />
          <StatCard
            title="Available Tasks"
            value={tasks.length}
            icon={<FileCheck size={24} />}
            className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200"
          />
          <StatCard
            title="Pending Withdrawals"
            value={pendingWithdrawals}
            icon={<DollarSign size={24} />}
            className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Recent Withdrawal Requests</CardTitle>
                <CardDescription>Most recent withdrawal requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentWithdrawals.length > 0 ? (
                    recentWithdrawals.map(withdrawal => (
                      <div 
                        key={withdrawal.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">{withdrawal.rewardName}</span>
                              {getBadgeForStatus(withdrawal.status)}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {withdrawal.username} • {new Date(withdrawal.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-gold-600 font-semibold">
                          <DollarSign size={16} className="text-gold-500" />
                          <span>{withdrawal.coinAmount}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <DollarSign className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No withdrawal requests yet</p>
                    </div>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/admin/withdrawals')}
                  >
                    View All Withdrawal Requests
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Withdrawal Statistics</CardTitle>
                <CardDescription>Overview of withdrawal requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-yellow-50 rounded-lg p-3 text-center">
                      <Clock className="mx-auto text-yellow-500 mb-1" size={20} />
                      <div className="text-xs text-muted-foreground">Pending</div>
                      <div className="text-xl font-bold">{pendingWithdrawals}</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <CheckCircle2 className="mx-auto text-green-500 mb-1" size={20} />
                      <div className="text-xs text-muted-foreground">Approved</div>
                      <div className="text-xl font-bold">{approvedWithdrawals}</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 text-center">
                      <XCircle className="mx-auto text-red-500 mb-1" size={20} />
                      <div className="text-xs text-muted-foreground">Rejected</div>
                      <div className="text-xl font-bold">{rejectedWithdrawals}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center h-40">
                    <div className="text-center">
                      <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Total Withdrawal Requests: {withdrawalRequests.length}
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={() => navigate('/admin/withdrawals')}
                  >
                    Process Withdrawals
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader className="pb-2">
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Current configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Min Withdrawal:</span>
                    <span className="font-medium">{settings.minWithdrawalCoins} coins</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Referral Reward:</span>
                    <span className="font-medium">{settings.referralReward} coins</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Min Referrals:</span>
                    <span className="font-medium">{settings.minReferralsForWithdrawal}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-2"
                    onClick={() => navigate('/admin/settings')}
                  >
                    Adjust Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
