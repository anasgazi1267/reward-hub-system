
import { ReactNode } from 'react';

interface PageTitleProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

const PageTitle = ({ title, description, action }: PageTitleProps) => {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export default PageTitle;
