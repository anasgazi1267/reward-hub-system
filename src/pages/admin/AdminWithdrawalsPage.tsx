
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import MainLayout from '@/components/layout/MainLayout';
import PageTitle from '@/components/shared/PageTitle';
import { 
  DollarSign, 
  Search, 
  CheckCircle2, 
  XCircle, 
  MoreHorizontal, 
  Filter, 
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { WithdrawalRequest } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AdminWithdrawalsPage = () => {
  const { user } = useAuth();
  const { withdrawalRequests, updateWithdrawalStatus } = useData();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  
  // Redirect if not admin
  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  if (!user?.isAdmin) return null;
  
  // Filter withdrawal requests
  const filteredWithdrawals = withdrawalRequests.filter(withdrawal => {
    const matchesSearch = 
      withdrawal.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.rewardName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || withdrawal.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Sort by date (newest first)
  const sortedWithdrawals = [...filteredWithdrawals].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
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
          title="Withdrawal Requests" 
          description="Manage user withdrawal requests"
        />
        
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search withdrawals..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="h-4 w-4 mr-2" />
                  {statusFilter === 'all' ? 'All Status' : 
                    statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                  All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                  <Clock className="mr-2 h-4 w-4" />
                  <span>Pending</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('approved')}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  <span>Approved</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('rejected')}>
                  <XCircle className="mr-2 h-4 w-4" />
                  <span>Rejected</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="bg-white border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Reward</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Additional Info</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedWithdrawals.map(withdrawal => (
                <TableRow key={withdrawal.id}>
                  <TableCell className="font-medium">{withdrawal.username}</TableCell>
                  <TableCell>{withdrawal.rewardName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign size={14} className="text-gold-500" />
                      <span>{withdrawal.coinAmount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(withdrawal.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </TableCell>
                  <TableCell>
                    {getBadgeForStatus(withdrawal.status)}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      {withdrawal.playerUsername && (
                        <div>Player: {withdrawal.playerUsername}</div>
                      )}
                      {withdrawal.playerID && (
                        <div>ID: {withdrawal.playerID}</div>
                      )}
                      {withdrawal.email && (
                        <div>Email: {withdrawal.email}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {withdrawal.status === 'pending' ? (
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => updateWithdrawalStatus(withdrawal.id, 'approved')}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" /> 
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => updateWithdrawalStatus(withdrawal.id, 'rejected')}
                        >
                          <XCircle className="h-4 w-4 mr-1" /> 
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => updateWithdrawalStatus(withdrawal.id, 'approved')}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            <span>Mark as Approved</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateWithdrawalStatus(withdrawal.id, 'rejected')}>
                            <XCircle className="mr-2 h-4 w-4" />
                            <span>Mark as Rejected</span>
                          </DropdownMenuItem>
                          {/* Cannot mark as pending after decision made */}
                          <DropdownMenuItem disabled>
                            <Clock className="mr-2 h-4 w-4" />
                            <span>Cannot change once decided</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              
              {sortedWithdrawals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <DollarSign className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No withdrawal requests found</p>
                      {(searchTerm || statusFilter !== 'all') && (
                        <p className="text-xs text-muted-foreground">Try adjusting your filters</p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminWithdrawalsPage;
