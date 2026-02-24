import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LogoText({ className, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl"
  };

  const logoSizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10", 
    lg: "w-12 h-12"
  };

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <div className="relative">
        <img 
          src="/logo.svg" 
          alt="FinSync Logo" 
          className={cn("object-contain", logoSizeClasses[size])}
        />
      </div>
      <div className="flex flex-col">
        <span className={cn("font-bold text-white aesthetic-heading tracking-tight", sizeClasses[size])}>
          FinSync
        </span>
      </div>
    </div>
  );
}

export function Logo({ className, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  };

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <img 
        src="/logo.svg" 
        alt="FinSync Logo" 
        className="w-full h-full object-contain"
      />
    </div>
  );
}