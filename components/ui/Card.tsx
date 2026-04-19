import { HTMLAttributes } from 'react';

export function Card({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl border border-neutral-200 bg-white p-6 shadow-card dark:border-neutral-600 dark:bg-neutral-900 dark:shadow-none ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`mb-4 border-b border-neutral-100 pb-3 dark:border-neutral-700 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={`text-lg font-semibold text-neutral-900 dark:text-neutral-50 ${className}`} {...props} />;
}
