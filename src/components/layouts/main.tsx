import { Outlet, useLocation } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";

import Header from "./main/header";
import Sidenav from "./main/sidenav";

export default function MainLayout() {
  const location = useLocation();

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidenav />

        <main className="relative flex flex-1 flex-col overflow-hidden bg-ithina-bg">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex flex-1 flex-col overflow-hidden"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
