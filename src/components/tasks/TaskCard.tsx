
import { Button } from '@/components/ui/button';
import { Task } from '@/lib/types';
import { Coins, ExternalLink, CalendarClock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { toast } from '@/components/ui/sonner';

interface TaskCardProps {
  task: Task;
}

const TaskCard = ({ task }: TaskCardProps) => {
  const { title, description, coinReward, type, targetUrl, imageUrl, frequency } = task;
  const { user, addCoins, completeTask } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  if (!user) return null;
  
  const taskCompletionTime = user.taskCompletionTimes?.[task.id];
  const isDaily = frequency === 'daily' || type === 'Daily';
  
  // Check if task is completed
  let isCompleted = false;
  
  // For one-time tasks, check if it's in the completedTasks array
  if (!isDaily) {
    isCompleted = user.completedTasks.includes(task.id);
  } 
  // For daily tasks, check if it was completed today
  else if (taskCompletionTime) {
    const completionDate = new Date(taskCompletionTime);
    const today = new Date();
    isCompleted = (
      completionDate.getDate() === today.getDate() &&
      completionDate.getMonth() === today.getMonth() &&
      completionDate.getFullYear() === today.getFullYear()
    );
  }
  
  const handleTaskClick = async () => {
    // If already completed and not a daily task, or if it's a daily task already claimed today
    if (isCompleted) {
      if (isDaily) {
        toast.error("You've already completed this task today. Come back tomorrow!");
      } else {
        toast.error("You've already completed this task!");
      }
      return;
    }
    
    setIsLoading(true);
    
    // Open the target URL in a new tab
    window.open(targetUrl, '_blank');
    
    // Simulate task verification
    setTimeout(() => {
      completeTask(task.id);
      addCoins(coinReward);
      setIsLoading(false);
      toast.success(`Task completed! You earned ${coinReward} coins!`);
    }, 1500);
  };
  
  // Determine button text based on task status
  const getButtonText = () => {
    if (isLoading) return 'Processing...';
    if (isCompleted) {
      return isDaily ? 'Completed Today' : 'Completed';
    }
    return 'Start Task';
  };
  
  return (
    <div className={`bg-white rounded-lg border p-4 ${isCompleted ? 'opacity-75' : ''}`}>
      <div className="flex gap-4">
        <div className="h-16 w-16 shrink-0 rounded-md overflow-hidden">
          <img 
            src={imageUrl || '/placeholder.svg'} 
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-medium">{title}</h3>
            <div className="flex items-center">
              {isDaily && (
                <span className="bg-emerald-100 text-emerald-700 text-xs rounded-full px-2 py-0.5 flex items-center mr-2">
                  <CalendarClock size={12} className="mr-1" /> Daily
                </span>
              )}
              <span className="bg-primary/10 text-xs rounded-full px-2 py-0.5">{type}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1 text-primary font-semibold">
              <Coins size={16} className="text-primary" />
              <span>{coinReward}</span>
            </div>
            <Button 
              variant={isCompleted ? "outline" : "default"} 
              size="sm"
              onClick={handleTaskClick}
              disabled={isLoading || isCompleted}
            >
              {getButtonText()} {!isCompleted && <ExternalLink size={14} className="ml-1" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
