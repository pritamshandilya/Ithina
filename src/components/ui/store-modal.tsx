import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Input } from "./input";
import { Search, Store } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "./modal";
import { MOCK_STORES } from "@/lib/data/stores";

export function StoreModal({ 
  isOpen = true, 
  onClose = () => {}, 
  onSelect 
}: { 
  isOpen?: boolean;
  onClose?: () => void;
  onSelect: (store: string) => void 
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStores = MOCK_STORES.filter((store) =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (store.city?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Card className="border-border bg-card/95 text-card-foreground shadow-2xl backdrop-blur-xl overflow-hidden">
        <CardHeader className="border-border/80 border-b pb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="rounded-lg bg-accent/20 p-2">
              <Store className="h-5 w-5 text-accent" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Select a Store</CardTitle>
          </div>
          <p className="text-muted-foreground text-sm">Choose a location to continue to your dashboard</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="relative mb-6">
            <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search stores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-background/70 border-input placeholder:text-muted-foreground/80 focus-visible:ring-ring/70 pl-10 transition-all"
            />
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent font-sans">
            <AnimatePresence mode="popLayout">
              {filteredStores.map((store) => (
                <motion.div
                  key={store.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <button
                    onClick={() => onSelect(store.name)}
                    className="bg-secondary/35 border-border hover:bg-accent/22 hover:border-accent/55 w-full group flex flex-col items-start rounded-xl border p-4 text-left transition-all"
                  >
                    <span className="text-foreground group-hover:text-accent font-semibold transition-colors">
                      {store.name}
                    </span>
                    <span className="text-muted-foreground group-hover:text-foreground/90 text-xs">
                      {store.city ?? ""}, {store.country ?? ""}
                    </span>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            {filteredStores.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground italic">No stores found matching your search.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Modal>
  );
}
