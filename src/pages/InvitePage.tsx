
import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageTitle from "@/components/shared/PageTitle";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Share2, 
  Users, 
  Copy, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Mail, 
  Smartphone,
  Medal
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const InvitePage = () => {
  const { user } = useAuth();
  const { settings, getTotalReferrals } = useData();
  const [url, setUrl] = useState("");
  const totalReferrals = getTotalReferrals();

  useEffect(() => {
    if (user) {
      // Create referral URL
      const baseUrl = window.location.origin;
      const refUrl = `${baseUrl}/register?ref=${user.referralCode}`;
      setUrl(refUrl);
    }
  }, [user]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    toast.success("Referral link copied to clipboard");
  };

  const shareViaWhatsApp = () => {
    const message = `Join me on Reward Hub and earn coins! ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const shareViaFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
  };

  const shareViaTwitter = () => {
    const message = `Join me on Reward Hub and earn coins!`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`, "_blank");
  };

  const shareViaLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
  };

  const shareViaEmail = () => {
    const subject = "Join me on Reward Hub";
    const body = `Hey there,\n\nI thought you might be interested in joining Reward Hub. You can earn coins and redeem them for awesome rewards.\n\nClick the link below to sign up:\n${url}\n\nThanks!`;

    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank");
  };

  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageTitle
          title="Invite Friends"
          description="Invite friends and earn rewards"
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Referral Stats</CardTitle>
              <CardDescription>
                Track your referrals and rewards
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <Users className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                  <div className="text-sm text-muted-foreground">Your Total Referrals</div>
                  <div className="text-2xl font-bold text-blue-700">{totalReferrals}</div>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 text-center">
                  <Medal className="h-8 w-8 mx-auto text-amber-500 mb-2" />
                  <div className="text-sm text-muted-foreground">Referrals Needed</div>
                  <div className="text-2xl font-bold text-amber-700">{settings.minReferralsForWithdrawal}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Rewards You Earn:</h3>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 inline-flex items-center justify-center mr-2 text-xs">1</span>
                    Your friends get <span className="font-semibold">{settings.referralReward} coins</span> when they sign up with your link
                  </li>
                  <li className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 inline-flex items-center justify-center mr-2 text-xs">2</span>
                    You get <span className="font-semibold">{settings.inviterReward} coins</span> for each friend who joins
                  </li>
                  <li className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 inline-flex items-center justify-center mr-2 text-xs">3</span>
                    You need at least <span className="font-semibold">{settings.minReferralsForWithdrawal} referrals</span> to make withdrawals
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Share Your Referral Link</CardTitle>
              <CardDescription>
                Share this link with your friends to earn rewards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex space-x-2">
                <Input
                  value={url}
                  readOnly
                  className="bg-gray-50"
                />
                <Button variant="outline" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Share via:</h3>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    className="flex flex-col items-center py-4 h-auto gap-1"
                    onClick={shareViaWhatsApp}
                  >
                    <Smartphone className="h-5 w-5 text-green-600" />
                    <span className="text-xs">WhatsApp</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col items-center py-4 h-auto gap-1"
                    onClick={shareViaFacebook}
                  >
                    <Facebook className="h-5 w-5 text-blue-600" />
                    <span className="text-xs">Facebook</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col items-center py-4 h-auto gap-1"
                    onClick={shareViaTwitter}
                  >
                    <Twitter className="h-5 w-5 text-sky-500" />
                    <span className="text-xs">Twitter</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col items-center py-4 h-auto gap-1"
                    onClick={shareViaLinkedIn}
                  >
                    <Linkedin className="h-5 w-5 text-blue-700" />
                    <span className="text-xs">LinkedIn</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col items-center py-4 h-auto gap-1"
                    onClick={shareViaEmail}
                  >
                    <Mail className="h-5 w-5 text-gray-600" />
                    <span className="text-xs">Email</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col items-center py-4 h-auto gap-1"
                    onClick={copyToClipboard}
                  >
                    <Copy className="h-5 w-5 text-gray-600" />
                    <span className="text-xs">Copy Link</span>
                  </Button>
                </div>
              </div>
              
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-sm text-amber-800">
                  <strong>Pro Tip:</strong> Share your link with active gamers who are most likely to use our platform to earn rewards!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default InvitePage;
