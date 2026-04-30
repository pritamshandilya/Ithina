import {
  Activity,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  ShoppingCart,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import "./promo-suggestion-carousel.css";

const SUGGESTIONS_PER_PAGE = 3;
const MAX_PAGE_INDEX = 19;

type SuggestionKind = "campaigns" | "promote" | "stock" | "modify" | "remove" | "extend" | "preview" | "confirm" | "other";
type Accent = "purple" | "teal" | "coral" | "amber" | "blue";

interface SuggestionMeta {
  label: string;
  color: Accent;
  Icon: LucideIcon;
}

const SUGGESTION_META: Record<SuggestionKind, SuggestionMeta> = {
  campaigns: {
    label: "Campaigns",
    color: "purple",
    Icon: CalendarDays,
  },
  promote: {
    label: "Promote",
    color: "teal",
    Icon: ShoppingCart,
  },
  stock: {
    label: "Stock",
    color: "amber",
    Icon: Activity,
  },
  modify: {
    label: "Modify",
    color: "teal",
    Icon: Pencil,
  },
  remove: {
    label: "Remove",
    color: "coral",
    Icon: Trash2,
  },
  extend: {
    label: "Extend",
    color: "blue",
    Icon: CalendarDays,
  },
  preview: {
    label: "Preview",
    color: "blue",
    Icon: Eye,
  },
  confirm: {
    label: "Confirm",
    color: "purple",
    Icon: Check,
  },
  other: {
    label: "Action",
    color: "purple",
    Icon: Sparkles,
  },
};

/** Matches chip tags on cards — each kind gets one row in “Quick action cards”. */
const HELP_GUIDE_ORDER: SuggestionKind[] = [
  "campaigns",
  "promote",
  "stock",
  "modify",
  "extend",
  "preview",
  "confirm",
  "remove",
  "other",
];

const HELP_DESCRIPTIONS: Record<SuggestionKind, string> = {
  campaigns: "Browse active & scheduled campaigns so your ask lines up with what's live.",
  promote: "Call out categories, products or perks you want spotlighted next.",
  stock: "Check inventory, lows or expiry risk before locking in quantities or lifts.",
  modify: "Adjust discounts, quantities or dates on existing items.",
  extend: "Move launch or start windows or add extra days without restarting from scratch.",
  preview: "Review deal shape, tiers or totals before saying yes.",
  confirm: "Lock in assistant suggestions (\"yes\", proceed, ship it) once you're ready.",
  remove: "Drop SKUs or offers that should no longer be in the staged promotion.",
  other: "Open-ended intents — rephrase freely; context steers routing.",
};

const POP_CLASSES_BY_ACCENT: Record<Accent, { ico: string; name: string }> = {
  purple: { ico: "psc-pop-ico-v", name: "psc-pop-name-v" },
  teal: { ico: "psc-pop-ico-teal", name: "psc-pop-name-teal" },
  amber: { ico: "psc-pop-ico-amber", name: "psc-pop-name-amber" },
  blue: { ico: "psc-pop-ico-blue", name: "psc-pop-name-blue" },
  coral: { ico: "psc-pop-ico-r", name: "psc-pop-name-r" },
};

interface PromoSuggestionCarouselProps {
  chips: string[];
  onPick: (text: string) => void;
}

function inferSuggestionKind(text: string): SuggestionKind {
  const s = text.trim().toLowerCase();
  if (!s) return "other";
  if (/\b(active campaigns?|campaigns?)\b/i.test(s)) return "campaigns";
  if (/\b(promote|promotion|snacks?|category|perks?)\b/i.test(s)) return "promote";
  if (/\b(stock|inventory|low stock|sku levels?)\b/i.test(s)) return "stock";
  if (/\b(remove|delete|drop|exclude|take\s+out|omit)\b/i.test(s)) return "remove";
  if (/\bpreview\b|review\s+before/i.test(s)) return "preview";
  if (
    /\b(yes,?|launch\s+this|go\s+ahead|apply\s+this|proceed)\b/i.test(s) ||
    /^yes\b/i.test(s)
  ) {
    return "confirm";
  }
  if (
    /\b(push|reschedule|postpone)\b.*\b(launch|start|date)\b/i.test(s) ||
    /\b(launch|start)\b.*\b(to|until|by)\b/i.test(s) ||
    /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|next\s+week)\b/i.test(s) ||
    /\bextend(\s+by)?\b.*\bday/i.test(s) ||
    /\b\d+\s+more\s+days?\b/i.test(s)
  ) {
    return "extend";
  }
  if (
    /\b(discount|bogo|increase|lower|reduce|change|rename|make\s+it|add\s+to|switch\s+to|adjust)\b/i.test(s) ||
    /\bname\s+to\b/i.test(s)
  ) {
    return "modify";
  }
  return "other";
}

function maxPageFor(chipCount: number): number {
  return Math.min(Math.max(0, Math.ceil(chipCount / SUGGESTIONS_PER_PAGE) - 1), MAX_PAGE_INDEX);
}

function HelpRow({
  className,
  description,
  iconClassName,
  Icon,
  title,
}: {
  className: string;
  description: string;
  iconClassName: string;
  Icon: LucideIcon;
  title: string;
}) {
  return (
    <div className="psc-pop-row">
      <div className={cn("psc-pop-ico", iconClassName)}>
        <Icon aria-hidden />
      </div>
      <div>
        <div className={cn("psc-pop-name", className)}>{title}</div>
        <div className="psc-pop-desc">{description}</div>
      </div>
    </div>
  );
}

const TRACK_H_PADDING = 4; // must match `.psc-track` horizontal padding in CSS
const CARD_GAP = 8; // px gap between cards

