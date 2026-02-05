import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/cn"

interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  message: string
}

export function ErrorState({ message, className, ...props }: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center",
        className
      )}
      {...props}
    >
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
}
