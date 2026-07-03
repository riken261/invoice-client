// components/ui/notification-badge.tsx

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge.tsx";
import type { ReactNode } from "react";

interface NotificationBadgeProps {
  count: number;
  maxCount?: number;
  children: ReactNode;
  className?: string;
}

export function NotificationBadge({
  count,
  maxCount = 99,
  children,
  className,
}: NotificationBadgeProps) {
  if (count <= 0) return <>{children}</>;

  const display = count > maxCount ? `${maxCount}+` : String(count);

  return (
    <div className={cn("relative inline-flex", className)}>
      {children}
      <Badge
        className={cn(
          "absolute -top-2 -right-2 flex items-center justify-center rounded-full bg-red-500 text-white",
          display.length > 2
            ? "h-5 px-1.5 text-[10px]"
            : "h-5 w-5 p-0 text-[10px]",
        )}
      >
        {display}
      </Badge>
    </div>
  );
}
