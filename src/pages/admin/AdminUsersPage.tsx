
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import PageTitle from '@/components/shared/PageTitle';
import { 
  Users, 
  Search, 
  ChevronDown, 
  Coins, 
  UserCheck, 
  UserMinus,
  Plus,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { User } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from '@/components/ui/sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect } from 'react';

const AdminUsersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Redirect if not admin
  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  // Load users from localStorage
  useEffect(() => {
    const storedUsers = localStorage.getItem('rewardHubUsers');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
  }, []);
  
  if (!user?.isAdmin) return null;
  
  // Filter users by search term
  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Add or remove coins
  const updateUserCoins = (userId: string, amount: number) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return { ...u, coins: Math.max(0, u.coins + amount) };
      }
      return u;
    });
    
    setUsers(updatedUsers);
    localStorage.setItem('rewardHubUsers', JSON.stringify(updatedUsers));
    
    toast.success(`Updated coins for user ${users.find(u => u.id === userId)?.username}`);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageTitle 
          title="User Management" 
          description="View and manage user accounts"
          action={
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New User
            </Button>
          }
        />
        
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
              <ChevronDown className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" className="w-full sm:w-auto">
              <ChevronDown className="h-4 w-4 mr-2" />
              Sort
            </Button>
          </div>
        </div>
        
        <div className="bg-white border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Coins</TableHead>
                <TableHead>Referrals</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Coins size={14} className="text-gold-500" />
                      <span>{user.coins}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.referralCount}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {user.isAdmin ? (
                        <span className="text-primary flex items-center gap-1 text-xs font-medium bg-primary/10 px-2 py-0.5 rounded-full">
                          <UserCheck size={12} /> Admin
                        </span>
                      ) : (
                        <span className="text-blue-600 flex items-center gap-1 text-xs font-medium bg-blue-50 px-2 py-0.5 rounded-full">
                          <UserCheck size={12} /> User
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => updateUserCoins(user.id, 100)}>
                          <Coins className="mr-2 h-4 w-4" />
                          <span>Add 100 Coins</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateUserCoins(user.id, -100)}>
                          <UserMinus className="mr-2 h-4 w-4" />
                          <span>Remove 100 Coins</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No users found</p>
                      <p className="text-xs text-muted-foreground">Try adjusting your search</p>
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

export default AdminUsersPage;
