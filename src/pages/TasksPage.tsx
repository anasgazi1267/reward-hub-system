
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import MainLayout from '@/components/layout/MainLayout';
import PageTitle from '@/components/shared/PageTitle';
import AdBanner from '@/components/ads/AdBanner';
import { FileCheck, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import TaskCard from '@/components/tasks/TaskCard';
import { TaskType } from '@/lib/types';
import { useNavigate } from 'react-router-dom';

const TasksPage = () => {
  const { user } = useAuth();
  const { tasks } = useData();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [typeFilters, setTypeFilters] = useState<TaskType[]>([]);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  if (!user) return null;
  
  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    // Search filter
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const isCompleted = user.completedTasks.includes(task.id);
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'completed' && isCompleted) || 
      (statusFilter === 'pending' && !isCompleted);
    
    // Type filter
    const matchesType = typeFilters.length === 0 || typeFilters.includes(task.type);
    
    return matchesSearch && matchesStatus && matchesType;
  });
  
  // Get available task types
  const availableTypes = Array.from(new Set(tasks.map(task => task.type)));
  
  // Toggle type filter
  const toggleTypeFilter = (type: TaskType) => {
    setTypeFilters(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageTitle 
          title="Tasks" 
          description="Complete tasks to earn coins"
        />
        
        <AdBanner position="top" />
        
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
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
                  Types
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {availableTypes.map(type => (
                  <DropdownMenuCheckboxItem
                    key={type}
                    checked={typeFilters.includes(type)}
                    onCheckedChange={() => toggleTypeFilter(type)}
                  >
                    {type}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <FileCheck className="h-4 w-4 mr-2" />
                  Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem
                  checked={statusFilter === 'all'}
                  onCheckedChange={() => setStatusFilter('all')}
                >
                  All
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter === 'completed'}
                  onCheckedChange={() => setStatusFilter('completed')}
                >
                  Completed
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter === 'pending'}
                  onCheckedChange={() => setStatusFilter('pending')}
                >
                  Pending
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {filteredTasks.length > 0 ? (
          <div className="space-y-4">
            {filteredTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <div className="bg-white border rounded-lg p-8 text-center">
            <FileCheck className="mx-auto text-muted-foreground h-12 w-12 mb-3" />
            <h3 className="text-lg font-medium">No tasks found</h3>
            <p className="text-muted-foreground mt-1">
              {searchTerm || statusFilter !== 'all' || typeFilters.length > 0
                ? 'Try adjusting your search or filter criteria.'
                : 'No tasks are available at the moment. Check back later!'}
            </p>
            {(searchTerm || statusFilter !== 'all' || typeFilters.length > 0) && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setTypeFilters([]);
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
        
        <AdBanner position="bottom" />
      </div>
    </MainLayout>
  );
};

export default TasksPage;
