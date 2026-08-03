import { cn } from "../../lib/utils";

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[rgba(28,23,20,0.1)]", className)}
      {...props}
    />
  );
}

export { Skeleton };
