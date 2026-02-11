/**
 * Mock data generators for development and testing
 * This file provides realistic mock data that mirrors the structure of real API responses
 */

import type { Audit, AuditStatus, MockUserContext, QuickStats, Shelf } from "@/types/maker";

/**
 * Generate a random date within the last N days
 */
function randomPastDate(daysAgo: number): Date {
  const now = new Date();
  const past = new Date(now.getTime() - Math.random() * daysAgo * 24 * 60 * 60 * 1000);
  return past;
}

/**
 * Generate a random compliance score between min and max
 */
function randomScore(min = 70, max = 100): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Mock user context for testing
 */
export const mockUser: MockUserContext = {
  id: "user-001",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@store.com",
  role: "maker",
  storeId: "store-1234",
  storeName: "Store #1234 - Downtown",
};

/**
 * Generate mock shelf data
 */
export function generateMockShelves(): Shelf[] {
  const statuses: AuditStatus[] = [
    "never-audited",
    "pending",
    "approved",
    "returned",
  ];

  const shelves: Shelf[] = [];

  // Aisle 1
  shelves.push(
    {
      id: "shelf-001",
      aisleNumber: 1,
      bayNumber: 1,
      shelfName: "Beverages - Soft Drinks",
      description: "Carbonated drinks, soda, energy drinks",
      status: "never-audited",
      assignedTo: mockUser.id,
    },
    {
      id: "shelf-002",
      aisleNumber: 1,
      bayNumber: 2,
      shelfName: "Beverages - Juices",
      status: "approved",
      lastAuditDate: randomPastDate(2),
      complianceScore: 95,
      assignedTo: mockUser.id,
    },
    {
      id: "shelf-003",
      aisleNumber: 1,
      bayNumber: 3,
      shelfName: "Beverages - Water",
      status: "pending",
      lastAuditDate: randomPastDate(1),
      complianceScore: 88,
      assignedTo: mockUser.id,
    }
  );

  // Aisle 2
  shelves.push(
    {
      id: "shelf-004",
      aisleNumber: 2,
      bayNumber: 1,
      shelfName: "Snacks - Chips",
      description: "Potato chips, tortilla chips, pretzels",
      status: "returned",
      lastAuditDate: randomPastDate(3),
      complianceScore: 72,
      assignedTo: mockUser.id,
    },
    {
      id: "shelf-005",
      aisleNumber: 2,
      bayNumber: 2,
      shelfName: "Snacks - Candy",
      status: "approved",
      lastAuditDate: randomPastDate(1),
      complianceScore: 92,
      assignedTo: mockUser.id,
    },
    {
      id: "shelf-006",
      aisleNumber: 2,
      bayNumber: 3,
      shelfName: "Snacks - Cookies",
      status: "never-audited",
      assignedTo: mockUser.id,
    }
  );

  // Aisle 3
  shelves.push(
    {
      id: "shelf-007",
      aisleNumber: 3,
      bayNumber: 1,
      shelfName: "Dairy - Milk",
      status: "approved",
      lastAuditDate: randomPastDate(2),
      complianceScore: 98,
      assignedTo: mockUser.id,
    },
    {
      id: "shelf-008",
      aisleNumber: 3,
      bayNumber: 2,
      shelfName: "Dairy - Yogurt",
      status: "pending",
      lastAuditDate: randomPastDate(1),
      complianceScore: 85,
      assignedTo: mockUser.id,
    },
    {
      id: "shelf-009",
      aisleNumber: 3,
      bayNumber: 3,
      shelfName: "Dairy - Cheese",
      status: "never-audited",
      assignedTo: mockUser.id,
    }
  );

  // Aisle 4
  shelves.push(
    {
      id: "shelf-010",
      aisleNumber: 4,
      bayNumber: 1,
      shelfName: "Frozen - Ice Cream",
      status: "returned",
      lastAuditDate: randomPastDate(4),
      complianceScore: 68,
      assignedTo: mockUser.id,
    },
    {
      id: "shelf-011",
      aisleNumber: 4,
      bayNumber: 2,
      shelfName: "Frozen - Meals",
      status: "approved",
      lastAuditDate: randomPastDate(3),
      complianceScore: 90,
      assignedTo: mockUser.id,
    },
    {
      id: "shelf-012",
      aisleNumber: 4,
      bayNumber: 3,
      shelfName: "Frozen - Vegetables",
      status: "never-audited",
      assignedTo: mockUser.id,
    }
  );

  // Aisle 5
  shelves.push(
    {
      id: "shelf-013",
      aisleNumber: 5,
      bayNumber: 1,
      shelfName: "Bakery - Bread",
      status: "pending",
      lastAuditDate: randomPastDate(1),
      complianceScore: 87,
      assignedTo: mockUser.id,
    },
    {
      id: "shelf-014",
      aisleNumber: 5,
      bayNumber: 2,
      shelfName: "Bakery - Pastries",
      status: "approved",
      lastAuditDate: randomPastDate(2),
      complianceScore: 94,
      assignedTo: mockUser.id,
    },
    {
      id: "shelf-015",
      aisleNumber: 5,
      bayNumber: 3,
      shelfName: "Bakery - Cakes",
      status: "never-audited",
      assignedTo: mockUser.id,
    }
  );

  return shelves;
}

