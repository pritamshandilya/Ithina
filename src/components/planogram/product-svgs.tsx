/**
 * Category-based SVG product shapes for planogram visualization
 * Each shape accepts fill (main body) and accent (cap, label, etc.)
 */

export interface ProductSVGProps {
  fill: string;
  accent: string;
  className?: string;
}

const svgBase = "size-full min-h-8";

/** Standard bottle shape (water, juices) */
export function BottleSVG({ fill, accent, className }: ProductSVGProps) {
  return (
    <svg
      viewBox="0 0 24 32"
      className={`${svgBase} ${className ?? ""}`}
      preserveAspectRatio="xMidYMax meet"
    >
      <path d="M8 2h8v4H8V2z" fill={accent} stroke={accent} strokeWidth="0.5" />
      <path d="M7 6h10v22H7V6z" fill={fill} stroke={accent} strokeWidth="0.5" />
      <ellipse cx="12" cy="28" rx="4" ry="2" fill={accent} opacity={0.8} stroke={accent} strokeWidth="0.5" />
    </svg>
  );
}

/** Can shape (soft drinks) */
export function CanSVG({ fill, accent, className }: ProductSVGProps) {
  return (
    <svg
      viewBox="0 0 24 32"
      className={`${svgBase} ${className ?? ""}`}
      preserveAspectRatio="xMidYMax meet"
    >
      <rect x="4" y="2" width="16" height="4" rx="1" fill={accent} stroke={accent} strokeWidth="0.5" />
      <rect x="4" y="6" width="16" height="22" rx="2" fill={fill} stroke={accent} strokeWidth="0.5" />
      <ellipse cx="12" cy="28" rx="6" ry="2" fill={accent} opacity={0.8} stroke={accent} strokeWidth="0.5" />
    </svg>
  );
}

/** Chip/snack bag – pouch shape (standing) */
export function ChipBagSVG({ fill, accent, className }: ProductSVGProps) {
  return (
    <svg
      viewBox="0 0 24 32"
      className={`${svgBase} ${className ?? ""}`}
      preserveAspectRatio="xMidYMax meet"
    >
      <path
        d="M5 4h14v24c0 2-2 4-7 4s-7-2-7-4V4z"
        fill={fill}
        stroke={accent}
        strokeWidth="0.5"
      />
      <rect x="9" y="8" width="6" height="4" rx="0.5" fill={accent} opacity={0.6} stroke={accent} strokeWidth="0.5" />
    </svg>
  );
}

/** Carton (milk, juice boxes) */
export function CartonSVG({ fill, accent, className }: ProductSVGProps) {
  return (
    <svg
      viewBox="0 0 24 32"
      className={`${svgBase} ${className ?? ""}`}
      preserveAspectRatio="xMidYMax meet"
    >
      <path d="M4 2h16l2 6v20H2V8l2-6z" fill={fill} stroke={accent} strokeWidth="0.5" />
      <path d="M4 2v6h16V2" fill={accent} opacity={0.8} stroke={accent} strokeWidth="0.5" />
      <rect x="8" y="12" width="8" height="6" rx="1" fill={accent} opacity={0.6} stroke={accent} strokeWidth="0.5" />
    </svg>
  );
}

/** Large bottle (2L, etc.) */
export function LargeBottleSVG({ fill, accent, className }: ProductSVGProps) {
  return (
    <svg
      viewBox="0 0 28 36"
      className={`${svgBase} ${className ?? ""}`}
      preserveAspectRatio="xMidYMax meet"
    >
      <path d="M10 0h8v6H10V0z" fill={accent} stroke={accent} strokeWidth="0.5" />
      <path d="M6 6h16v26H6V6z" fill={fill} stroke={accent} strokeWidth="0.5" />
      <ellipse cx="14" cy="32" rx="6" ry="2" fill={accent} opacity={0.8} stroke={accent} strokeWidth="0.5" />
    </svg>
  );
}

/** Aperitif/snack bag */
export function AperitifBagSVG({ fill, accent, className }: ProductSVGProps) {
  return (
    <svg
      viewBox="0 0 24 28"
      className={`${svgBase} ${className ?? ""}`}
      preserveAspectRatio="xMidYMax meet"
    >
      <path
        d="M5 2h14v4H5V2zm0 4h14v20H5V6z"
        fill={fill}
        stroke={accent}
        strokeWidth="1"
      />
      <rect x="9" y="10" width="6" height="3" rx="0.5" fill={accent} opacity={0.7} />
    </svg>
  );
}

