import { Check, ChevronDown, Search, Store } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Separator } from "@/components/ui/separator";
import { MOCK_STORES, searchStores } from "@/lib/data/stores";
import { useStore } from "@/providers/store";

export function StoreSelector() {
  const { selectedStore, setSelectedStore } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStores = searchQuery ? searchStores(searchQuery) : MOCK_STORES;

  const handleSelectStore = (store: (typeof MOCK_STORES)[0]) => {
    setSelectedStore(store);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <Button
        variant="outline"
        className="h-10 min-w-[250px] justify-between rounded-xl border-white/10 bg-white/5 text-white transition-all hover:bg-white/10"
        onClick={() => setIsOpen(true)}
      >
        {selectedStore ? (
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-blue-400" />
            <span className="font-medium">
              {selectedStore.code ?? selectedStore.name} -{" "}
              {selectedStore.city ?? selectedStore.address}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-gray-400" />
            <span className="text-gray-400">Select Store</span>
          </div>
        )}
        <ChevronDown className="h-4 w-4 opacity-50 transition-transform group-data-[state=open]:rotate-180" />
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="max-w-md"
        showCloseButton
      >
        <Card className="overflow-hidden rounded-2xl border-white/10 bg-gray-900/95 text-white shadow-2xl backdrop-blur-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Store className="h-5 w-5 text-blue-400" />
              Select Store
            </CardTitle>
            <CardDescription className="text-gray-400">
              Choose a store to filter your reporting and dashboard data
            </CardDescription>
            <div className="relative mt-4">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Search by store code, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 border-white/10 bg-white/5 pl-10 text-white placeholder:text-gray-500 focus:ring-blue-500/50"
                autoFocus
              />
            </div>
          </CardHeader>

          <Separator className="bg-white/5" />

          <CardContent className="p-2 pt-2">
            <div className="scrollbar-thin scrollbar-thumb-white/10 max-h-[400px] space-y-1 overflow-y-auto">
              {filteredStores.length > 0 ? (
                filteredStores.map((store) => {
                  const isSelected = selectedStore?.id === store.id;
                  return (
                    <button
                      key={store.id}
                      onClick={() => handleSelectStore(store)}
                      className={`group flex w-full items-center justify-between rounded-xl p-3 text-left transition-all hover:bg-white/5 ${
                        isSelected
                          ? "border border-blue-600/20 bg-blue-600/10"
                          : "border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`rounded-lg p-2 ${isSelected ? "bg-blue-600/20" : "bg-white/5 group-hover:bg-blue-600/10"}`}
                        >
                          <Store
                            className={`h-4 w-4 ${isSelected ? "text-blue-400" : "text-gray-400 group-hover:text-blue-400"}`}
                          />
                        </div>
                        <div>
                          <p
                            className={`font-semibold ${isSelected ? "text-blue-400" : "text-gray-100"}`}
                          >
                            {store.code ?? store.name} -{" "}
                            {store.city ?? store.address}
                          </p>
                          <p className="text-xs text-gray-500">
                            {store.region ?? ""}, {store.country ?? ""}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 text-blue-400" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="p-6 text-center text-sm text-gray-500 italic">
                  No stores found matching "{searchQuery}"
                </div>
              )}
            </div>
          </CardContent>

          {selectedStore && (
            <>
              <Separator className="bg-white/5" />
              <div className="p-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-red-400 hover:bg-red-400/10 hover:text-red-300"
                  onClick={() => {
                    setSelectedStore(null);
                    setIsOpen(false);
                    setSearchQuery("");
                  }}
                >
                  Clear Selection
                </Button>
              </div>
            </>
          )}
        </Card>
      </Modal>
    </div>
  );
}
