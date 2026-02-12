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
    store.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Card className="border-white/10 bg-gray-900/90 backdrop-blur-xl text-white shadow-2xl overflow-hidden">
        <CardHeader className="border-b border-white/5 pb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Store className="h-5 w-5 text-blue-400" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Select a Store</CardTitle>
          </div>
          <p className="text-gray-400 text-sm">Choose a location to continue to your dashboard</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search stores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:ring-blue-500/50 transition-all"
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
                    className="w-full group flex flex-col items-start p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-blue-600/20 hover:border-blue-500/30 transition-all text-left"
                  >
                    <span className="font-semibold text-gray-100 group-hover:text-blue-400 transition-colors">
                      {store.name}
                    </span>
                    <span className="text-xs text-gray-500 group-hover:text-gray-400">
                      {store.city}, {store.country}
                    </span>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            {filteredStores.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 italic">No stores found matching your search.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Modal>
  );
}