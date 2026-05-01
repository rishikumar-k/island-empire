import { useState } from "react";
import { useGame, type Country } from "@/lib/game-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, X, Plus, Handshake, Swords, Coins } from "lucide-react";
import { Island } from "./Island";

export function CountryDetail({ country }: { country: Country }) {
  const { statDefs, countries, updateCountry, deleteCountry, select, addStatDef, removeStatDef, toggleRelation } =
    useGame();
  const [newStat, setNewStat] = useState("");

  const others = countries.filter((c) => c.id !== country.id);

  const relKind = (otherId: string) => {
    if (country.alliances.includes(otherId)) return "ally";
    if (country.enemies.includes(otherId)) return "enemy";
    if (country.trades.includes(otherId)) return "trade";
    return "none";
  };

  return (
    <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[420px] bg-card border-l border-border shadow-2xl flex flex-col z-20">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <div className="shrink-0">
          <Island shape={country.shape} color={country.color} size={56} />
        </div>
        <div className="flex-1 min-w-0">
          <Input
            value={country.name}
            onChange={(e) => updateCountry(country.id, { name: e.target.value })}
            className="text-lg font-bold bg-transparent border-0 px-0 h-auto focus-visible:ring-0"
          />
          <Input
            value={country.leader ?? ""}
            placeholder="Leader name"
            onChange={(e) => updateCountry(country.id, { leader: e.target.value })}
            className="text-xs text-muted-foreground bg-transparent border-0 px-0 h-auto focus-visible:ring-0"
          />
        </div>
        <Button variant="ghost" size="icon" onClick={() => select(null)}>
          <X className="size-4" />
        </Button>
      </div>

      <Tabs defaultValue="stats" className="flex-1 flex flex-col min-h-0">
        <TabsList className="mx-4 mt-3 grid grid-cols-3">
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="relations">Relations</TabsTrigger>
          <TabsTrigger value="meta">Meta</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="flex-1 min-h-0 mt-3">
          <ScrollArea className="h-full px-4 pb-4">
            <div className="space-y-4">
              {statDefs.map((s) => {
                const v = country.stats[s.id] ?? 0;
                return (
                  <div key={s.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <Label className="text-sm">{s.name}</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-primary">{v}</span>
                        <button
                          onClick={() => removeStatDef(s.id)}
                          className="text-muted-foreground hover:text-destructive text-xs"
                          title="Remove stat (all countries)"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <Slider
                      value={[v]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={([nv]) =>
                        updateCountry(country.id, { stats: { ...country.stats, [s.id]: nv } })
                      }
                    />
                  </div>
                );
              })}

              <div className="pt-3 border-t border-border flex gap-2">
                <Input
                  placeholder="New stat (e.g. Diplomacy)"
                  value={newStat}
                  onChange={(e) => setNewStat(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newStat.trim()) {
                      addStatDef(newStat.trim());
                      setNewStat("");
                    }
                  }}
                />
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => {
                    if (newStat.trim()) {
                      addStatDef(newStat.trim());
                      setNewStat("");
                    }
                  }}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="relations" className="flex-1 min-h-0 mt-3">
          <ScrollArea className="h-full px-4 pb-4">
            {others.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Add more countries to forge alliances, declare enemies, or open trade.
              </p>
            ) : (
              <div className="space-y-2">
                {others.map((o) => {
                  const k = relKind(o.id);
                  return (
                    <div
                      key={o.id}
                      className="flex items-center gap-2 p-2 rounded-md bg-secondary/40 border border-border"
                    >
                      <div
                        className="size-6 rounded-full shrink-0"
                        style={{ background: o.color, boxShadow: "0 0 0 2px var(--card)" }}
                      />
                      <span className="flex-1 text-sm font-medium truncate">{o.name}</span>
                      {k !== "none" && (
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {k}
                        </Badge>
                      )}
                      <Button
                        size="icon"
                        variant={country.alliances.includes(o.id) ? "default" : "ghost"}
                        className="size-7"
                        title="Ally"
                        onClick={() => toggleRelation(country.id, o.id, "alliances")}
                      >
                        <Handshake className="size-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant={country.trades.includes(o.id) ? "default" : "ghost"}
                        className="size-7"
                        title="Trade"
                        onClick={() => toggleRelation(country.id, o.id, "trades")}
                      >
                        <Coins className="size-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant={country.enemies.includes(o.id) ? "destructive" : "ghost"}
                        className="size-7"
                        title="Enemy"
                        onClick={() => toggleRelation(country.id, o.id, "enemies")}
                      >
                        <Swords className="size-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="meta" className="flex-1 min-h-0 mt-3">
          <div className="px-4 pb-4 space-y-4">
            <div>
              <Label className="text-sm mb-2 block">Color</Label>
              <input
                type="color"
                className="w-full h-10 rounded-md bg-transparent border border-border cursor-pointer"
                onChange={(e) => updateCountry(country.id, { color: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-sm mb-2 block">Island shape</Label>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <button
                    key={i}
                    onClick={() => updateCountry(country.id, { shape: i })}
                    className={`p-1 rounded-md border ${country.shape === i ? "border-primary" : "border-border"}`}
                  >
                    <Island shape={i} color={country.color} size={36} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm mb-2 block">Notes</Label>
              <Textarea
                value={country.notes ?? ""}
                onChange={(e) => updateCountry(country.id, { notes: e.target.value })}
                rows={4}
                placeholder="Lore, history, secret deals…"
              />
            </div>
            <Button variant="destructive" className="w-full" onClick={() => deleteCountry(country.id)}>
              <Trash2 className="size-4 mr-2" /> Delete country
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
