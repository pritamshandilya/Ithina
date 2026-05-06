import { motion } from "framer-motion";

import logo from "@/assets/logo.avif";

interface AuthBrandPanelStat {
  value: string;
  label: string;
}

interface AuthBrandPanelProps {
  titleLines: [string, string];
  subtitle: string;
  stats: [AuthBrandPanelStat, AuthBrandPanelStat, AuthBrandPanelStat];
  footerText?: string;
}

export function AuthBrandPanel({
  titleLines,
  subtitle,
  stats,
  footerText = "Powered by Gemini AI",
}: AuthBrandPanelProps) {
  return (
    <div className="relative hidden items-center justify-center overflow-hidden bg-linear-to-br from-[#0f172a] via-[#1a1040] to-[#0f172a] lg:flex lg:w-1/2">
      <div className="bg-[linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)] absolute inset-0 bg-size-[40px_40px] opacity-[0.04]" />
      <div className="bg-accent/20 absolute top-1/4 left-1/3 h-96 w-96 rounded-full blur-[120px]" />
      <div className="bg-accent/10 absolute right-1/4 bottom-1/4 h-72 w-72 rounded-full blur-[100px]" />

      <div className="relative z-10 max-w-lg px-12 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="shadow-accent/45 mx-auto mb-8 flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-black shadow-2xl"
        >
          <img
            alt="Ithina Logo"
            className="h-full w-full object-contain"
            src={logo}
          />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-4 text-4xl leading-tight font-bold text-white"
        >
          {titleLines[0]}
          <br />
          {titleLines[1]}
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-muted-foreground mb-8 text-lg"
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex justify-center gap-8 text-center"
        >
          <div>
            <div className="text-accent text-2xl font-bold">
              {stats[0].value}
            </div>
            <div className="text-muted-foreground mt-1 text-[11px]">
              {stats[0].label}
            </div>
          </div>
          <div className="h-10 w-px bg-slate-700" />
          <div>
            <div className="text-accent text-2xl font-bold">
              {stats[1].value}
            </div>
            <div className="text-muted-foreground mt-1 text-[11px]">
              {stats[1].label}
            </div>
          </div>
          <div className="h-10 w-px bg-slate-700" />
          <div>
            <div className="text-accent text-2xl font-bold">
              {stats[2].value}
            </div>
            <div className="text-muted-foreground mt-1 text-[11px]">
              {stats[2].label}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="text-muted-foreground/60 absolute right-0 bottom-6 left-0 text-center text-[11px]">
        {footerText}
      </div>
    </div>
  );
}
