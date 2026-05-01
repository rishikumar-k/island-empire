import { useState } from "react";
import { useGame } from "@/lib/game-store";
import { MapCanvas } from "@/components/MapCanvas";
import { CountryDetail } from "@/components/CountryDetail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Globe2, Plus, List } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Island } from "@/components/Island";

export default function App() {
  const { countries, selectedId, select, addCountry } = useGame();
  const selected = countries.find((c) => c.id === selectedId) ?? null;

  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [leader, setLeader] = useState("");
  const [pendingPos, setPendingPos] = useState<{ x: number; y: number } | null>(null);

  const openAdd = (pos?: { x: number; y: number }) => {
    setPendingPos(pos ?? null);
    setName("");
    setLeader("");
    setAddOpen(true);
  };

  const submit = () => {
    if (!name.trim()) return;
    const pos = pendingPos ?? {
      x: 2000 + (Math.random() - 0.5) * 600,
      y: 1500 + (Math.random() - 0.5) * 400,
    };
    addCountry({ name: name.trim(), leader: leader.trim() || undefined, x: pos.x, y: pos.y });
    setAddOpen(false);
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <MapCanvas onAddAt={(x, y) => openAdd({ x, y })} />

      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-3 sm:p-4 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card/80 backdrop-blur border border-border pointer-events-auto">
          <Globe2 className="size-5 text-primary" />
          <h1 className="text-sm sm:text-base font-bold tracking-wide">ISLAND EMPIRE</h1>
          <span className="text-xs text-muted-foreground hidden sm:inline ml-2">
            {countries.length} {countries.length === 1 ? "nation" : "nations"}
          </span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary" size="sm">
                <List className="size-4 mr-2" /> Roster
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px]">
              <SheetHeader>
                <SheetTitle>World Roster</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-2">
                {countries.length === 0 && (
                  <p className="text-sm text-muted-foreground">No countries yet.</p>
                )}
                {countries.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => select(c.id)}
                    className="w-full flex items-center gap-3 p-2 rounded-md bg-secondary/40 border border-border hover:border-primary transition-colors text-left"
                  >
                    <Island shape={c.shape} color={c.color} size={36} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{c.name}</div>
                      {c.leader && (
                        <div className="text-xs text-muted-foreground truncate">{c.leader}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <Button size="sm" onClick={() => openAdd()}>
            <Plus className="size-4 mr-2" /> New country
          </Button>
        </div>
      </header>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-full bg-card/70 backdrop-blur border border-border text-xs text-muted-foreground pointer-events-none">
        Drag islands to reposition • Scroll to zoom • Double-click sea to found a nation
      </div>

      {selected && <CountryDetail country={selected} />}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Found a new nation</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-sm mb-1.5 block">Country name</Label>
              <Input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Republic of Aria"
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Leader (optional)</Label>
              <Input
                value={leader}
                onChange={(e) => setLeader(e.target.value)}
                placeholder="Your friend's name"
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit}>Found nation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
