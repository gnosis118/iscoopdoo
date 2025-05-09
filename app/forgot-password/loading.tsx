import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="container max-w-md mx-auto py-10 flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
