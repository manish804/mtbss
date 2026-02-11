import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageLoaderProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export function PageLoader({
  size = "lg",
  text = "Loading...",
  className
}: PageLoaderProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={cn(
      "flex min-h-[400px] items-center justify-center",
      className
    )}>
      <div className="text-center space-y-4">
        <Loader2 className={cn(
          "animate-spin text-primary mx-auto",
          sizeClasses[size]
        )} />
        {text && (
          <p className="text-muted-foreground text-sm">
            {text}
          </p>
        )}
      </div>
    </div>
  );
}

export default PageLoader;