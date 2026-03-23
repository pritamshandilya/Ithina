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
            "bg-slate-950/95 text-slate-50 border border-slate-800 shadow-xl backdrop-blur-md",
          title: "text-sm font-semibold text-slate-50",
          description: "text-sm text-slate-300",
          actionButton: "bg-slate-50 text-slate-950 hover:bg-slate-200",
          cancelButton: "bg-slate-800 text-slate-200 hover:bg-slate-700",
        },
      }}
    />
  );
}
