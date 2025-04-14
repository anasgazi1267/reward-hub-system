
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: ReactNode;
  className?: string;
}

const StatCard = ({ title, value, description, icon, className }: StatCardProps) => {
  return (
    <div className={cn(
      "bg-white rounded-lg p-5 shadow-sm border",
      className
    )}>
      <div className="flex items-start">
        <div className="mr-4 p-3 rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
