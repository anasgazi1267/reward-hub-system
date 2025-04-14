
import { useState } from "react";
import { useData } from "@/context/DataContext";
import { PopupAd, BannerAd } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "@/components/ui/sonner";
import { Plus, Pencil, Trash2, Clock, Coins } from "lucide-react";

// Layout components
import MainLayout from "@/components/layout/MainLayout";
import PageTitle from "@/components/shared/PageTitle";

// Banner Ad Form Schema
const bannerAdSchema = z.object({
  name: z.string().min(1, "Name is required"),
  htmlContent: z.string().min(1, "HTML content is required"),
});

// Popup Ad Form Schema
const popupAdSchema = z.object({
  htmlContent: z.string().min(1, "HTML content is required"),
  durationSeconds: z.coerce.number().min(1, "Duration must be at least 1 second"),
  coinReward: z.coerce.number().min(1, "Coin reward must be at least 1"),
});

type BannerAdFormValues = z.infer<typeof bannerAdSchema>;
type PopupAdFormValues = z.infer<typeof popupAdSchema>;

const AdminAdsPage = () => {
  const {
    popupAds,
    bannerAds,
    addPopupAd,
    updatePopupAd,
    deletePopupAd,
    addBannerAd,
    updateBannerAd,
    deleteBannerAd,
  } = useData();

  const [activeBannerAdDialog, setActiveBannerAdDialog] = useState(false);
  const [activePopupAdDialog, setActivePopupAdDialog] = useState(false);
  const [editingBannerAd, setEditingBannerAd] = useState<BannerAd | null>(null);
  const [editingPopupAd, setEditingPopupAd] = useState<PopupAd | null>(null);

  // Banner Ad form
  const bannerAdForm = useForm<BannerAdFormValues>({
    resolver: zodResolver(bannerAdSchema),
    defaultValues: {
      name: "",
      htmlContent: '<div style="width:468px; height:60px; background-color:#f0f0f0; display:flex; align-items:center; justify-content:center; border:1px solid #ddd;"><span style="font-weight:bold;">468x60 Banner Ad</span></div>',
    },
  });

  // Popup Ad form
  const popupAdForm = useForm<PopupAdFormValues>({
    resolver: zodResolver(popupAdSchema),
    defaultValues: {
      htmlContent: '<div style="background-color:#f0f0f0; padding:20px; text-align:center;"><h2>Special Offer!</h2><p>Check out our amazing products at a discount!</p><a href="#" target="_blank" style="background-color:#4CAF50; color:white; padding:10px 20px; text-decoration:none; display:inline-block; margin-top:10px;">Learn More</a></div>',
      durationSeconds: 15,
      coinReward: 5,
    },
  });

  // Open dialog for adding/editing banner ad
  const handleBannerAdDialog = (ad?: BannerAd) => {
    if (ad) {
      setEditingBannerAd(ad);
      bannerAdForm.reset({
        name: ad.name,
        htmlContent: ad.htmlContent,
      });
    } else {
      setEditingBannerAd(null);
      bannerAdForm.reset({
        name: "",
        htmlContent: '<div style="width:468px; height:60px; background-color:#f0f0f0; display:flex; align-items:center; justify-content:center; border:1px solid #ddd;"><span style="font-weight:bold;">468x60 Banner Ad</span></div>',
      });
    }
    setActiveBannerAdDialog(true);
  };

  // Open dialog for adding/editing popup ad
  const handlePopupAdDialog = (ad?: PopupAd) => {
    if (ad) {
      setEditingPopupAd(ad);
      popupAdForm.reset({
        htmlContent: ad.htmlContent,
        durationSeconds: ad.durationSeconds,
        coinReward: ad.coinReward,
      });
    } else {
      setEditingPopupAd(null);
      popupAdForm.reset({
        htmlContent: '<div style="background-color:#f0f0f0; padding:20px; text-align:center;"><h2>Special Offer!</h2><p>Check out our amazing products at a discount!</p><a href="#" target="_blank" style="background-color:#4CAF50; color:white; padding:10px 20px; text-decoration:none; display:inline-block; margin-top:10px;">Learn More</a></div>',
        durationSeconds: 15,
        coinReward: 5,
      });
    }
    setActivePopupAdDialog(true);
  };

  // Handle banner ad form submission
  const onBannerAdSubmit = (data: BannerAdFormValues) => {
    if (editingBannerAd) {
      updateBannerAd(editingBannerAd.id, data);
      toast.success("Banner ad updated successfully");
    } else {
      // Ensure all required fields are provided when adding a new banner ad
      const newBannerAd = {
        name: data.name,
        htmlContent: data.htmlContent
      };
      addBannerAd(newBannerAd);
      toast.success("Banner ad added successfully");
    }
    setActiveBannerAdDialog(false);
  };

  // Handle popup ad form submission
  const onPopupAdSubmit = (data: PopupAdFormValues) => {
    if (editingPopupAd) {
      updatePopupAd(editingPopupAd.id, data);
      toast.success("Popup ad updated successfully");
    } else {
      // Ensure all required fields are provided when adding a new popup ad
      const newPopupAd = {
        htmlContent: data.htmlContent,
        durationSeconds: data.durationSeconds,
        coinReward: data.coinReward
      };
      addPopupAd(newPopupAd);
      toast.success("Popup ad added successfully");
    }
    setActivePopupAdDialog(false);
  };

  // Handle ad deletion
  const handleDeleteBannerAd = (adId: string) => {
    if (confirm("Are you sure you want to delete this banner ad?")) {
      deleteBannerAd(adId);
      toast.success("Banner ad deleted successfully");
    }
  };

  const handleDeletePopupAd = (adId: string) => {
    if (confirm("Are you sure you want to delete this popup ad?")) {
      deletePopupAd(adId);
      toast.success("Popup ad deleted successfully");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageTitle
          title="Manage Advertisements"
          description="Upload and manage banner and popup ads"
        />

        <Tabs defaultValue="banner" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="banner">Banner Ads</TabsTrigger>
            <TabsTrigger value="popup">Popup Ads</TabsTrigger>
          </TabsList>

          {/* Banner Ads Tab */}
          <TabsContent value="banner" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => handleBannerAdDialog()}>
                <Plus className="h-4 w-4 mr-2" /> Add Banner Ad
              </Button>
            </div>

            {bannerAds.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {bannerAds.map((ad) => (
                  <Card key={ad.id}>
                    <CardHeader>
                      <CardTitle>{ad.name}</CardTitle>
                      <CardDescription>
                        Standard 468x60 banner ad
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div
                        className="border overflow-hidden"
                        dangerouslySetInnerHTML={{ __html: ad.htmlContent }}
                      />
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBannerAdDialog(ad)}
                      >
                        <Pencil className="h-4 w-4 mr-2" /> Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteBannerAd(ad.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground py-4">
                    No banner ads found. Add your first banner ad to display it
                    on the website.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Popup Ads Tab */}
          <TabsContent value="popup" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => handlePopupAdDialog()}>
                <Plus className="h-4 w-4 mr-2" /> Add Popup Ad
              </Button>
            </div>

            {popupAds.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {popupAds.map((ad) => (
                  <Card key={ad.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-4 w-4" /> {ad.durationSeconds}s wait time
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Coins className="h-4 w-4" /> {ad.coinReward} coins reward
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div
                        className="border p-2 overflow-hidden max-h-[150px]"
                        dangerouslySetInnerHTML={{ __html: ad.htmlContent }}
                      />
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePopupAdDialog(ad)}
                      >
                        <Pencil className="h-4 w-4 mr-2" /> Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePopupAd(ad.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground py-4">
                    No popup ads found. Add your first popup ad to display it to
                    users.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Banner Ad Dialog */}
        <Dialog
          open={activeBannerAdDialog}
          onOpenChange={setActiveBannerAdDialog}
        >
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingBannerAd ? "Edit Banner Ad" : "Add Banner Ad"}
              </DialogTitle>
            </DialogHeader>
            <Form {...bannerAdForm}>
              <form
                onSubmit={bannerAdForm.handleSubmit(onBannerAdSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={bannerAdForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Ad name" {...field} />
                      </FormControl>
                      <FormDescription>
                        A descriptive name for this banner ad
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={bannerAdForm.control}
                  name="htmlContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HTML Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter HTML code"
                          className="font-mono h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        HTML code for a 468x60 banner ad
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="border p-3 mt-4">
                  <h3 className="text-sm font-medium mb-2">Preview:</h3>
                  <div
                    className="overflow-hidden"
                    style={{ width: "468px", height: "60px" }}
                    dangerouslySetInnerHTML={{
                      __html: bannerAdForm.watch("htmlContent"),
                    }}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {editingBannerAd ? "Update Banner Ad" : "Add Banner Ad"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Popup Ad Dialog */}
        <Dialog
          open={activePopupAdDialog}
          onOpenChange={setActivePopupAdDialog}
        >
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingPopupAd ? "Edit Popup Ad" : "Add Popup Ad"}
              </DialogTitle>
            </DialogHeader>
            <Form {...popupAdForm}>
              <form
                onSubmit={popupAdForm.handleSubmit(onPopupAdSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={popupAdForm.control}
                    name="durationSeconds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (seconds)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="15"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          How long users must wait
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={popupAdForm.control}
                    name="coinReward"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coin Reward</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="5"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Coins awarded after viewing
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={popupAdForm.control}
                  name="htmlContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HTML Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter HTML code"
                          className="font-mono h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        HTML content for the popup advertisement
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="border p-3 mt-4">
                  <h3 className="text-sm font-medium mb-2">Preview:</h3>
                  <div
                    className="overflow-auto max-h-[200px] p-2"
                    dangerouslySetInnerHTML={{
                      __html: popupAdForm.watch("htmlContent"),
                    }}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {editingPopupAd ? "Update Popup Ad" : "Add Popup Ad"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default AdminAdsPage;
