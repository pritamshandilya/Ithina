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
import { Separator } from "@/components/ui/separator";
import { MOCK_STORES, searchStores } from "@/lib/data/stores";
import { useStore } from "@/providers/store";
import { Modal } from "@/components/ui/modal";

export function StoreSelector() {
  const { selectedStore, setSelectedStore } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStores = searchQuery
    ? searchStores(searchQuery)
    : MOCK_STORES;

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
        className="min-w-[250px] justify-between h-10 border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all rounded-xl"
        onClick={() => setIsOpen(true)}
      >
        {selectedStore ? (
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-blue-400" />
            <span className="font-medium">
              {selectedStore.code ?? selectedStore.name} - {selectedStore.city ?? selectedStore.address}
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
        <Card className="border-white/10 bg-gray-900/95 backdrop-blur-xl text-white shadow-2xl overflow-hidden rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <Store className="h-5 w-5 text-blue-400" />
              Select Store
            </CardTitle>
            <CardDescription className="text-gray-400">
              Choose a store to filter your reporting and dashboard data
            </CardDescription>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by store code, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:ring-blue-500/50"
                autoFocus
              />
            </div>
          </CardHeader>

          <Separator className="bg-white/5" />

          <CardContent className="p-2 pt-2">
            <div className="max-h-[400px] overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-white/10">
              {filteredStores.length > 0 ? (
                filteredStores.map((store) => {
                  const isSelected = selectedStore?.id === store.id;
                  return (
                    <button
                      key={store.id}
                      onClick={() => handleSelectStore(store)}
                      className={`w-full text-left p-3 rounded-xl hover:bg-white/5 transition-all flex items-center justify-between group ${
                        isSelected ? "bg-blue-600/10 border border-blue-600/20" : "border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-600/20' : 'bg-white/5 group-hover:bg-blue-600/10'}`}>
                          <Store className={`h-4 w-4 ${isSelected ? 'text-blue-400' : 'text-gray-400 group-hover:text-blue-400'}`} />
                        </div>
                        <div>
                          <p className={`font-semibold ${isSelected ? 'text-blue-400' : 'text-gray-100'}`}>
                            {store.code ?? store.name} - {store.city ?? store.address}
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
                  className="w-full text-red-400 hover:text-red-300 hover:bg-red-400/10"
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
