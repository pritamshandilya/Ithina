/**
 * Mock data generators for development and testing
 * This file provides realistic mock data that mirrors the structure of real API responses
 */

import type { Audit, AuditStatus, MockUserContext, QuickStats, Shelf } from "@/types/maker";
import type {
  CheckerAudit,
  ComplianceOverview,
  MockCheckerContext,
  Notification,
  OverrideActivity,
  PublishedAudit,
  PublishingStatus,
  RuleInfo,
  Store,
} from "@/types/checker";

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
 * Email matches login/signup simulation: maker@displaydata.com
 */
export const mockUser: MockUserContext = {
  id: "user-001",
  firstName: "John",
  lastName: "Doe",
  email: "maker@displaydata.com",
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

// ============================================================================
// CHECKER MOCK DATA
// ============================================================================

/**
 * Mock checker user context
 * Email matches login/signup simulation: checker@displaydata.com
 */
export const mockCheckerUser: MockCheckerContext = {
  id: "checker-001",
  firstName: "Sarah",
  lastName: "Manager",
  email: "checker@displaydata.com",
  role: "checker",
  storeId: "store-1234",
  storeName: "Store #1234 - Downtown",
  assignedStoreIds: ["store-1234", "store-5678", "store-9012"],
};

/**
 * Generate mock store list
 */
export function generateMockStores(): Store[] {
  return [
    {
      id: "store-1234",
      name: "Store #1234 - Downtown",
      address: "123 Main St, Downtown",
      pendingAuditCount: 8,
    },
    {
      id: "store-5678",
      name: "Store #5678 - Westside",
      address: "456 West Ave, Westside",
      pendingAuditCount: 5,
    },
    {
      id: "store-9012",
      name: "Store #9012 - Eastgate",
      address: "789 East Blvd, Eastgate",
      pendingAuditCount: 12,
    },
  ];
}

/**
 * Generate mock compliance overview
 */
export function generateMockComplianceOverview(storeId?: string): ComplianceOverview {
  // Base numbers, adjust based on store if needed
  const basePending = storeId === "store-9012" ? 12 : storeId === "store-5678" ? 5 : 8;
  
  return {
    totalPendingAudits: basePending,
    criticalAudits: Math.floor(basePending * 0.2), // ~20% critical
    avgComplianceScore: 82.5 + Math.random() * 10, // 82-92%
    totalApprovedToday: Math.floor(Math.random() * 6) + 3, // 3-8 approved
    totalOverridesToday: Math.floor(Math.random() * 3), // 0-2 overrides
  };
}

/**
 * Generate mock pending audits for checker review
 */
export function generateMockPendingAudits(storeId: string): CheckerAudit[] {
  const shelves = generateMockShelves();
  const pendingAudits: CheckerAudit[] = [];
  
  const makerNames = ["John Doe", "Jane Smith", "Mike Johnson", "Emily Davis"];
  const ruleVersions = ["v2.3.1", "v2.3.0", "v2.2.5"];
  
  // Filter to pending status shelves
  const pendingShelves = shelves.filter((shelf) => shelf.status === "pending");
  
  pendingShelves.forEach((shelf, index) => {
    if (!shelf.lastAuditDate || !shelf.complianceScore) return;
    
    // Generate varying compliance scores including critical ones
    let complianceScore = shelf.complianceScore;
    if (index % 5 === 0) {
      // Every 5th audit is critical
      complianceScore = randomScore(35, 49);
    } else if (index % 3 === 0) {
      // Every 3rd audit needs attention
      complianceScore = randomScore(60, 79);
    }
    
    const violationCount = Math.ceil((100 - complianceScore) / 10);
    const publishingStatus: PublishingStatus = "pending";
    
    const checkerAudit: CheckerAudit = {
      id: `audit-${shelf.id}`,
      shelfId: shelf.id,
      submittedBy: mockUser.id,
      submittedAt: shelf.lastAuditDate,
      mode: index % 2 === 0 ? "vision-edge" : "assist-mode",
      status: "pending",
      complianceScore,
      violationCount,
      ruleVersionUsed: ruleVersions[index % ruleVersions.length],
      publishingStatus,
      submittedByName: makerNames[index % makerNames.length],
      shelfInfo: {
        aisleNumber: shelf.aisleNumber,
        bayNumber: shelf.bayNumber,
        shelfName: shelf.shelfName,
      },
    };
    
    pendingAudits.push(checkerAudit);
  });
  
  // Sort by compliance score (lowest first - default sort)
  return pendingAudits.sort((a, b) => (a.complianceScore || 0) - (b.complianceScore || 0));
}

/**
 * Generate mock notifications
 */
export function generateMockNotifications(storeId: string): Notification[] {
  const notifications: Notification[] = [];
  const now = new Date();
  
  // New audit notification
  notifications.push({
    id: "notif-001",
    type: "new_audit",
    message: "New audit submitted by John Doe for Aisle 1, Bay 2",
    timestamp: new Date(now.getTime() - 15 * 60 * 1000), // 15 minutes ago
    read: false,
    auditId: "audit-shelf-002",
    storeId,
  });
  
  // Critical audit notification
  notifications.push({
    id: "notif-002",
    type: "critical_audit",
    message: "Critical audit needs review: Compliance 42% (Aisle 2, Bay 1)",
    timestamp: new Date(now.getTime() - 45 * 60 * 1000), // 45 minutes ago
    read: false,
    auditId: "audit-shelf-004",
    storeId,
  });
  
  // Rule change notification
  notifications.push({
    id: "notif-003",
    type: "rule_change",
    message: "Rule 'Product Spacing' was updated to v2.3.1",
    timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: true,
    storeId,
  });
  
  // Another new audit
  notifications.push({
    id: "notif-004",
    type: "new_audit",
    message: "New audit submitted by Jane Smith for Aisle 3, Bay 1",
    timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
    read: true,
    auditId: "audit-shelf-007",
    storeId,
  });
  
  // Critical audit
  notifications.push({
    id: "notif-005",
    type: "critical_audit",
    message: "Critical audit needs review: Compliance 38% (Aisle 4, Bay 1)",
    timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000), // 5 hours ago
    read: true,
    auditId: "audit-shelf-010",
    storeId,
  });
  
  return notifications;
}

