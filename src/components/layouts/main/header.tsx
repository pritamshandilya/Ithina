import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center border-b border-border bg-card/80 px-4 backdrop-blur">
      <SidebarTrigger />
    </header>
  );
}
