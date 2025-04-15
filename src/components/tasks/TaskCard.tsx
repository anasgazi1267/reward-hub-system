import { Button } from '@/components/ui/button';
import { Task } from '@/lib/types';
import { Coins, ExternalLink, CalendarClock, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';

interface TaskCardProps {
  task: Task;
}

const TaskCard = ({ task }: TaskCardProps) => {
  const { title, description, coinReward, type, targetUrl, imageUrl, frequency } = task;
  const { user, addCoins, completeTask } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  if (!user) return null;
  
  const taskCompletionTime = user.taskCompletionTimes?.[task.id];
  const isDaily = frequency === 'daily' || type === 'Daily';
  
  let isCompleted = false;
  let timeRemaining = 0;
  const now = new Date();
  
  if (taskCompletionTime) {
    const completionDate = new Date(taskCompletionTime);
    
    if (isDaily) {
      isCompleted = (
        completionDate.getDate() === now.getDate() &&
        completionDate.getMonth() === now.getMonth() &&
        completionDate.getFullYear() === now.getFullYear()
      );
    } 
    else {
      const hoursSinceCompletion = Math.floor((now.getTime() - completionDate.getTime()) / (1000 * 60 * 60));
      const cooldownHours = 72;
      
      if (hoursSinceCompletion < cooldownHours) {
        isCompleted = true;
        timeRemaining = cooldownHours - hoursSinceCompletion;
      }
    }
  } else if (!isDaily) {
    isCompleted = user.completedTasks.includes(task.id);
  }
  
  useEffect(() => {
    return () => {
      setIsLoading(false);
      setIsProcessing(false);
    };
  }, []);
  
  const handleTaskClick = async () => {
    if (isLoading || isProcessing || isCompleted) {
      if (isDaily) {
        toast.error("You've already completed this task today. Come back tomorrow!");
      } else if (timeRemaining > 0) {
        toast.error(`You can complete this task again in ${timeRemaining} hours.`);
      } else {
        toast.error("You've already completed this task!");
      }
      return;
    }
    
    setIsLoading(true);
    setIsProcessing(true);
    
    sessionStorage.setItem(`task_${task.id}_processing`, 'true');
    
    window.open(targetUrl, '_blank');
    
    setTimeout(() => {
      if (sessionStorage.getItem(`task_${task.id}_completed`) === 'true') {
        toast.error("This task has already been completed.");
        setIsLoading(false);
        setIsProcessing(false);
        return;
      }
      
      completeTask(task.id);
      addCoins(coinReward);
      
      sessionStorage.setItem(`task_${task.id}_completed`, 'true');
      sessionStorage.removeItem(`task_${task.id}_processing`);
      
      setIsLoading(false);
      toast.success(`Task completed! You earned ${coinReward} coins!`);
    }, 1500);
  };
  
  const getButtonText = () => {
    if (isLoading) return 'Processing...';
    if (isCompleted) {
      if (isDaily) return 'Completed Today';
      if (timeRemaining > 0) return `Available in ${timeRemaining}h`;
      return 'Completed';
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
              {!isDaily && (
                <span className="bg-blue-100 text-blue-700 text-xs rounded-full px-2 py-0.5 flex items-center mr-2">
                  <Clock size={12} className="mr-1" /> 72h
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
