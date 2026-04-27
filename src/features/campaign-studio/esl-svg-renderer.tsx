import type { EslLayoutElement, EslRectElement, EslTextElement } from "@/types/api/campaigns";
import { cn } from "@/lib/utils";

export interface EslPlaceholders {
  name: string;
  price: string;
  was: string;
  offer_label: string;
}

interface EslSvgRendererProps {
  elements: EslLayoutElement[];
  placeholders: EslPlaceholders;
  /** Canvas pixel width — 296 for chroma29, 400 for chroma42 */
  canvasWidth?: number;
  /** Canvas pixel height — 128 for chroma29, 300 for chroma42 */
  canvasHeight?: number;
  className?: string;
}

function interpolate(tpl: string, p: EslPlaceholders): string {
  return tpl
    .replace(/\{name\}/gi, p.name)
    .replace(/\{price\}/gi, p.price)
    .replace(/\{was\}/gi, p.was)
    .replace(/\{offer_label\}/gi, p.offer_label);
}

function resolveTextX(
  el: EslTextElement,
  canvasWidth: number,
): { x: number; textAnchor: "start" | "middle" | "end" } {
  const align = el.align ?? "left";
  if (align === "center") return { x: canvasWidth / 2, textAnchor: "middle" };
  if (align === "right") return { x: canvasWidth - el.x, textAnchor: "end" };
  return { x: el.x, textAnchor: "start" };
}

function RectEl({ el }: { el: EslRectElement }) {
  const rx = el.rounded ? 4 : 0;
  return (
    <rect
      x={el.x}
      y={el.y}
      width={el.x2 - el.x}
      height={el.y2 - el.y}
      fill={el.color}
      rx={rx}
      ry={rx}
    />
  );
}

function TextEl({
  el,
  canvasWidth,
  placeholders,
}: {
  el: EslTextElement;
  canvasWidth: number;
  placeholders: EslPlaceholders;
}) {
  const { x, textAnchor } = resolveTextX(el, canvasWidth);
  const fontWeight = el.bold ? "bold" : "normal";
  const textDecoration = el.strike ? "line-through" : "none";
  const content = interpolate(el.content, placeholders);

  return (
    <text
      x={x}
      y={el.y}
      fontSize={el.font_size}
      fontWeight={fontWeight}
      fill={el.color}
      textAnchor={textAnchor}
      dominantBaseline="hanging"
      textDecoration={textDecoration}
      fontFamily="'Plus Jakarta Sans', 'Arial', sans-serif"
    >
      {content}
    </text>
  );
}

/**
 * Client-side SVG renderer for ESL layout elements.
 * Renders the `elements[]` array from `payload_snapshot.variants` inside a
 * properly clipped viewBox, with placeholder substitution. Replaces the backend
 * PNG `<img>` in EslVariantCard so previews are instant and aspect-correct.
 */
export default function EslSvgRenderer({
  elements,
  placeholders,
  canvasWidth = 296,
  canvasHeight = 128,
  className,
}: EslSvgRendererProps) {
  const clipId = `esl-clip-${canvasWidth}x${canvasHeight}`;
  return (
    <svg
      viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("block", className)}
      style={{ imageRendering: "pixelated" }}
      aria-hidden
    >
      <defs>
        <clipPath id={clipId}>
          <rect width={canvasWidth} height={canvasHeight} />
        </clipPath>
      </defs>
      {/* e-ink base */}
      <rect width={canvasWidth} height={canvasHeight} fill="#F9F9F9" />
      <g clipPath={`url(#${clipId})`}>
        {elements.map((el, i) => {
          if (el.type === "rect") {
            return <RectEl key={i} el={el} />;
          }
          if (el.type === "text") {
            return (
              <TextEl
                key={i}
                el={el}
                canvasWidth={canvasWidth}
                placeholders={placeholders}
              />
            );
          }
          return null;
        })}
      </g>
    </svg>
  );
}