/**
 * Generate mock rule information
 */
export function generateMockRuleInfo(storeId: string): RuleInfo {
  return {
    activeRulesCount: 24,
    lastModifiedDate: randomPastDate(3),
    currentVersion: "v2.3.1",
    lastModifiedRuleName: "Product Spacing Requirements",
  };
}

/**
 * Generate mock override activity
 */
export function generateMockOverrideActivity(storeId: string): OverrideActivity {
  return {
    overridesToday: Math.floor(Math.random() * 3), // 0-2 today
    overridesThisWeek: Math.floor(Math.random() * 8) + 3, // 3-10 this week
    topOverriddenRule: "Price Tag Placement",
    topOverriddenCount: Math.floor(Math.random() * 5) + 2, // 2-6 times
  };
}

/**
 * Generate mock published audits for event bus status
 */
export function generateMockPublishedAudits(storeId: string): PublishedAudit[] {
  const shelves = generateMockShelves();
  const published: PublishedAudit[] = [];
  const now = new Date();
  
  // Get some approved shelves
  const approvedShelves = shelves.filter((shelf) => shelf.status === "approved").slice(0, 5);
  
  approvedShelves.forEach((shelf, index) => {
    const statuses: PublishingStatus[] = ["published", "published", "published", "failed", "pending"];
    const status = statuses[index % statuses.length];
    
    published.push({
      auditId: `audit-${shelf.id}`,
      shelfInfo: {
        aisleNumber: shelf.aisleNumber,
        bayNumber: shelf.bayNumber,
        shelfName: shelf.shelfName,
      },
      status,
      publishedAt: new Date(now.getTime() - (index + 1) * 15 * 60 * 1000),
      errorMessage: status === "failed" ? "Event bus connection timeout" : undefined,
    });
  });
  
  return published;
}
