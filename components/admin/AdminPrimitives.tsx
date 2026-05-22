import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl font-bold tracking-normal text-gray-950">{title}</h2>
        {description && <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function AdminStatCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  detail?: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-lg border border-emerald-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-950">{value}</p>
          {detail && <p className="mt-1 text-xs text-gray-500">{detail}</p>}
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
          <Icon size={20} />
        </span>
      </div>
    </div>
  );
}

export function AdminSection({
  title,
  description,
  children,
  action,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-emerald-100 bg-white p-5 shadow-sm">
      {(title || description || action) && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title && <h3 className="font-bold text-gray-950">{title}</h3>}
            {description && <p className="mt-1 text-sm leading-6 text-gray-600">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function AdminBadge({ children, tone = 'green' }: { children: ReactNode; tone?: 'green' | 'gray' | 'amber' }) {
  const tones = {
    green: 'border-emerald-100 bg-emerald-50 text-emerald-800',
    gray: 'border-gray-200 bg-gray-50 text-gray-700',
    amber: 'border-amber-100 bg-amber-50 text-amber-800',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-emerald-200 bg-emerald-50/40 p-8 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-sm">
        <Icon size={22} />
      </div>
      <p className="font-semibold text-gray-950">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-gray-600">{description}</p>
    </div>
  );
}
