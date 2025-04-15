
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import MainLayout from '@/components/layout/MainLayout';
import PageTitle from '@/components/shared/PageTitle';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { toast } from '@/components/ui/sonner';
import { Coins, UserPlus, Users, Info, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const formSchema = z.object({
  referralReward: z.coerce.number().min(1, "Reward must be at least 1 coin"),
  inviterReward: z.coerce.number().min(0, "Reward must be at least 0 coins"),
  minReferralsForWithdrawal: z.coerce.number().min(0, "Minimum must be at least 0")
});

type FormValues = z.infer<typeof formSchema>;

const AdminInviteRewardsPage = () => {
  const { user } = useAuth();
  const { settings, updateSettings } = useData();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if not admin
  if (!user?.isAdmin) {
    navigate('/login');
    return null;
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      referralReward: settings.referralReward,
      inviterReward: settings.inviterReward || 0,
      minReferralsForWithdrawal: settings.minReferralsForWithdrawal
    }
  });

  const onSubmit = (data: FormValues) => {
    setIsLoading(true);
    
    // Update settings
    updateSettings({
      referralReward: data.referralReward,
      inviterReward: data.inviterReward,
      minReferralsForWithdrawal: data.minReferralsForWithdrawal
    });
    
    setIsLoading(false);
    toast.success("Invite reward settings updated successfully");
  };

  // Sample referral stats (in a real app, this would come from a database)
  const referralStats = [
    { level: 'Level 1 (Direct)', count: 245, totalRewards: 12250 },
    { level: 'Level 2 (Indirect)', count: 78, totalRewards: 1560 },
    { level: 'Total', count: 323, totalRewards: 13810 }
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageTitle
          title="Invite Rewards"
          description="Manage referral program and invite reward settings"
        />

        <div className="grid gap-6 md:grid-cols-2">
          {/* Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Coins className="mr-2 h-5 w-5" />
                Reward Settings
              </CardTitle>
              <CardDescription>
                Configure the coins rewarded for inviting new users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="referralReward"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referred User Reward</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Coins rewarded to new users who join via referral
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="inviterReward"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inviter Reward</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Coins rewarded to users who invite others
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="minReferralsForWithdrawal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Referrals for Withdrawal</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Minimum number of referrals required before withdrawals are allowed
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Settings'}
                    <Save className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Referral Statistics
              </CardTitle>
              <CardDescription>
                Overview of your referral program performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Total Referrals</p>
                  <p className="text-2xl font-bold text-blue-700 flex items-center justify-center">
                    <UserPlus className="mr-2 h-5 w-5" />
                    323
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Total Rewards</p>
                  <p className="text-2xl font-bold text-green-700 flex items-center justify-center">
                    <Coins className="mr-2 h-5 w-5" />
                    13,810
                  </p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <h3 className="text-sm font-medium mb-2">Referral Breakdown</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Level</TableHead>
                      <TableHead>Count</TableHead>
                      <TableHead>Rewards</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referralStats.map((stat, index) => (
                      <TableRow key={index}>
                        <TableCell>{stat.level}</TableCell>
                        <TableCell>{stat.count}</TableCell>
                        <TableCell>{stat.totalRewards}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground flex items-start">
              <Info className="mr-2 h-4 w-4" />
              These statistics represent all-time referral performance
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminInviteRewardsPage;
