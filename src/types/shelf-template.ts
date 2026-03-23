export type ShelfTemplateFixtureType =
  | "gondola"
  | "wall_shelving"
  | "end_cap"
  | "freezer"
  | "cooler";

export interface ShelfTemplate {
  id: string;
  name: string;
  description?: string;
  fixtureType: ShelfTemplateFixtureType;
  zone?: string;
  section?: string;
  width: number;
  height: number;
  depth: number;
  createdAt: string;
  updatedAt: string;
}

export type ShelfTemplateCreateInput = Omit<
  ShelfTemplate,
  "id" | "createdAt" | "updatedAt"
>;

export type ShelfTemplateUpdateInput = Partial<ShelfTemplateCreateInput> & {
  id: string;
};

