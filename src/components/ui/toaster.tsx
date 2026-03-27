import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      theme="dark"
      richColors
      closeButton
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "bg-card text-foreground border border-border shadow-xl backdrop-blur-md",
          title: "text-sm font-semibold text-foreground",
          description: "text-sm text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground hover:bg-primary/90",
          cancelButton: "bg-muted text-foreground hover:bg-muted/80",
          success:
            "!bg-chart-2/20 !text-foreground !border !border-chart-2/40",
          error:
            "!bg-destructive/15 !text-foreground !border !border-destructive/40",
          warning:
            "!bg-accent/20 !text-foreground !border !border-accent/40",
          info:
            "!bg-chart-1/20 !text-foreground !border !border-chart-1/40",
        },
      }}
    />
  );
}
