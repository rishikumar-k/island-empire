import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";

export type StatDef = {
  id: string;
  name: string;
  icon?: string;
};

export type Country = {
  id: string;
  name: string;
  leader?: string;
  color: string;
  shape: number; // 0..4 island silhouette index
  x: number;
  y: number;
  stats: Record<string, number>; // statId -> value
  alliances: string[]; // country ids
  enemies: string[];
  trades: string[];
  notes?: string;
};

type GameState = {
  countries: Country[];
  statDefs: StatDef[];
  selectedId: string | null;
  addCountry: (c: Omit<Country, "id" | "alliances" | "enemies" | "trades" | "stats" | "shape" | "color"> & Partial<Pick<Country, "shape" | "color" | "stats">>) => string;
  updateCountry: (id: string, patch: Partial<Country>) => void;
  deleteCountry: (id: string) => void;
  moveCountry: (id: string, x: number, y: number) => void;
  select: (id: string | null) => void;
  addStatDef: (name: string) => void;
  removeStatDef: (id: string) => void;
  toggleRelation: (a: string, b: string, kind: "alliances" | "enemies" | "trades") => void;
};

const PALETTE = [
  "oklch(0.7 0.18 30)",
  "oklch(0.72 0.16 145)",
  "oklch(0.7 0.17 260)",
  "oklch(0.78 0.16 75)",
  "oklch(0.65 0.2 350)",
  "oklch(0.7 0.17 200)",
  "oklch(0.68 0.18 50)",
  "oklch(0.72 0.15 170)",
];

const defaultStats: StatDef[] = [
  { id: "wealth", name: "Wealth" },
  { id: "infrastructure", name: "Infrastructure" },
  { id: "resources", name: "Resources" },
  { id: "development", name: "Development" },
  { id: "military", name: "Military" },
];

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      countries: [],
      statDefs: defaultStats,
      selectedId: null,

      addCountry: (c) => {
        const id = nanoid(8);
        const idx = get().countries.length;
        const stats: Record<string, number> = {};
        get().statDefs.forEach((s) => (stats[s.id] = c.stats?.[s.id] ?? 50));
        const country: Country = {
          id,
          name: c.name,
          leader: c.leader,
          color: c.color ?? PALETTE[idx % PALETTE.length],
          shape: c.shape ?? Math.floor(Math.random() * 5),
          x: c.x,
          y: c.y,
          stats,
          alliances: [],
          enemies: [],
          trades: [],
          notes: c.notes,
        };
        set((s) => ({ countries: [...s.countries, country], selectedId: id }));
        return id;
      },

      updateCountry: (id, patch) =>
        set((s) => ({
          countries: s.countries.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),

      deleteCountry: (id) =>
        set((s) => ({
          countries: s.countries
            .filter((c) => c.id !== id)
            .map((c) => ({
              ...c,
              alliances: c.alliances.filter((x) => x !== id),
              enemies: c.enemies.filter((x) => x !== id),
              trades: c.trades.filter((x) => x !== id),
            })),
          selectedId: s.selectedId === id ? null : s.selectedId,
        })),

      moveCountry: (id, x, y) =>
        set((s) => ({
          countries: s.countries.map((c) => (c.id === id ? { ...c, x, y } : c)),
        })),

      select: (id) => set({ selectedId: id }),

      addStatDef: (name) => {
        const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "_") + "_" + nanoid(4);
        set((s) => ({
          statDefs: [...s.statDefs, { id, name }],
          countries: s.countries.map((c) => ({ ...c, stats: { ...c.stats, [id]: 50 } })),
        }));
      },

      removeStatDef: (id) =>
        set((s) => ({
          statDefs: s.statDefs.filter((x) => x.id !== id),
          countries: s.countries.map((c) => {
            const { [id]: _, ...rest } = c.stats;
            return { ...c, stats: rest };
          }),
        })),

      toggleRelation: (a, b, kind) => {
        if (a === b) return;
        set((s) => ({
          countries: s.countries.map((c) => {
            if (c.id !== a && c.id !== b) return c;
            const other = c.id === a ? b : a;
            const has = c[kind].includes(other);
            const next = has ? c[kind].filter((x) => x !== other) : [...c[kind], other];
            // ensure mutual exclusivity: ally and enemy can't both be set
            const cleaned = { ...c, [kind]: next } as Country;
            if (!has && kind === "alliances") cleaned.enemies = cleaned.enemies.filter((x) => x !== other);
            if (!has && kind === "enemies") cleaned.alliances = cleaned.alliances.filter((x) => x !== other);
            return cleaned;
          }),
        }));
      },
    }),
    { name: "island-empire-v1" }
  )
);