export default function PromoSuggestionCarousel({ chips, onPick }: PromoSuggestionCarouselProps) {
  const [page, setPage] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);
  const helpRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // Measured card width — starts at HTML-reference fallback, updated by ResizeObserver
  const [cardWidth, setCardWidth] = useState(84);

  const totalPages = useMemo(() => maxPageFor(chips.length) + 1, [chips.length]);
  const safePage = Math.min(page, totalPages - 1);

  // Each page step in px = 3 cards × (cardWidth + gap)
  const trackStep = SUGGESTIONS_PER_PAGE * (cardWidth + CARD_GAP);
  const trackTranslateX = safePage * trackStep;

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const compute = () => {
      const stageW = el.offsetWidth;
      if (stageW <= 32) return;
      // Distribute available width evenly across SUGGESTIONS_PER_PAGE cards
      // Available = stageWidth − 2×TRACK_H_PADDING − (N−1)×CARD_GAP
      const available = stageW - 2 * TRACK_H_PADDING - (SUGGESTIONS_PER_PAGE - 1) * CARD_GAP;
      setCardWidth(Math.max(60, Math.floor(available / SUGGESTIONS_PER_PAGE)));
    };
    compute();
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(compute);
      ro.observe(el);
      return () => ro.disconnect();
    }
  }, []);

  useEffect(() => {
    if (!helpOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (helpRef.current?.contains(event.target as Node)) return;
      setHelpOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [helpOpen]);

  if (chips.length === 0) return null;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="psc-shell" role="group" aria-label="Quick reply suggestions">
        <div className="psc-body">
          <div className="psc-carousel-row">
            <div className="psc-arrow-slot">
              <button
                type="button"
                className="psc-arrow"
                aria-label="Previous suggestions"
                disabled={safePage === 0}
                onClick={() => setPage((current) => Math.max(0, current - 1))}
              >
                <ChevronLeft aria-hidden />
              </button>
            </div>

            <div className="psc-viewport" ref={stageRef}>
              <div
                className="psc-track"
                data-page={safePage}
                data-testid="promo-suggestion-track"
                style={{ transform: `translateX(-${trackTranslateX}px)` }}
              >
                {chips.map((chip, index) => {
                  const meta = SUGGESTION_META[inferSuggestionKind(chip)];
                  const { Icon } = meta;
                  return (
                    <TooltipPrimitive.Root key={`${index}-${chip.slice(0, 48)}`} delayDuration={0}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          aria-label={chip}
                          className={cn("psc-card", `psc-card-${meta.color}`)}
                          style={{ flex: `0 0 ${cardWidth}px`, width: `${cardWidth}px` }}
                          onClick={() => onPick(chip)}
                        >
                          <span className={cn("psc-ico", `psc-ico-${meta.color}`)}>
                            <Icon aria-hidden />
                          </span>
                          <span className="psc-card-text">
                            <span className="psc-tag">{meta.label}</span>
                            <span className="psc-title">{chip}</span>
                          </span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        sideOffset={10}
                        collisionPadding={12}
                        avoidCollisions
                        className="psc-tooltip psc-tooltip-card"
                      >
                        {chip}
                      </TooltipContent>
                    </TooltipPrimitive.Root>
                  );
                })}
              </div>
            </div>

            <div className="psc-arrow-slot">
              <button
                type="button"
                className="psc-arrow"
                aria-label="Next suggestions"
                disabled={safePage === totalPages - 1}
                onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
              >
                <ChevronRight aria-hidden />
              </button>
            </div>
          </div>

          <div className="psc-dots" role="tablist" aria-label="Suggestion pages">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={index === safePage}
                aria-label={`Suggestions page ${index + 1} of ${totalPages}`}
                className={cn("psc-dot", index === safePage && "psc-dot-active")}
                onClick={() => setPage(index)}
              />
            ))}
          </div>

          <div className="psc-help-wrap" ref={helpRef}>
            <TooltipPrimitive.Root delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="psc-help-btn"
                  aria-label="How these quick actions work"
                  aria-expanded={helpOpen}
                  aria-controls="promo-suggestion-help"
                  onClick={(event) => {
                    event.stopPropagation();
                    setHelpOpen((open) => !open);
                  }}
                >
                  ?
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" sideOffset={8} className="psc-tooltip psc-tooltip-help">
                How these quick actions work
              </TooltipContent>
            </TooltipPrimitive.Root>
            <div
              id="promo-suggestion-help"
              className={cn("psc-popup", !helpOpen && "psc-popup-hidden")}
              aria-hidden={!helpOpen}
              data-testid="promo-suggestion-help"
            >
              <div className="psc-pop-head">
                <span className="psc-pop-title">Quick action cards</span>
                <button
                  type="button"
                  className="psc-pop-x"
                  aria-label="Close quick action guide"
                  onClick={() => setHelpOpen(false)}
                >
                  <X aria-hidden />
                </button>
              </div>
              <div className="psc-pop-scroll">
                {HELP_GUIDE_ORDER.map((kind) => {
                  const meta = SUGGESTION_META[kind];
                  const accents = POP_CLASSES_BY_ACCENT[meta.color];
                  return (
                    <HelpRow
                      key={kind}
                      Icon={meta.Icon}
                      className={accents.name}
                      description={HELP_DESCRIPTIONS[kind]}
                      iconClassName={accents.ico}
                      title={meta.label.toUpperCase()}
                    />
                  );
                })}
              </div>
              <div className="psc-pop-foot">
                <button type="button" className="psc-got-btn" onClick={() => setHelpOpen(false)}>
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