/**
 * Generate mock audit data
 */
export function generateMockAudits(): Audit[] {
  const shelves = generateMockShelves();
  const audits: Audit[] = [];

  // Generate audits for shelves that have been audited
  shelves.forEach((shelf) => {
    if (shelf.status !== "never-audited" && shelf.lastAuditDate) {
      const audit: Audit = {
        id: `audit-${shelf.id}`,
        shelfId: shelf.id,
        submittedBy: mockUser.id,
        submittedAt: shelf.lastAuditDate,
        mode: Math.random() > 0.5 ? "vision-edge" : "assist-mode",
        status: shelf.status,
        complianceScore: shelf.complianceScore,
      };

      // Add rejection details if returned
      if (shelf.status === "returned") {
        audit.rejectionReason = getRandomRejectionReason();
        audit.rejectedAt = new Date(shelf.lastAuditDate.getTime() + 2 * 60 * 60 * 1000);
        audit.rejectedBy = "checker-001";
      }

      // Add approval details if approved
      if (shelf.status === "approved") {
        audit.approvedAt = new Date(shelf.lastAuditDate.getTime() + 1 * 60 * 60 * 1000);
        audit.approvedBy = "checker-001";
      }

      audits.push(audit);
    }
  });

  return audits;
}

/**
 * Get a random rejection reason for returned audits
 */
function getRandomRejectionReason(): string {
  const reasons = [
    "Product placement does not match planogram layout. Please review sections C and D.",
    "Multiple price tags are missing or incorrect. Recheck all product prices.",
    "Image quality is too low for verification. Please retake photos with better lighting.",
    "Shelf appears partially stocked. Complete restocking before submitting audit.",
    "Wrong products detected in designated zones. Correct and resubmit.",
    "Compliance score calculation seems inaccurate. Please reverify product counts.",
  ];
  return reasons[Math.floor(Math.random() * reasons.length)];
}

/**
 * Generate mock quick stats
 */
export function generateMockQuickStats(): QuickStats {
  const shelves = generateMockShelves();

  // Count audits submitted today (within last 24 hours)
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const auditsToday = shelves.filter(
    (shelf) =>
      shelf.lastAuditDate &&
      shelf.lastAuditDate >= today &&
      shelf.status !== "never-audited"
  ).length;

  const pendingCount = shelves.filter((shelf) => shelf.status === "pending").length;
  const returnedCount = shelves.filter((shelf) => shelf.status === "returned").length;

  return {
    auditsSubmittedToday: auditsToday,
    pendingReviewCount: pendingCount,
    returnedAuditsCount: returnedCount,
  };
}

/**
 * Get returned audits with full details
 */
export function getReturnedAudits(): Audit[] {
  const audits = generateMockAudits();
  return audits.filter((audit) => audit.status === "returned");
}