/** Chips bag (wider pouch) */
export function ChipsBagSVG({ fill, accent, className }: ProductSVGProps) {
  return (
    <svg
      viewBox="0 0 28 32"
      className={`${svgBase} ${className ?? ""}`}
      preserveAspectRatio="xMidYMax meet"
    >
      <path
        d="M6 4h16v24c0 2-2 4-8 4s-8-2-8-4V4z"
        fill={fill}
        stroke={accent}
        strokeWidth="0.5"
      />
      <rect x="11" y="8" width="6" height="4" rx="0.5" fill={accent} opacity={0.6} stroke={accent} strokeWidth="0.5" />
    </svg>
  );
}

/** Coffee bag */
export function CoffeeBagSVG({ fill, accent, className }: ProductSVGProps) {
  return (
    <svg
      viewBox="0 0 24 30"
      className={`${svgBase} ${className ?? ""}`}
      preserveAspectRatio="xMidYMax meet"
    >
      <path d="M6 2h12v4H6V2zm0 4h12v22H6V6z" fill={fill} stroke={accent} strokeWidth="0.5" />
      <rect x="8" y="10" width="8" height="4" rx="1" fill={accent} opacity={0.8} stroke={accent} strokeWidth="0.5" />
    </svg>
  );
}

/** Cereal box */
export function CerealBoxSVG({ fill, accent, className }: ProductSVGProps) {
  return (
    <svg
      viewBox="0 0 24 32"
      className={`${svgBase} ${className ?? ""}`}
      preserveAspectRatio="xMidYMax meet"
    >
      <rect x="4" y="2" width="16" height="26" rx="1" fill={fill} stroke={accent} strokeWidth="0.5" />
      <rect x="6" y="4" width="12" height="6" rx="0.5" fill={accent} opacity={0.8} stroke={accent} strokeWidth="0.5" />
    </svg>
  );
}

/** Baby care product (bottle/tube) */
export function BabyCareSVG({ fill, accent, className }: ProductSVGProps) {
  return (
    <svg
      viewBox="0 0 20 32"
      className={`${svgBase} ${className ?? ""}`}
      preserveAspectRatio="xMidYMax meet"
    >
      <path d="M6 0h8v6H6V0z" fill={accent} stroke={accent} strokeWidth="0.5" />
      <path d="M5 6h10v22H5V6z" fill={fill} stroke={accent} strokeWidth="0.5" />
      <ellipse cx="10" cy="28" rx="3" ry="2" fill={accent} opacity={0.8} stroke={accent} strokeWidth="0.5" />
    </svg>
  );
}

/** First aid (box/kit) */
export function FirstAidSVG({ fill, accent, className }: ProductSVGProps) {
  return (
    <svg
      viewBox="0 0 24 28"
      className={`${svgBase} ${className ?? ""}`}
      preserveAspectRatio="xMidYMax meet"
    >
      <rect x="4" y="2" width="16" height="24" rx="2" fill={fill} stroke={accent} strokeWidth="0.5" />
      <path
        d="M12 8v8m-4-4h8"
        stroke={accent}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Razor pack (grooming) */
export function RazorPackSVG({ fill, accent, className }: ProductSVGProps) {
  return (
    <svg
      viewBox="0 0 24 20"
      className={`${svgBase} ${className ?? ""}`}
      preserveAspectRatio="xMidYMax meet"
    >
      <rect x="2" y="2" width="20" height="16" rx="2" fill={fill} stroke={accent} strokeWidth="0.5" />
      <rect x="6" y="6" width="12" height="8" rx="1" fill={accent} opacity={0.8} stroke={accent} strokeWidth="0.5" />
    </svg>
  );
}

/** Energy drink can (tall, slim) */
export function EnergyDrinkCanSVG({ fill, accent, className }: ProductSVGProps) {
  return (
    <svg
      viewBox="0 0 20 36"
      className={`${svgBase} ${className ?? ""}`}
      preserveAspectRatio="xMidYMax meet"
    >
      <rect x="2" y="2" width="16" height="6" rx="1" fill={accent} stroke={accent} strokeWidth="0.5" />
      <rect x="2" y="8" width="16" height="24" rx="2" fill={fill} stroke={accent} strokeWidth="0.5" />
      <ellipse cx="10" cy="32" rx="5" ry="2" fill={accent} opacity={0.8} stroke={accent} strokeWidth="0.5" />
    </svg>
  );
}

