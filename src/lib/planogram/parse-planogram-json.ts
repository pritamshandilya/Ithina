import type {
  PlanogramDefinition,
  PlanogramFixture,
  PlanogramMetadata,
  PlanogramPayload,
  PlanogramPhysicalLocation,
  PlanogramProduct,
  PlanogramShelfDef,
  StockingRules,
} from "@/types/planogram";

const DEFAULT_STOCKING: StockingRules = {
  highDemandProducts: [],
  restockThreshold: 0,
  notes: "",
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function ensurePhysicalLocation(raw: unknown): PlanogramPhysicalLocation {
  const loc = isRecord(raw) ? raw : {};
  return {
    storeId: typeof loc.storeId === "string" ? loc.storeId : "",
    zone: typeof loc.zone === "string" ? loc.zone : "—",
    aisle: typeof loc.aisle === "string" ? loc.aisle : "—",
    bay: typeof loc.bay === "string" ? loc.bay : "—",
    side: typeof loc.side === "string" ? loc.side : "—",
    section: typeof loc.section === "string" ? loc.section : "—",
    fixtureIndexInBay:
      typeof loc.fixtureIndexInBay === "number" && Number.isFinite(loc.fixtureIndexInBay)
        ? loc.fixtureIndexInBay
        : 0,
  };
}

function ensureStockingRules(raw: unknown): StockingRules {
  if (!isRecord(raw)) return { ...DEFAULT_STOCKING };
  return {
    highDemandProducts: Array.isArray(raw.highDemandProducts)
      ? raw.highDemandProducts.filter((x): x is string => typeof x === "string")
      : [],
    restockThreshold:
      typeof raw.restockThreshold === "number" && Number.isFinite(raw.restockThreshold)
        ? raw.restockThreshold
        : 0,
    notes: typeof raw.notes === "string" ? raw.notes : "",
  };
}

function ensureMetadata(raw: unknown): PlanogramMetadata | undefined {
  if (!isRecord(raw)) return undefined;
  const stocking = ensureStockingRules(raw.stockingRules);
  return {
    createdBy: typeof raw.createdBy === "string" ? raw.createdBy : "—",
    updatedBy: typeof raw.updatedBy === "string" ? raw.updatedBy : "—",
    sourceSystem: typeof raw.sourceSystem === "string" ? raw.sourceSystem : "import",
    tags: Array.isArray(raw.tags)
      ? raw.tags.filter((t): t is string => typeof t === "string")
      : [],
    auditTrailId: typeof raw.auditTrailId === "string" ? raw.auditTrailId : "",
    syncStatus: typeof raw.syncStatus === "string" ? raw.syncStatus : "local",
    stockingRules: stocking,
    location: typeof raw.location === "string" ? raw.location : undefined,
    lastUpdated: typeof raw.lastUpdated === "string" ? raw.lastUpdated : undefined,
    status: typeof raw.status === "string" ? raw.status : undefined,
    totalSKUs: typeof raw.totalSKUs === "number" ? raw.totalSKUs : undefined,
    totalProducts: typeof raw.totalProducts === "number" ? raw.totalProducts : undefined,
  };
}

function normalizeProduct(raw: unknown, index: number): PlanogramProduct {
  const p = isRecord(raw) ? raw : {};
  const facings = typeof p.facings === "number" && p.facings >= 0 ? p.facings : 0;
  const depthCount = typeof p.depthCount === "number" && p.depthCount >= 0 ? p.depthCount : 1;
  const optimalFromFacing = facings * depthCount;
  const optimalStock =
    typeof p.optimalStock === "number" && Number.isFinite(p.optimalStock)
      ? p.optimalStock
      : optimalFromFacing;
  return {
    sku: typeof p.sku === "string" && p.sku ? p.sku : `SKU-${index + 1}`,
    brand: typeof p.brand === "string" ? p.brand : "—",
    name: typeof p.name === "string" ? p.name : "—",
    category: typeof p.category === "string" ? p.category : "—",
    xPosition: typeof p.xPosition === "number" && Number.isFinite(p.xPosition) ? p.xPosition : 0,
    facings,
    depthCount,
    width: typeof p.width === "number" && Number.isFinite(p.width) ? p.width : 0,
    height: typeof p.height === "number" && Number.isFinite(p.height) ? p.height : 0,
    depth: typeof p.depth === "number" && Number.isFinite(p.depth) ? p.depth : 0,
    optimalStock,
    currentStock:
      typeof p.currentStock === "number" && Number.isFinite(p.currentStock)
        ? p.currentStock
        : optimalStock,
    backroomStock:
      p.backroomStock === null || p.backroomStock === undefined
        ? null
        : typeof p.backroomStock === "number"
          ? p.backroomStock
          : null,
    price:
      p.price === null || p.price === undefined
        ? null
        : typeof p.price === "number"
          ? p.price
          : null,
    salesVelocityPerDay:
      p.salesVelocityPerDay === null || p.salesVelocityPerDay === undefined
        ? null
        : typeof p.salesVelocityPerDay === "number"
          ? p.salesVelocityPerDay
          : null,
    margin:
      p.margin === null || p.margin === undefined
        ? null
        : typeof p.margin === "number"
          ? p.margin
          : null,
    expirySensitive: Boolean(p.expirySensitive),
    planogramRole:
      p.planogramRole === null || p.planogramRole === undefined
        ? null
        : typeof p.planogramRole === "string"
          ? p.planogramRole
          : null,
    isOnPromotion: Boolean(p.isOnPromotion),
  };
}

function normalizeShelf(raw: unknown, index: number): PlanogramShelfDef {
  const s = isRecord(raw) ? raw : {};
  const productsRaw = Array.isArray(s.products) ? s.products : [];
  const shelfNumber =
    typeof s.shelfNumber === "number" && Number.isFinite(s.shelfNumber)
      ? s.shelfNumber
      : index + 1;
  return {
    shelfId: typeof s.shelfId === "string" && s.shelfId ? s.shelfId : `SHELF-${shelfNumber}`,
    shelfNumber,
    name: typeof s.name === "string" ? s.name : `Shelf ${shelfNumber}`,
    verticalPosition:
      typeof s.verticalPosition === "number" && Number.isFinite(s.verticalPosition)
        ? s.verticalPosition
        : 0,
    height: typeof s.height === "number" && Number.isFinite(s.height) ? s.height : 0,
    width: typeof s.width === "number" && Number.isFinite(s.width) ? s.width : undefined,
    depth: typeof s.depth === "number" && Number.isFinite(s.depth) ? s.depth : undefined,
    products: productsRaw.map((pr, i) => normalizeProduct(pr, i)),
  };
}

function normalizeFixture(raw: unknown): PlanogramFixture {
  const f = isRecord(raw) ? raw : {};
  const shelvesRaw = Array.isArray(f.shelves) ? f.shelves : [];
  return {
    fixtureId: typeof f.fixtureId === "string" && f.fixtureId ? f.fixtureId : "FIXTURE-IMPORT",
    type: typeof f.type === "string" ? f.type : "unknown",
    width: typeof f.width === "number" && Number.isFinite(f.width) ? f.width : 0,
    height: typeof f.height === "number" && Number.isFinite(f.height) ? f.height : 0,
    depth: typeof f.depth === "number" && Number.isFinite(f.depth) ? f.depth : 0,
    units: typeof f.units === "string" ? f.units : undefined,
    shelfCount:
      typeof f.shelfCount === "number" && Number.isFinite(f.shelfCount)
        ? f.shelfCount
        : shelvesRaw.length,
    shelves: shelvesRaw.map((sh, i) => normalizeShelf(sh, i)),
  };
}

function normalizeDefinition(raw: unknown): PlanogramDefinition {
  const d = isRecord(raw) ? raw : {};
  const metaOnDef = ensureMetadata(d.metadata);
  return {
    id: typeof d.id === "string" && d.id ? d.id : `PLN-${Date.now()}`,
    name: typeof d.name === "string" ? d.name : "Imported planogram",
    version: typeof d.version === "string" ? d.version : "1.0",
    createdDate: typeof d.createdDate === "string" ? d.createdDate : new Date().toISOString().slice(0, 10),
    location: typeof d.location === "string" ? d.location : "—",
    status: typeof d.status === "string" ? d.status : "draft",
    storeConfig: isRecord(d.storeConfig)
      ? {
          units: typeof d.storeConfig.units === "string" ? d.storeConfig.units : "mm",
          currency: typeof d.storeConfig.currency === "string" ? d.storeConfig.currency : "EUR",
        }
      : undefined,
    physicalLocation: ensurePhysicalLocation(d.physicalLocation),
    metadata: metaOnDef,
    fixture: normalizeFixture(d.fixture),
  };
}

/**
 * Parse and normalize arbitrary JSON into a PlanogramPayload the app can render.
 * Accepts either `{ planogram: { ... } }` or a bare planogram definition object.
 */
export function parsePlanogramJsonText(text: string): PlanogramPayload {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    throw new Error("The file is not valid JSON.");
  }

  if (!isRecord(parsed)) {
    throw new Error("Planogram JSON must be an object.");
  }

  let inner: unknown = parsed.planogram !== undefined ? parsed.planogram : parsed;
  if (!isRecord(inner)) {
    throw new Error("Missing planogram object.");
  }

  const planogram = normalizeDefinition(inner);

  if (!planogram.fixture.shelves.length) {
    throw new Error("Planogram must include at least one shelf with a fixture.");
  }

  const defMeta = planogram.metadata;
  const topMeta = ensureMetadata(parsed.metadata);
  const mergedMeta: PlanogramMetadata = {
    createdBy: topMeta?.createdBy ?? defMeta?.createdBy ?? "—",
    updatedBy: topMeta?.updatedBy ?? defMeta?.updatedBy ?? "—",
    sourceSystem: topMeta?.sourceSystem ?? defMeta?.sourceSystem ?? "import",
    tags: (topMeta?.tags?.length ? topMeta.tags : defMeta?.tags) ?? [],
    auditTrailId: topMeta?.auditTrailId ?? defMeta?.auditTrailId ?? "",
    syncStatus: topMeta?.syncStatus ?? defMeta?.syncStatus ?? "local",
    location: topMeta?.location ?? defMeta?.location,
    lastUpdated: topMeta?.lastUpdated ?? defMeta?.lastUpdated,
    status: topMeta?.status ?? defMeta?.status,
    totalSKUs: topMeta?.totalSKUs ?? defMeta?.totalSKUs,
    totalProducts: topMeta?.totalProducts ?? defMeta?.totalProducts,
    stockingRules: ensureStockingRules(
      parsed.stockingRules ?? topMeta?.stockingRules ?? defMeta?.stockingRules,
    ),
  };

  const stockingRules = mergedMeta.stockingRules;

  const payload: PlanogramPayload = {
    planogram: {
      ...planogram,
      metadata: mergedMeta,
    },
    metadata: mergedMeta,
    stockingRules,
  };

  const skuCount = planogram.fixture.shelves.reduce((n, sh) => n + sh.products.length, 0);
  const unitCount = planogram.fixture.shelves.reduce(
    (n, sh) => n + sh.products.reduce((m, p) => m + p.facings * p.depthCount, 0),
    0,
  );

  if (payload.metadata) {
    payload.metadata.totalSKUs = payload.metadata.totalSKUs ?? skuCount;
    payload.metadata.totalProducts = payload.metadata.totalProducts ?? unitCount;
  }

  return payload;
}
