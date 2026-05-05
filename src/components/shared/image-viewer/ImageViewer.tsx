import {
  Expand,
  ImageIcon,
  RefreshCcw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  MouseEvent as ReactMouseEvent,
  ReactNode,
  WheelEvent as ReactWheelEvent,
} from "react";

import { cn } from "@/lib/utils";

export type ImageViewerOverlay = {
  id: string;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  label?: string;
  color: string;
};

interface ImageViewerProps {
  imageUrl: string;
  overlays?: ImageViewerOverlay[];
  className?: string;
}

const MIN_SCALE = 0.2;
const MAX_SCALE = 5;

export function ImageViewer({
  imageUrl,
  overlays = [],
  className,
}: ImageViewerProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef(false);
  const dragOriginRef = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const shouldAutoFitRef = useRef(true);

  const [isLoaded, setIsLoaded] = useState(false);
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [stageSize, setStageSize] = useState({ width: 1, height: 1 });

  const zoomPct = Math.round(scale * 100);

  const measureStage = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    setStageSize({
      width: Math.max(stage.clientWidth, 1),
      height: Math.max(stage.clientHeight, 1),
    });
  }, []);

  useEffect(() => {
    measureStage();
    window.addEventListener("resize", measureStage);
    return () => window.removeEventListener("resize", measureStage);
  }, [measureStage]);

  useEffect(() => {
    shouldAutoFitRef.current = true;
    setIsLoaded(false);
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setIsLoaded(true);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const clampedOffsets = useMemo(() => {
    const img = imageRef.current;
    if (!img) return { x: offsetX, y: offsetY };
    const drawnW = img.naturalWidth * scale;
    const drawnH = img.naturalHeight * scale;
    const minX = Math.min(stageSize.width - drawnW, 0);
    const maxX = Math.max(stageSize.width - drawnW, 0);
    const minY = Math.min(stageSize.height - drawnH, 0);
    const maxY = Math.max(stageSize.height - drawnH, 0);
    return {
      x: Math.min(maxX, Math.max(minX, offsetX)),
      y: Math.min(maxY, Math.max(minY, offsetY)),
    };
  }, [offsetX, offsetY, scale, stageSize.height, stageSize.width]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !isLoaded) return;
    canvas.width = stageSize.width;
    canvas.height = stageSize.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, stageSize.width, stageSize.height);
    ctx.drawImage(
      img,
      clampedOffsets.x,
      clampedOffsets.y,
      img.naturalWidth * scale,
      img.naturalHeight * scale,
    );

    overlays.forEach((overlay) => {
      const x =
        clampedOffsets.x + (overlay.xPercent / 100) * img.naturalWidth * scale;
      const y =
        clampedOffsets.y + (overlay.yPercent / 100) * img.naturalHeight * scale;
      const width = (overlay.widthPercent / 100) * img.naturalWidth * scale;
      const height = (overlay.heightPercent / 100) * img.naturalHeight * scale;

      ctx.strokeStyle = overlay.color;
      ctx.lineWidth = Math.max(1.5, scale * 1.2);
      ctx.strokeRect(x, y, width, height);

      if (overlay.label) {
        const text = overlay.label;
        ctx.font = "11px Inter, system-ui, sans-serif";
        const textW = ctx.measureText(text).width + 8;
        const textH = 16;
        ctx.fillStyle = "rgba(2, 6, 23, 0.78)";
        ctx.fillRect(x, Math.max(0, y - textH), textW, textH);
        ctx.fillStyle = "rgba(248, 250, 252, 0.95)";
        ctx.fillText(text, x + 4, Math.max(12, y - 4));
      }
    });
  }, [
    clampedOffsets.x,
    clampedOffsets.y,
    isLoaded,
    overlays,
    scale,
    stageSize.height,
    stageSize.width,
  ]);

  const fitToView = useCallback(() => {
    const img = imageRef.current;
    if (!img) return;
    if (stageSize.width <= 1 || stageSize.height <= 1) return;
    const sx = stageSize.width / img.naturalWidth;
    const sy = stageSize.height / img.naturalHeight;
    const nextScale = Math.min(sx, sy);
    setScale(nextScale);
    setOffsetX((stageSize.width - img.naturalWidth * nextScale) / 2);
    setOffsetY((stageSize.height - img.naturalHeight * nextScale) / 2);
  }, [stageSize.height, stageSize.width]);

  useEffect(() => {
    if (!isLoaded || !shouldAutoFitRef.current) return;
    fitToView();
    shouldAutoFitRef.current = false;
  }, [fitToView, isLoaded, stageSize.height, stageSize.width]);

  const oneToOne = useCallback(() => {
    const img = imageRef.current;
    if (!img) return;
    setScale(1);
    setOffsetX((stageSize.width - img.naturalWidth) / 2);
    setOffsetY((stageSize.height - img.naturalHeight) / 2);
  }, [stageSize.height, stageSize.width]);

  const zoomAtCenter = useCallback(
    (nextScale: number) => {
      const img = imageRef.current;
      if (!img) return;
      const boundedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, nextScale));
      const pivotX = stageSize.width / 2;
      const pivotY = stageSize.height / 2;
      setOffsetX((prev) => pivotX - (pivotX - prev) * (boundedScale / scale));
      setOffsetY((prev) => pivotY - (pivotY - prev) * (boundedScale / scale));
      setScale(boundedScale);
    },
    [scale, stageSize.height, stageSize.width],
  );

  const onWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.ctrlKey || event.metaKey) {
      const factor = event.deltaY > 0 ? 0.92 : 1.08;
      zoomAtCenter(scale * factor);
      return;
    }
    setOffsetX((prev) => prev - event.deltaX);
    setOffsetY((prev) => prev - event.deltaY);
  };

  const onMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    dragRef.current = true;
    dragOriginRef.current = {
      x: event.clientX,
      y: event.clientY,
      ox: clampedOffsets.x,
      oy: clampedOffsets.y,
    };
  };

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      if (!dragRef.current) return;
      setOffsetX(
        dragOriginRef.current.ox + (event.clientX - dragOriginRef.current.x),
      );
      setOffsetY(
        dragOriginRef.current.oy + (event.clientY - dragOriginRef.current.y),
      );
    };
    const onMouseUp = () => {
      dragRef.current = false;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center gap-1.5">
        <IconButton onClick={() => zoomAtCenter(scale / 1.15)} label="Zoom out">
          <ZoomOut className="size-3.5" />
        </IconButton>
        <span className="text-muted-foreground min-w-11 text-center text-[10px] font-medium">
          {zoomPct}%
        </span>
        <IconButton onClick={() => zoomAtCenter(scale * 1.15)} label="Zoom in">
          <ZoomIn className="size-3.5" />
        </IconButton>
        <IconButton onClick={fitToView} label="Fit image">
          <RefreshCcw className="size-3.5" />
        </IconButton>
        <IconButton onClick={oneToOne} label="1:1 scale">
          <Expand className="size-3.5" />
        </IconButton>
      </div>

      <div
        ref={stageRef}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        className="bg-background border-border/70 relative h-[420px] w-full cursor-grab overflow-hidden rounded-md border active:cursor-grabbing"
      >
        {isLoaded ? (
          <canvas ref={canvasRef} className="block h-full w-full" />
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center gap-2 text-sm">
            <ImageIcon className="size-4" />
            Loading image...
          </div>
        )}
      </div>
    </div>
  );
}

function IconButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/70 rounded-md border px-2 py-1 transition-colors"
    >
      {children}
    </button>
  );
}
