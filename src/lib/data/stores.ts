import type { Store } from "@/providers/store";

export const MOCK_STORES: Store[] = [
  {
    id: "store-402",
    code: "#402",
    name: "Store #402",
    city: "London",
    region: "Greater London",
    country: "UK",
  },
  {
    id: "store-305",
    code: "#305",
    name: "Store #305",
    city: "Manchester",
    region: "Greater Manchester",
    country: "UK",
  },
  {
    id: "store-201",
    code: "#201",
    name: "Store #201",
    city: "Birmingham",
    region: "West Midlands",
    country: "UK",
  },
  {
    id: "store-398",
    code: "#398",
    name: "Store #398",
    city: "Leeds",
    region: "West Yorkshire",
    country: "UK",
  },
  {
    id: "store-295",
    code: "#295",
    name: "Store #295",
    city: "Bristol",
    region: "South West England",
    country: "UK",
  },
  {
    id: "store-187",
    code: "#187",
    name: "Store #187",
    city: "Liverpool",
    region: "Merseyside",
    country: "UK",
  },
  {
    id: "store-156",
    code: "#156",
    name: "Store #156",
    city: "Glasgow",
    region: "Scotland",
    country: "UK",
  },
  {
    id: "store-089",
    code: "#089",
    name: "Store #089",
    city: "Edinburgh",
    region: "Scotland",
    country: "UK",
  },
  {
    id: "store-267",
    code: "#267",
    name: "Store #267",
    city: "Cardiff",
    region: "Wales",
    country: "UK",
  },
  {
    id: "store-423",
    code: "#423",
    name: "Store #423",
    city: "Belfast",
    region: "Northern Ireland",
    country: "UK",
  },
  {
    id: "store-512",
    code: "#512",
    name: "Store #512",
    city: "Newcastle",
    region: "North East England",
    country: "UK",
  },
  {
    id: "store-678",
    code: "#678",
    name: "Store #678",
    city: "Southampton",
    region: "South East England",
    country: "UK",
  },
];

export function searchStores(query: string): Store[] {
  if (!query.trim()) {
    return MOCK_STORES;
  }

  const lowerQuery = query.toLowerCase();
  return MOCK_STORES.filter(
    (store) =>
      store.name.toLowerCase().includes(lowerQuery) ||
      (store.code?.toLowerCase().includes(lowerQuery)) ||
      (store.city?.toLowerCase().includes(lowerQuery)) ||
      (store.region?.toLowerCase().includes(lowerQuery)),
  );
}
