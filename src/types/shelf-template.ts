/** Canonical preset keys; store-specific labels (e.g. "Hangers") are also allowed. */
export type ShelfTemplateFixturePreset =
  | "gondola"
  | "wall_shelving"
  | "end_cap"
  | "freezer"
  | "cooler";

/** Stored on templates and sent to shelf/fixture flows; may be a preset or a custom store label. */
export type ShelfTemplateFixtureType = string;
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

