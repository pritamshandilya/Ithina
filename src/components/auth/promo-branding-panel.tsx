import { motion } from "framer-motion";

import ithinaLogo from "@/assets/ithina_logo.png";

/**
 * Left hero column for login and post-login auth steps (e.g. store selection).
 * Kept identical so branding and feature highlights stay static across the flow.
 */
export function PromoBrandingPanel() {
  return (
    <div className="relative hidden items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1a1040] to-[#0f172a] lg:flex lg:w-1/2">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute left-1/3 top-1/4 h-96 w-96 rounded-full bg-[#9810fa]/20 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-indigo-600/15 blur-[100px]" />

      <div className="relative z-10 max-w-lg px-12 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mx-auto mb-8 flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-black shadow-2xl shadow-purple-900/50"
        >
          <img alt="Ithina Logo" className="h-full w-full object-contain" src={ithinaLogo} />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-4 text-4xl font-bold leading-tight text-white"
        >
          Promotions
          <br />
          Assistant
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-8 text-lg text-slate-400"
        >
          AI-powered promotions and campaign orchestration for modern retail.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex justify-center gap-8 text-center"
        >
          <div>
            <div className="text-2xl font-bold text-[#c77dff]">AI</div>
            <div className="mt-1 text-[11px] text-slate-500">Campaign Insights</div>
          </div>
          <div className="h-10 w-px bg-slate-700" />
          <div>
            <div className="text-2xl font-bold text-[#c77dff]">ROOS</div>
            <div className="mt-1 text-[11px] text-slate-500">Store Signals</div>
          </div>
          <div className="h-10 w-px bg-slate-700" />
          <div>
            <div className="text-2xl font-bold text-[#c77dff]">100%</div>
            <div className="mt-1 text-[11px] text-slate-500">Guardrails</div>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-6 left-0 right-0 text-center text-[11px] text-slate-600">
        Powered by Gemini AI
      </div>
    </div>
  );
}
