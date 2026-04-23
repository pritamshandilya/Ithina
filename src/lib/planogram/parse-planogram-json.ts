import type { PlanogramApiStatus } from "@/models/request/planograms";
import type {
  PlanogramDimensions,
  PlanogramPayload,
  PlanogramProduct,
  PlanogramShelfDef,
} from "@/types/planogram";

const LEGACY_KEYS = new Set([
  "planogram",
  "physicalLocation",
  "storeConfig",
  "metadata",
  "stockingRules",
  "fixtureId",
  "shelfNumber",
  "verticalPosition",
  "xPosition",
  "depthCount",
  "currentStock",
  "optimalStock",
  "planogramRole",
  "isOnPromotion",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertNoLegacyKeys(value: unknown): void {
  if (Array.isArray(value)) {
    value.forEach(assertNoLegacyKeys);
    return;
  }

  if (!isRecord(value)) return;

  for (const key of Object.keys(value)) {
    if (LEGACY_KEYS.has(key)) {
      throw new Error(`Legacy planogram field \`${key}\` is not supported.`);
    }
    assertNoLegacyKeys(value[key]);
  }
}

function parseStatus(value: unknown): PlanogramApiStatus {
  assert(typeof value === "string", "Planogram status is required.");
  assert(
    value === "DRAFT" || value === "ACTIVE" || value === "ARCHIVED",
    "Planogram status must be one of DRAFT, ACTIVE, or ARCHIVED.",
  );
  return value;
}

function parseRequiredNumber(
  value: unknown,
  path: string,
  minimum = 0,
): number {
  assert(
    typeof value === "number" && Number.isFinite(value),
    `${path} must be a number.`,
  );
  assert(value >= minimum, `${path} must be >= ${minimum}.`);
  return value;
}

function parseOptionalNumber(
  value: unknown,
  path: string,
  minimum = 0,
): number | undefined {
  if (value == null) return undefined;
  return parseRequiredNumber(value, path, minimum);
}

function parseDimensions(
  value: unknown,
  path: string,
): PlanogramDimensions {
  assert(isRecord(value), `${path} must be an object.`);
  return {
    width: parseRequiredNumber(value.width, `${path}.width`, 1),
    height: parseRequiredNumber(value.height, `${path}.height`, 1),
    depth: parseRequiredNumber(value.depth, `${path}.depth`, 1),
  };
}

function parseProduct(value: unknown, path: string): PlanogramProduct {
  assert(isRecord(value), `${path} must be an object.`);
  assert(typeof value.name === "string" && value.name.trim(), `${path}.name is required.`);
  assert(typeof value.brand === "string" && value.brand.trim(), `${path}.brand is required.`);

  return {
    ...(typeof value.sku === "string" && value.sku.trim()
      ? { sku: value.sku }
      : {}),
    ...(typeof value.barcode === "string" && value.barcode.trim()
      ? { barcode: value.barcode }
      : {}),
    name: value.name,
    brand: value.brand,
    ...(typeof value.category === "string" && value.category.trim()
      ? { category: value.category }
      : {}),
    ...(parseOptionalNumber(value.price, `${path}.price`, 0) != null
      ? { price: parseOptionalNumber(value.price, `${path}.price`, 0) }
      : {}),
    size: parseDimensions(value.size, `${path}.size`),
    x_position: parseRequiredNumber(value.x_position, `${path}.x_position`, 0),
    facings: parseRequiredNumber(value.facings, `${path}.facings`, 1),
    depth_count: parseRequiredNumber(value.depth_count, `${path}.depth_count`, 1),
    ...(parseOptionalNumber(value.velocity, `${path}.velocity`, 0) != null
      ? { velocity: parseOptionalNumber(value.velocity, `${path}.velocity`, 0) }
      : {}),
    expiry_sensitive:
      typeof value.expiry_sensitive === "boolean" ? value.expiry_sensitive : false,
  };
}

function parseShelf(value: unknown, path: string): PlanogramShelfDef {
  assert(isRecord(value), `${path} must be an object.`);
  assert(typeof value.id === "string" && value.id.trim(), `${path}.id is required.`);
  assert(Array.isArray(value.products), `${path}.products must be an array.`);

  return {
    id: value.id,
    y_position: parseRequiredNumber(value.y_position, `${path}.y_position`, 0),
    height: parseRequiredNumber(value.height, `${path}.height`, 1),
    width: parseRequiredNumber(value.width, `${path}.width`, 1),
    products: value.products.map((product, index) =>
      parseProduct(product, `${path}.products[${index}]`),
    ),
  };
}

export function parsePlanogramJsonText(text: string): PlanogramPayload {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    throw new Error("The file is not valid JSON.");
  }

  assert(isRecord(parsed), "Planogram JSON must be an object.");
  assertNoLegacyKeys(parsed);
  assert(Array.isArray(parsed.shelves), "Planogram shelves must be an array.");

  return {
    name:
      typeof parsed.name === "string" && parsed.name.trim()
        ? parsed.name
        : (() => {
            throw new Error("Planogram name is required.");
          })(),
    ...(typeof parsed.description === "string"
      ? { description: parsed.description }
      : {}),
    version:
      typeof parsed.version === "string" || parsed.version === null
        ? parsed.version
        : null,
    status: parseStatus(parsed.status),
    fixture: parseDimensions(parsed.fixture, "fixture"),
    shelves: parsed.shelves.map((shelf, index) =>
      parseShelf(shelf, `shelves[${index}]`),
    ),
  };
}
