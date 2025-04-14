
import { Button } from '@/components/ui/button';
import { Task } from '@/lib/types';
import { Coins, ExternalLink } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';

interface TaskCardProps {
  task: Task;
}

const TaskCard = ({ task }: TaskCardProps) => {
  const { title, description, coinReward, type, targetUrl, imageUrl } = task;
  const { user, addCoins, completeTask } = useAuth();
  const { tasks } = useData();
  
  const isCompleted = user?.completedTasks.includes(task.id);
  
  const handleTaskClick = () => {
    // Open the target URL in a new tab
    window.open(targetUrl, '_blank');
    
    // If task is not completed, complete it and give reward
    if (!isCompleted && user) {
      completeTask(task.id);
      addCoins(coinReward);
    }
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
            <span className="bg-primary/10 text-xs rounded-full px-2 py-0.5">{type}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1 text-gold-600 font-semibold">
              <Coins size={16} className="text-gold-500" />
              <span>{coinReward}</span>
            </div>
            <Button 
              variant={isCompleted ? "outline" : "default"} 
              size="sm"
              onClick={handleTaskClick}
              disabled={!user}
            >
              {isCompleted ? 'Completed' : 'Start Task'} <ExternalLink size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
