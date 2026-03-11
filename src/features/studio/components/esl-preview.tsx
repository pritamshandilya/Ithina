import type { HardwareDeviceId } from "@/types/studio";

interface EslPreviewProps {
  hw: HardwareDeviceId;
  headerText: string;
  headerClass: string;
  product29Text: string;
  price29Text: string;
  lcdBgUrl: string;
  isScanning: boolean;
}

function ScanLine({ fast }: { fast?: boolean }) {
  return (
    <div className="absolute inset-0 z-50 overflow-hidden border-2 border-red-500/60 bg-red-500/5">
      <div
        className="pointer-events-none absolute left-0 h-[3px] w-full bg-red-500 shadow-[0_0_12px_3px_rgba(239,68,68,0.8),0_0_24px_6px_rgba(239,68,68,0.4)]"
        style={{
          animation: `scanline ${fast ? "1.1s" : "1.8s"} linear infinite`,
        }}
      />
    </div>
  );
}

function Chroma42Preview({ headerText, headerClass, isScanning }: Pick<EslPreviewProps, "headerText" | "headerClass" | "isScanning">) {
  return (
    <div className="relative z-10 flex flex-col items-center rounded-xl border border-white/10 bg-[#E2E8F0] p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] transition-all duration-500">
      <div className="relative flex h-[300px] w-[400px] flex-col overflow-hidden border border-slate-400 bg-[#F9F9F9]" style={{ imageRendering: "pixelated" }}>
        <div className={`flex w-full items-center justify-center border-b-4 border-black bg-[#FF0000] font-bold tracking-widest text-white transition-all duration-500 ${headerClass}`}>
          {headerText}
        </div>
        <div className="flex h-full items-end justify-between p-4 text-black">
          <div className="flex flex-col pb-2">
            <span className="text-2xl font-bold leading-tight">Premium<br />Salmon Tray</span>
            <span className="mt-3 text-sm font-bold line-through">WAS $12.99</span>
          </div>
          <span className="text-[70px] font-bold leading-none tracking-tighter">$10.39</span>
        </div>
        {isScanning && <ScanLine />}
      </div>
      <div className="mt-5 flex w-[400px] items-center justify-between opacity-40">
        <div className="h-4 w-24 rounded-sm bg-black/20" />
        <div className="font-mono text-[9px] font-bold text-black/50">MAC: AA:BB:CC:42</div>
      </div>
    </div>
  );
}

function Chroma29Preview({ headerText, productText, priceText, isScanning }: { headerText: string; productText: string; priceText: string; isScanning: boolean }) {
  return (
    <div className="relative z-10 flex flex-col items-center rounded-xl border border-white/10 bg-[#E2E8F0] p-6 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] transition-all duration-500">
      <div className="relative flex h-[128px] w-[296px] flex-col overflow-hidden border border-slate-400 bg-[#F9F9F9] transition-all duration-500" style={{ imageRendering: "pixelated" }}>
        <div className="flex h-5 w-full items-center justify-center border-b border-black bg-[#FF0000] text-[9px] font-bold tracking-widest text-white transition-all duration-500">
          {headerText}
        </div>
        <div className="flex h-full items-center justify-between p-2 text-black">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold leading-tight transition-all duration-500">{productText}</span>
            <span className="mt-1 text-[9px] line-through">WAS $12.99</span>
          </div>
          <span className="text-[32px] font-bold leading-none tracking-tighter transition-all duration-500">{priceText}</span>
        </div>
        {isScanning && <ScanLine fast />}
      </div>
      <div className="mt-4 flex w-[296px] items-center justify-between opacity-40">
        <div className="h-3 w-16 rounded-sm bg-black/20" />
        <div className="font-mono text-[8px] font-bold text-black/50">MAC: AA:BB:CC:29</div>
      </div>
    </div>
  );
}

function LcdPreview({ lcdBgUrl, isScanning }: { lcdBgUrl: string; isScanning: boolean }) {
  return (
    <div
      className="relative z-10 aspect-video w-full max-w-2xl overflow-hidden rounded-xl border border-slate-700 bg-cover bg-center shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] transition-all duration-1000"
      style={{ backgroundImage: lcdBgUrl }}
    >
      <div className="absolute inset-0 flex items-center bg-gradient-to-r from-black/90 to-transparent p-8">
        <div className="w-1/2 text-white">
          <div className="mb-3 inline-block rounded-sm border border-red-500 bg-red-600 px-3 py-1 text-[10px] font-bold tracking-widest text-white shadow-md">
            EXPIRING IN 48H
          </div>
          <h1 className="mb-2 text-3xl font-extrabold leading-tight">Premium<br />Salmon Tray</h1>
          <span className="text-lg font-bold text-gray-300 line-through">WAS $12.99</span>
          <div className="mt-1 text-6xl font-black tracking-tighter text-white drop-shadow-xl">$10.39</div>
        </div>
      </div>
      <div className="absolute bottom-8 right-8 text-7xl drop-shadow-2xl">🍣</div>
      {isScanning && <ScanLine />}
    </div>
  );
}

export default function EslPreview({ hw, headerText, headerClass, product29Text, price29Text, lcdBgUrl, isScanning }: EslPreviewProps) {
  return (
    <>
      {hw === "chroma42" && <Chroma42Preview headerText={headerText} headerClass={headerClass} isScanning={isScanning} />}
      {hw === "chroma29" && <Chroma29Preview headerText={headerText} productText={product29Text} priceText={price29Text} isScanning={isScanning} />}
      {hw === "lcd" && <LcdPreview lcdBgUrl={lcdBgUrl} isScanning={isScanning} />}
    </>
  );
}
