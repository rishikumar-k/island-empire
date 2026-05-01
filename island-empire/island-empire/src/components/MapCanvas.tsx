import { useEffect, useRef, useState } from "react";
import { useGame, type Country } from "@/lib/game-store";
import { Island } from "./Island";

type Props = {
  onAddAt: (x: number, y: number) => void;
};

const WORLD = { w: 4000, h: 3000 };

export function MapCanvas({ onAddAt }: Props) {
  const { countries, selectedId, select, moveCountry } = useGame();
  const containerRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ x: -1500, y: -1100, scale: 0.7 });
  const panState = useRef<{ startX: number; startY: number; vx: number; vy: number } | null>(null);
  const dragState = useRef<{ id: string; offX: number; offY: number; moved: boolean } | null>(null);

  // Center on first mount
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setView((v) => ({ ...v, x: r.width / 2 - (WORLD.w / 2) * v.scale, y: r.height / 2 - (WORLD.h / 2) * v.scale }));
  }, []);

  const screenToWorld = (sx: number, sy: number) => {
    const r = containerRef.current!.getBoundingClientRect();
    return { x: (sx - r.left - view.x) / view.scale, y: (sy - r.top - view.y) / view.scale };
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const r = containerRef.current!.getBoundingClientRect();
    const cx = e.clientX - r.left;
    const cy = e.clientY - r.top;
    const factor = e.deltaY < 0 ? 1.12 : 0.89;
    const newScale = Math.min(2, Math.max(0.3, view.scale * factor));
    const nx = cx - (cx - view.x) * (newScale / view.scale);
    const ny = cy - (cy - view.y) * (newScale / view.scale);
    setView({ x: nx, y: ny, scale: newScale });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("[data-island]")) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    panState.current = { startX: e.clientX, startY: e.clientY, vx: view.x, vy: view.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragState.current) {
      const w = screenToWorld(e.clientX, e.clientY);
      const x = w.x - dragState.current.offX;
      const y = w.y - dragState.current.offY;
      moveCountry(dragState.current.id, x, y);
      dragState.current.moved = true;
      return;
    }
    if (!panState.current) return;
    setView((v) => ({
      ...v,
      x: panState.current!.vx + (e.clientX - panState.current!.startX),
      y: panState.current!.vy + (e.clientY - panState.current!.startY),
    }));
  };
  const onPointerUp = () => {
    panState.current = null;
    dragState.current = null;
  };

  const onIslandPointerDown = (e: React.PointerEvent, c: Country) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    const w = screenToWorld(e.clientX, e.clientY);
    dragState.current = { id: c.id, offX: w.x - c.x, offY: w.y - c.y, moved: false };
  };
  const onIslandPointerUp = (e: React.PointerEvent, c: Country) => {
    const moved = dragState.current?.moved;
    dragState.current = null;
    if (!moved) select(c.id);
    e.stopPropagation();
  };

  const onDoubleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-island]")) return;
    const w = screenToWorld(e.clientX, e.clientY);
    onAddAt(w.x, w.y);
  };

  // Build relation lines
  const lines: { from: Country; to: Country; kind: "alliances" | "enemies" | "trades" }[] = [];
  const seen = new Set<string>();
  for (const c of countries) {
    (["alliances", "enemies", "trades"] as const).forEach((kind) => {
      c[kind].forEach((id) => {
        const key = [c.id, id, kind].sort().join("|");
        if (seen.has(key)) return;
        seen.add(key);
        const to = countries.find((x) => x.id === id);
        if (to) lines.push({ from: c, to, kind });
      });
    });
  }

  const lineColor = (k: string) =>
    k === "alliances" ? "oklch(0.78 0.16 145)" : k === "enemies" ? "oklch(0.65 0.22 25)" : "var(--gold)";

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 ocean-bg overflow-hidden cursor-grab active:cursor-grabbing select-none touch-none"
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onDoubleClick={onDoubleClick}
    >
      <div
        className="absolute origin-top-left"
        style={{
          width: WORLD.w,
          height: WORLD.h,
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
        }}
      >
        <div className="absolute inset-0 ocean-grid" />

        <svg className="absolute inset-0 pointer-events-none" width={WORLD.w} height={WORLD.h}>
          {lines.map((l, i) => (
            <line
              key={i}
              x1={l.from.x}
              y1={l.from.y}
              x2={l.to.x}
              y2={l.to.y}
              stroke={lineColor(l.kind)}
              strokeWidth={3}
              strokeDasharray={l.kind === "trades" ? "8 6" : l.kind === "enemies" ? "2 6" : "0"}
              opacity={0.75}
            />
          ))}
        </svg>

        {countries.map((c) => (
          <div
            key={c.id}
            data-island
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer island-float"
            style={{ left: c.x, top: c.y }}
            onPointerDown={(e) => onIslandPointerDown(e, c)}
            onPointerUp={(e) => onIslandPointerUp(e, c)}
          >
            <Island shape={c.shape} color={c.color} selected={selectedId === c.id} />
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-7 whitespace-nowrap">
              <span
                className="px-2 py-0.5 rounded text-xs font-semibold tracking-wide"
                style={{
                  background: "oklch(0.18 0.05 240 / 0.85)",
                  color: "var(--gold)",
                  border: "1px solid var(--border)",
                }}
              >
                {c.name}
              </span>
            </div>
          </div>
        ))}
      </div>

      {countries.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-muted-foreground">
            <p className="text-2xl font-bold text-foreground">An empty sea awaits.</p>
            <p className="mt-2">Double-click anywhere — or use the button — to forge your first nation.</p>
          </div>
        </div>
      )}
    </div>
  );
}
