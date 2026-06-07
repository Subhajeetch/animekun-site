import type { ReactNode } from "react";

interface SectionTitleProps {
  id?: string;
  icon?: ReactNode;
  children: ReactNode;
  action?: ReactNode;
}

export default function SectionTitle({ id, icon, children, action }: SectionTitleProps) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="h-8 w-1.5 shrink-0 bg-primary" aria-hidden="true" />
        <h2
          id={id}
          className="flex min-w-0 items-center gap-2 text-base font-black uppercase tracking-normal text-white md:text-lg"
        >
          {icon}
          <span className="truncate">{children}</span>
        </h2>
      </div>
      {action}
    </div>
  );
}