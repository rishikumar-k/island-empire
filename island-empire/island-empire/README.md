# Island Empire

A solo strategy sandbox where you place your friends as island nations, set custom stats, and forge alliances, trade, and rivalries on an interactive map.

## Quick start

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## Build for production

```bash
npm run build
npm run preview
```

## Tech

- React 19 + Vite 7
- React Router v7 (routing)
- Tailwind CSS v4
- Radix UI primitives + shadcn-style components
- Zustand (with `persist` to `localStorage`)
- lucide-react (icons)

## How it works

- All data is saved to your browser's `localStorage` under the key `island-empire-v1`. Clear that key to wipe your world.
- Double-click anywhere on the sea to found a new nation.
- Drag islands to reposition them. Scroll to zoom.
- Tap an island to open its detail panel — edit stats, custom-add new stats, set alliances / trade partners / enemies, change color and shape, or delete.
