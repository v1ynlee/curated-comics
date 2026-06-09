import { cn } from '@/lib/utils/cn';

export interface StatStripItem {
  label: string;
  value: number | string;
}

interface StatStripProps {
  items: StatStripItem[];
  className?: string;
}

export function StatStrip({ items, className }: StatStripProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-2 text-sm md:grid-cols-5', className)}>
      {items.map((item) => (
        <div key={item.label} className="rounded-md border border-white/10 bg-bg-surface/35 px-3 py-2">
          <div className="font-data text-lg text-text-primary">{item.value}</div>
          <div className="text-xs text-text-tertiary">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
