/**
 * Mock data generators for development and testing
 * This file provides realistic mock data that mirrors the structure of real API responses
 */

import type { AdhocAnalysis, Audit, MockUserContext, QuickStats, Shelf } from "@/types/maker";
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
  Violation,
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
      status: "draft", // Draft audit in progress
      lastAuditDate: randomPastDate(0), // Today
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
      status: "draft", // Another draft in progress
      lastAuditDate: randomPastDate(1),
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
      elevation: "Eye Level",
      notes: "Daily delivery at 6am.",
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
      elevation: "Middle",
      notes: "Keep fresh.",
    },
    {
      id: "shelf-015",
      aisleNumber: 5,
      bayNumber: 3,
      shelfName: "Bakery - Cakes",
      status: "never-audited",
      assignedTo: mockUser.id,
      elevation: "Bottom",
      notes: "Check temperature log.",
    }
  );

  // Add more shelves to match the screenshot variety
   shelves.push(
    {
      id: "shelf-016",
      aisleNumber: 1,
      bayNumber: 1,
      shelfName: "Main Entrance Display A",
      status: "approved",
      lastAuditDate: randomPastDate(2),
      complianceScore: 98,
      assignedTo: mockUser.id,
      elevation: "Eye Level",
      notes: "Primary promotional shelf for seasonal items.",
    },
    {
      id: "shelf-017",
      aisleNumber: 4,
      bayNumber: 12,
      shelfName: "Category: Beverages - Cold Storage",
      status: "pending",
      lastAuditDate: randomPastDate(5),
      complianceScore: 85,
      assignedTo: mockUser.id,
      elevation: "Bottom",
      notes: "Heavy stock area for soft drinks.",
    },
    {
      id: "shelf-018",
      aisleNumber: 7,
      bayNumber: 4,
      shelfName: "Premium Wine Gallery 03",
      status: "approved",
      lastAuditDate: new Date(), // Today
      complianceScore: 100,
      assignedTo: mockUser.id,
      elevation: "Top",
      notes: "Climate controlled section for vintage wines.",
    },
    {
      id: "shelf-019",
      aisleNumber: 10,
      bayNumber: 8,
      shelfName: "Snack Aisle - Bulk Section",
      status: "returned",
      lastAuditDate: randomPastDate(10),
      complianceScore: 60,
      assignedTo: mockUser.id,
      elevation: "Middle",
      notes: "High turnover area for family packs.",
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
        mode: Math.random() > 0.5 ? "vision-edge" : "assist-mode",
        status: shelf.status,
        complianceScore: shelf.complianceScore,
      };

      // Draft-specific fields
      if (shelf.status === "draft") {
        audit.draftSavedAt = shelf.lastAuditDate;
        audit.draftProgress = Math.floor(Math.random() * 40) + 30; // 30-70% complete
        // Drafts don't have submittedAt
      } else {
        // All other statuses have submittedAt
        audit.submittedAt = shelf.lastAuditDate;
      }

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

/**
 * Get draft audits (in progress, not submitted)
 */
export function getDraftAudits(): Audit[] {
  const audits = generateMockAudits();
  return audits.filter((audit) => audit.status === "draft");
}

/**
 * Generate mock adhoc analyses (one-off shelf image uploads + AI analysis)
 */
export function generateMockAdhocAnalyses(storeId?: string): AdhocAnalysis[] {
  const stores = generateMockStores();
  const targetStore = storeId ? stores.find((s) => s.id === storeId) ?? stores[0] : stores[0];
  const names = [
    "Aisle 3 Beverages Snapshot",
    "Snacks Bay Quick Check",
    "Dairy Section Overview",
    "Frozen Foods Audit",
    "Bakery End Cap",
  ];
  const statuses: AdhocAnalysis["status"][] = ["completed", "completed", "processing", "completed", "failed"];
  return names.map((name, i) => ({
    id: `adhoc-${targetStore.id}-${i + 1}`,
    name,
    storeId: targetStore.id,
    storeName: targetStore.name,
    createdAt: randomPastDate(7),
    status: statuses[i],
    complianceScore: statuses[i] === "completed" ? randomScore(72, 98) : undefined,
    errorMessage: statuses[i] === "failed" ? "Image quality too low for analysis" : undefined,
  }));
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
export function generateMockPendingAudits(_storeId: string): CheckerAudit[] {
  const shelves = generateMockShelves();
  const pendingAudits: CheckerAudit[] = [];
  
  const makerNames = ["John Doe", "Jane Smith", "Mike Johnson", "Emily Davis", "Sarah Wilson", "David Brown"];
  const ruleVersions = ["v2.3.1", "v2.3.0", "v2.2.5"];
  
  // Expanded shelf names for more diverse mock data
  const additionalShelves = [
    { aisle: 4, bay: 1, name: "Dairy - Milk & Cream" },
    { aisle: 4, bay: 2, name: "Dairy - Cheese" },
    { aisle: 4, bay: 3, name: "Dairy - Yogurt" },
    { aisle: 5, bay: 1, name: "Frozen - Ice Cream" },
    { aisle: 5, bay: 2, name: "Frozen - Vegetables" },
    { aisle: 6, bay: 1, name: "Bakery - Bread" },
    { aisle: 6, bay: 2, name: "Bakery - Pastries" },
    { aisle: 7, bay: 1, name: "Canned Goods - Vegetables" },
  ];
  
  // Filter to pending status shelves
  const pendingShelves = shelves.filter((shelf) => shelf.status === "pending");
  
  pendingShelves.forEach((shelf, index) => {
    if (!shelf.lastAuditDate) return;
    
    // Determine audit mode
    const mode: "vision-edge" | "assist-mode" = index % 2 === 0 ? "vision-edge" : "assist-mode";
    
    // Only Vision Edge has AI-generated compliance scores
    // Assist Mode requires manual checker review first
    let complianceScore: number | undefined;
    let violationCount = 0;
    
    if (mode === "vision-edge" && shelf.complianceScore) {
      // Generate varying compliance scores including critical ones
      complianceScore = shelf.complianceScore;
      if (index % 5 === 0) {
        // Every 5th audit is critical
        complianceScore = randomScore(35, 49);
      } else if (index % 3 === 0) {
        // Every 3rd audit needs attention
        complianceScore = randomScore(60, 79);
      }
      violationCount = Math.ceil((100 - complianceScore) / 10);
    }
    // Assist Mode: no compliance score until checker reviews
    
    const publishingStatus: PublishingStatus = "pending";
    
    const checkerAudit: CheckerAudit = {
      id: `audit-${shelf.id}`,
      shelfId: shelf.id,
      submittedBy: mockUser.id,
      submittedAt: shelf.lastAuditDate,
      mode,
      status: "pending",
      complianceScore, // undefined for assist-mode
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
  
  // Add additional mock audits to fill the queue
  additionalShelves.forEach((shelf, index) => {
    // Determine audit mode
    const mode: "vision-edge" | "assist-mode" = index % 2 === 0 ? "vision-edge" : "assist-mode";
    
    // Only Vision Edge has AI-generated compliance scores
    let complianceScore: number | undefined;
    let violationCount = 0;
    
    if (mode === "vision-edge") {
      complianceScore = randomScore(45, 95);
      violationCount = Math.ceil((100 - complianceScore) / 10);
    }
    // Assist Mode: no compliance score until checker reviews
    
    const checkerAudit: CheckerAudit = {
      id: `audit-extra-${index}`,
      shelfId: `shelf-extra-${index}`,
      submittedBy: mockUser.id,
      submittedAt: randomPastDate(1),
      mode,
      status: "pending",
      complianceScore, // undefined for assist-mode
      violationCount,
      ruleVersionUsed: ruleVersions[index % ruleVersions.length],
      publishingStatus: "pending",
      submittedByName: makerNames[index % makerNames.length],
      shelfInfo: {
        aisleNumber: shelf.aisle,
        bayNumber: shelf.bay,
        shelfName: shelf.name,
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
export function generateMockRuleInfo(_storeId: string): RuleInfo {
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
export function generateMockOverrideActivity(_storeId: string): OverrideActivity {
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
export function generateMockPublishedAudits(_storeId: string): PublishedAudit[] {
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

/**
 * Generate mock violations for an audit
 */
export function generateMockViolations(audit: CheckerAudit): Violation[] {
  const violations: Violation[] = [];
  const violationCount = audit.violationCount;
  
  const ruleTemplates = [
    {
      ruleName: "Product Spacing Requirements",
      severity: "critical" as const,
      description: "Products must maintain minimum spacing of 2 inches",
      expected: "2 inches spacing",
      actual: "0.5 inches spacing",
    },
    {
      ruleName: "Price Tag Placement",
      severity: "warning" as const,
      description: "Price tags must be positioned at shelf edge",
      expected: "Tag at shelf edge",
      actual: "Tag 3 inches back",
    },
    {
      ruleName: "Product Facing Direction",
      severity: "critical" as const,
      description: "All product labels must face forward",
      expected: "Labels facing forward",
      actual: "3 products facing sideways",
    },
    {
      ruleName: "Stock Level Compliance",
      severity: "warning" as const,
      description: "Shelf must be at least 70% stocked",
      expected: "70% stock level",
      actual: "55% stock level",
    },
    {
      ruleName: "Product Grouping",
      severity: "info" as const,
      description: "Similar products must be grouped together",
      expected: "Grouped by category",
      actual: "Mixed categories detected",
    },
    {
      ruleName: "Expiration Date Visibility",
      severity: "critical" as const,
      description: "Expiration dates must be clearly visible",
      expected: "Dates visible from front",
      actual: "5 products with hidden dates",
    },
    {
      ruleName: "Promotional Material Placement",
      severity: "info" as const,
      description: "Promotional tags must not obstruct product labels",
      expected: "No obstruction",
      actual: "2 promotional tags blocking labels",
    },
    {
      ruleName: "Shelf Cleanliness",
      severity: "warning" as const,
      description: "Shelves must be free of dust and debris",
      expected: "Clean shelf surface",
      actual: "Visible dust accumulation",
    },
  ];
  
  for (let i = 0; i < Math.min(violationCount, ruleTemplates.length); i++) {
    const template = ruleTemplates[i];
    violations.push({
      id: `violation-${audit.id}-${i + 1}`,
      ...template,
      overridden: false,
    });
  }
  
  return violations;
}
