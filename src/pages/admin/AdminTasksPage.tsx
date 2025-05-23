
import { useState } from "react";
import { useData } from "@/context/DataContext";
import { Task } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage,
  FormDescription 
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "@/components/ui/sonner";
import { Plus, Pencil, Trash2, Search, Image, Loader2 } from "lucide-react";

// Layout components
import MainLayout from "@/components/layout/MainLayout";
import PageTitle from "@/components/shared/PageTitle";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["Telegram", "YouTube", "Daily", "Custom"]),
  coinReward: z.coerce.number().min(1, "Coin reward must be at least 1"),
  targetUrl: z.string().min(1, "Target URL is required"),
  imageUrl: z.string().optional(),
  requirements: z.string().optional(),
  frequency: z.enum(["once", "daily"]).optional(),
  image: z.instanceof(FileList).optional()
});

type TaskFormValues = z.infer<typeof taskSchema>;

const AdminTasksPage = () => {
  const { tasks, addTask, updateTask, deleteTask, uploadImage } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "Custom",
      coinReward: 10,
      targetUrl: "#",
      imageUrl: "/placeholder.svg",
      requirements: "",
      frequency: "once",
    },
  });

  // Filter tasks based on search term
  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Open dialog for creating a new task
  const handleAddTask = () => {
    setEditingTask(null);
    setImagePreview(null);
    form.reset({
      title: "",
      description: "",
      type: "Custom",
      coinReward: 10,
      targetUrl: "#",
      imageUrl: "/placeholder.svg",
      requirements: "",
      frequency: "once",
    });
    setIsDialogOpen(true);
  };

  // Open dialog for editing an existing task
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setImagePreview(task.imageUrl || null);
    form.reset({
      title: task.title,
      description: task.description,
      type: task.type,
      coinReward: task.coinReward,
      targetUrl: task.targetUrl,
      imageUrl: task.imageUrl || "/placeholder.svg",
      requirements: task.requirements || "",
      frequency: task.frequency || "once",
    });
    setIsDialogOpen(true);
  };

  // Handle image upload and preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (IMAGE_TYPES.includes(file.type)) {
        const url = URL.createObjectURL(file);
        setImagePreview(url);
        form.setValue("image", files);
      } else {
        toast.error("Please select a valid image file (JPEG, PNG, WebP, or GIF)");
      }
    }
  };

  // Handle task form submission
  const onSubmit = async (data: TaskFormValues) => {
    setUploading(true);
    try {
      let finalImageUrl = data.imageUrl;
      
      // If there's a new image to upload
      if (data.image && data.image.length > 0) {
        const imageUrl = await uploadImage(data.image[0]);
        if (imageUrl) {
          finalImageUrl = imageUrl;
        }
      }
      
      if (editingTask) {
        await updateTask(editingTask.id, {
          ...data,
          imageUrl: finalImageUrl,
        });
        toast.success("Task updated successfully");
      } else {
        // Ensure all required fields exist when adding a new task
        const newTask = {
          title: data.title,
          description: data.description,
          type: data.type,
          coinReward: data.coinReward,
          targetUrl: data.targetUrl,
          imageUrl: finalImageUrl,
          requirements: data.requirements || "",
          frequency: data.frequency || "once",
        };
        await addTask(newTask);
        toast.success("Task added successfully");
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error("Failed to save task. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      await deleteTask(taskId);
      toast.success("Task deleted successfully");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageTitle
          title="Manage Tasks"
          description="Create, edit and delete tasks for users to complete"
        />

        {/* Search and Add */}
        <div className="flex justify-between gap-4 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleAddTask} className="whitespace-nowrap">
            <Plus className="h-4 w-4 mr-2" /> Add Task
          </Button>
        </div>

        {/* Tasks Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reward</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <div className="w-10 h-10 rounded overflow-hidden">
                        <img 
                          src={task.imageUrl || "/placeholder.svg"} 
                          alt={task.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg";
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>{task.type}</TableCell>
                    <TableCell>{task.coinReward} coins</TableCell>
                    <TableCell>{task.frequency || "once"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTask(task)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No tasks found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Add/Edit Task Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTask ? "Edit Task" : "Add New Task"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Task title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Task description"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Telegram">Telegram</SelectItem>
                            <SelectItem value="YouTube">YouTube</SelectItem>
                            <SelectItem value="Daily">Daily</SelectItem>
                            <SelectItem value="Custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="coinReward"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coin Reward</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="10"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="targetUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Image Upload */}
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Task Image</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          {imagePreview && (
                            <div className="w-40 h-40 relative rounded overflow-hidden mx-auto">
                              <img 
                                src={imagePreview} 
                                alt="Preview" 
                                className="w-full h-full object-cover" 
                              />
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                              id="task-image"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('task-image')?.click()}
                              className="w-full"
                            >
                              <Image className="h-4 w-4 mr-2" />
                              {imagePreview ? 'Change Image' : 'Upload Image'}
                            </Button>
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Upload an image for this task (JPEG, PNG, WebP, or GIF)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requirements (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any specific requirements to complete the task"
                          className="resize-none"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="once">Once</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={uploading}>
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      editingTask ? "Update Task" : "Add Task"
                    )}
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

export default AdminTasksPage;
