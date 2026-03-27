import type { ShelfTemplateFixtureType } from "@/types/shelf-template";

export type StoreConfigurationTab = "profile" | "team";

export type StoreDefaultsTab = "fixtures" | "templates" | "rules" | "units";

export type StoreTemplateForm = {
  name: string;
  description: string;
  fixtureType: ShelfTemplateFixtureType;
  zone: string;
  section: string;
  width: string;
  height: string;
  depth: string;
};
