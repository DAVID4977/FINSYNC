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

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white rounded-xl p-2.5 shadow-lg">
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          {/* Modern Finance Icon with GST Elements */}
          <rect x="3" y="4" width="18" height="16" rx="2" className="fill-white/10" />
          <path d="M7 8h6" strokeLinecap="round" />
          <path d="M7 12h8" strokeLinecap="round" />
          <path d="M7 16h4" strokeLinecap="round" />
          <circle cx="17" cy="12" r="2" className="fill-cyan-400/20 stroke-cyan-300" strokeWidth="1" />
          <path d="M16 10l2 2 2-2" strokeLinecap="round" strokeLinejoin="round" className="stroke-cyan-300" strokeWidth="1" />
          {/* Tax/Compliance indicator */}
          <rect x="15" y="6" width="6" height="2" rx="1" className="fill-emerald-400/30" />
        </svg>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
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
    <div className={cn("relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white rounded-xl p-3 shadow-lg", sizeClasses[size], className)}>
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        {/* Professional Finance Document Icon */}
        <rect x="3" y="4" width="18" height="16" rx="2" className="fill-white/10" />
        <path d="M7 8h6" strokeLinecap="round" />
        <path d="M7 12h8" strokeLinecap="round" />
        <path d="M7 16h4" strokeLinecap="round" />
        <circle cx="17" cy="12" r="2" className="fill-cyan-400/20 stroke-cyan-300" strokeWidth="1" />
        <path d="M16 10l2 2 2-2" strokeLinecap="round" strokeLinejoin="round" className="stroke-cyan-300" strokeWidth="1" />
        {/* Tax/GST compliance indicator */}
        <rect x="15" y="6" width="6" height="2" rx="1" className="fill-emerald-400/30" />
      </svg>
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
    </div>
  );
}