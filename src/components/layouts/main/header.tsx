import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center border-b border-border bg-card/80 px-4 backdrop-blur">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="size-9 rounded-md border border-border bg-card hover:bg-accent/40" />
        <span className="text-sm font-medium text-muted-foreground">Menu</span>
      </div>
    </header>
  );
}
