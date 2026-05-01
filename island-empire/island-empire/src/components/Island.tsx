type Props = {
  shape: number;
  color: string;
  size?: number;
  selected?: boolean;
};

// 5 hand-tuned blob silhouettes
const SHAPES = [
  "M50,10 C75,8 92,30 90,55 C95,75 70,95 45,92 C20,95 5,72 10,48 C8,25 28,12 50,10 Z",
  "M48,8 C72,12 95,28 92,55 C98,78 72,96 48,90 C22,98 4,76 12,50 C6,28 26,4 48,8 Z",
  "M50,12 C70,5 95,20 92,48 C100,68 88,95 60,92 C35,100 8,82 10,55 C4,30 28,16 50,12 Z",
  "M52,10 C78,14 90,32 88,58 C92,80 65,94 42,90 C18,94 8,68 14,45 C12,22 32,8 52,10 Z",
  "M48,10 C70,8 88,22 92,48 C96,72 78,92 52,92 C28,96 6,76 10,50 C8,28 28,12 48,10 Z",
];

export function Island({ shape, color, size = 88, selected }: Props) {
  const path = SHAPES[shape % SHAPES.length];
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="overflow-visible">
      <defs>
        <radialGradient id={`g-${shape}-${color}`} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="var(--island-sand)" />
          <stop offset="55%" stopColor="var(--island-shore)" />
          <stop offset="100%" stopColor={color} />
        </radialGradient>
        <filter id="ds" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="oklch(0.1 0.05 240)" floodOpacity="0.55" />
        </filter>
      </defs>
      {selected && (
        <circle cx="50" cy="55" r="52" fill="none" stroke="var(--gold)" strokeWidth="2" className="island-ring" />
      )}
      {/* shoreline halo */}
      <path d={path} fill="oklch(0.55 0.1 220 / 0.5)" transform="translate(0,2) scale(1.08) translate(-4,-4)" />
      <path d={path} fill={`url(#g-${shape}-${color})`} filter="url(#ds)" />
      {/* tiny inland patch */}
      <ellipse cx="50" cy="48" rx="22" ry="14" fill="var(--island-grass)" opacity="0.8" />
      <circle cx="44" cy="44" r="3" fill={color} opacity="0.7" />
    </svg>
  );
}
