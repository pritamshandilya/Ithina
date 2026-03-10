import { Outlet } from "@tanstack/react-router";

import Header from "./main/header";
import Sidenav from "./main/sidenav";

export default function MainLayout() {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidenav />

        <main className="flex flex-1 flex-col overflow-hidden bg-ithina-bg">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
