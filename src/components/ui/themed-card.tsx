import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface ThemedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glow" | "primary" | "accent";
}

const ThemedCard = forwardRef<HTMLDivElement, ThemedCardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-3xl border bg-card text-card-foreground shadow-sm transition-all duration-300",
          variant === "glow" && "card-glow hover:border-primary/50",
          variant === "primary" && "border-primary/30 bg-gradient-to-br from-card to-primary/10",
          variant === "accent" && "border-accent/30 bg-gradient-to-br from-card to-accent/10",
          className
        )}
        {...props}
      />
    );
  }
);
ThemedCard.displayName = "ThemedCard";

const ThemedCardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1 sm:space-y-1.5 p-3 sm:p-6", className)}
      {...props}
    />
  )
);
ThemedCardHeader.displayName = "ThemedCardHeader";

const ThemedCardTitle = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "font-heading text-base sm:text-2xl font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  )
);
ThemedCardTitle.displayName = "ThemedCardTitle";

const ThemedCardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-xs sm:text-sm text-muted-foreground", className)}
      {...props}
    />
  )
);
ThemedCardDescription.displayName = "ThemedCardDescription";

const ThemedCardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-3 sm:p-6 pt-0", className)} {...props} />
  )
);
ThemedCardContent.displayName = "ThemedCardContent";

const ThemedCardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-3 sm:p-6 pt-0", className)}
      {...props}
    />
  )
);
ThemedCardFooter.displayName = "ThemedCardFooter";

export { ThemedCard, ThemedCardHeader, ThemedCardFooter, ThemedCardTitle, ThemedCardDescription, ThemedCardContent };