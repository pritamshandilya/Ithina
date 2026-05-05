import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { HTMLAttributes } from "react";

import type { InboxItem } from "@/types/approval";

import ApprovalQueueTabulator, { mapApiStatusToApprovalLabel } from "./approval-queue-tabulator";

const mockInboxSnapshot = {
  current: {
    data: [] as InboxItem[],
    isLoading: false,
    isError: false,
  },
};

const mockCampaignsSnapshot = {
  current: {
    data: [] as Array<{
      id: string;
      name: string;
      approvalStatus: "approved" | "rejected" | "pending";
      apiStatus?: string;
      reviewedByName?: string;
      reviewedAt?: string;
      ownerName?: string;
      initiator?: string;
      skus: number;
      hardware: string[];
      date: string;
    }>,
  },
};

const mockApproveMutate = jest.fn();
const mockRejectMutate = jest.fn();

jest.mock("@tanstack/react-query", () => {
  const actual = jest.requireActual<typeof import("@tanstack/react-query")>("@tanstack/react-query");
  return {
    ...actual,
    useQueryClient: () => ({
      getQueryData: jest.fn(() => []),
      invalidateQueries: jest.fn(),
      setQueryData: jest.fn(),
    }),
  };
});

jest.mock("@/hooks/use-active-store-id", () => ({
  useActiveStoreId: () => "store-test",
}));

jest.mock("@/hooks/use-approval", () => ({
  useApproveInboxItem: () => ({
    mutate: mockApproveMutate,
    isPending: false,
  }),
  useRejectInboxItem: () => ({
    mutate: mockRejectMutate,
    isPending: false,
  }),
  useInboxItems: () => mockInboxSnapshot.current,
}));

jest.mock("@/hooks/use-campaigns", () => ({
  campaignKeys: {
    listPrefix: ["campaigns", "list"],
    timeline: (id: string, storeScopeId: string | null) =>
      ["campaigns", "timeline", id, storeScopeId ?? "__org__"] as const,
  },
  useCampaignList: () => mockCampaignsSnapshot.current,
}));

jest.mock("@/hooks/use-toast", () => ({
  toast: jest.fn(),
}));

jest.mock("@/features/approval/approval-publish-watcher", () => ({
  ApprovalPublishWatcher: () => null,
}));

jest.mock("@/features/approval/components/approval-history-dialog", () => ({
  ApprovalHistoryDialog: ({
    open,
    target,
  }: {
    open: boolean;
    target: { id: string; title: string } | null;
  }) =>
    open && target ? (
      <div data-testid="approval-history-dialog" role="dialog" aria-label="Approval history">
        {target.title}
      </div>
    ) : null,
}));

jest.mock("@/components/ui/skeleton", () => ({
  Skeleton: (props: HTMLAttributes<HTMLDivElement>) => (
    <div data-testid="approval-queue-skeleton" {...props} />
  ),
}));

jest.mock("@/components/ui/data-table", () => ({
  DataTable: <T extends object>({
    data,
    emptyMessage,
    onSelectionChange,
    isBulkEnabled,
  }: {
    data: T[];
    emptyMessage?: string;
    onSelectionChange?: (rows: T[]) => void;
    isBulkEnabled?: boolean;
  }) => (
    <div data-testid="mock-data-table">
      {data.length === 0 ? (
        <span>{emptyMessage}</span>
      ) : (
        <>
          <span data-testid="table-row-count">{data.length}</span>
          {isBulkEnabled && onSelectionChange ? (
            <button
              type="button"
              data-testid="simulate-bulk-select"
              onClick={() => onSelectionChange(data)}
            >
              Select all visible
            </button>
          ) : null}
        </>
      )}
    </div>
  ),
}));

jest.mock("lucide-react", () => {
  const actual = jest.requireActual<typeof import("lucide-react")>("lucide-react");
  const Stub = () => <svg aria-hidden />;
  return {
    ...actual,
    AlertCircle: Stub,
    Check: Stub,
    Search: Stub,
    X: Stub,
    Zap: Stub,
  };
});

function basePending(over: Partial<InboxItem> = {}): InboxItem {
  return {
    id: over.id ?? "camp-1",
    title: over.title ?? "Winter Promo",
    subtitle: over.subtitle,
    initiator: over.initiator ?? "alice",
    skus: over.skus ?? 12,
    meta: over.meta ?? "",
    metaVariant: over.metaVariant ?? "success",
    urgent: over.urgent ?? false,
    status: "pending",
    scheduleType: over.scheduleType ?? "immediate",
    ...over,
  };
}

function renderQueue() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ApprovalQueueTabulator />
    </QueryClientProvider>,
  );
}

describe("mapApiStatusToApprovalLabel", () => {
  it("maps guardrails_review to Draft (maker guard-rails step, not checker approval)", () => {
    expect(mapApiStatusToApprovalLabel("guardrails_review")).toBe("Draft");
  });

  it("maps pending_approval to Pending", () => {
    expect(mapApiStatusToApprovalLabel("pending_approval")).toBe("Pending");
  });
});

describe("ApprovalQueueTabulator", () => {
  beforeEach(() => {
    mockInboxSnapshot.current = { data: [], isLoading: false, isError: false };
    mockCampaignsSnapshot.current = { data: [] };
    mockApproveMutate.mockClear();
    mockRejectMutate.mockClear();
  });

  describe("rendering", () => {
    it("should render tab controls for Pending Approval, Approved, Draft, and All", () => {
      renderQueue();

      expect(screen.getByRole("button", { name: /pending approval/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^approved$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /draft/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^all$/i })).toBeInTheDocument();
    });

    it("should show the pending inbox count on the Pending Approval tab", () => {
      mockInboxSnapshot.current = {
        data: [
          basePending({ id: "a", title: "One" }),
          basePending({ id: "b", title: "Two", status: "approved" }),
          basePending({ id: "c", title: "Three" }),
        ],
        isLoading: false,
        isError: false,
      };
      mockCampaignsSnapshot.current = {
        data: [
          { id: "a", name: "One", approvalStatus: "pending", apiStatus: "pending_approval", skus: 5, hardware: [], date: "5/5/2026" },
          { id: "b", name: "Two", approvalStatus: "approved", apiStatus: "approved", skus: 3, hardware: [], date: "5/5/2026" },
          { id: "c", name: "Three", approvalStatus: "pending", apiStatus: "pending_approval", skus: 8, hardware: [], date: "5/4/2026" },
          { id: "d", name: "Draft", approvalStatus: "pending", apiStatus: "draft", skus: 2, hardware: [], date: "5/3/2026" },
        ],
      };

      renderQueue();

      expect(screen.getByRole("button", { name: /pending approval/i })).toHaveTextContent("2");
    });

    it("should render the search field with an accessible label", () => {
      renderQueue();

      expect(screen.getByRole("searchbox", { name: /search approval queue/i })).toBeInTheDocument();
    });

    it("should show skeleton placeholders while the inbox is loading", () => {
      mockInboxSnapshot.current = { data: [], isLoading: true, isError: false };

      renderQueue();

      expect(screen.getAllByTestId("approval-queue-skeleton")).toHaveLength(6);
    });

    it("should show an alert when the inbox query fails", () => {
      mockInboxSnapshot.current = { data: [], isLoading: false, isError: true };

      renderQueue();

      expect(screen.getByRole("alert")).toHaveTextContent(/failed to load approval queue/i);
    });

    it("should show the pending empty state when there are no pending items", () => {
      mockInboxSnapshot.current = { data: [], isLoading: false, isError: false };

      renderQueue();

      expect(screen.getByText("No pending submissions.")).toBeInTheDocument();
    });

    it("should show the approved empty state on the Approved tab", async () => {
      const user = userEvent.setup();
      mockInboxSnapshot.current = { data: [], isLoading: false, isError: false };

      renderQueue();

      await user.click(screen.getByRole("button", { name: /^approved$/i }));

      expect(screen.getByText("No approved campaigns.")).toBeInTheDocument();
    });

    it("should show the draft empty state on the Draft tab", async () => {
      const user = userEvent.setup();
      mockInboxSnapshot.current = { data: [], isLoading: false, isError: false };

      renderQueue();

      await user.click(screen.getByRole("button", { name: /draft/i }));

      expect(screen.getByText("No draft campaigns.")).toBeInTheDocument();
    });

    it("should show draft count on the Draft tab", () => {
      mockInboxSnapshot.current = { data: [], isLoading: false, isError: false };
      mockCampaignsSnapshot.current = {
        data: [
          { id: "d", name: "DraftCamp", approvalStatus: "pending", apiStatus: "draft", skus: 2, hardware: [], date: "5/3/2026" },
          { id: "e", name: "Pending", approvalStatus: "pending", apiStatus: "pending_approval", skus: 1, hardware: [], date: "5/3/2026" },
        ],
      };

      renderQueue();

      expect(screen.getByRole("button", { name: /draft/i })).toHaveTextContent("1");
    });

    it("should show the all-campaigns empty state on the All tab", async () => {
      const user = userEvent.setup();
      mockInboxSnapshot.current = { data: [], isLoading: false, isError: false };

      renderQueue();

      await user.click(screen.getByRole("button", { name: /^all$/i }));

      expect(screen.getByText("No campaigns.")).toBeInTheDocument();
    });
  });

  describe("search and filtering", () => {
    it("should narrow pending rows based on the search query", async () => {
      const user = userEvent.setup();
      mockInboxSnapshot.current = {
        data: [
          basePending({ id: "1", title: "Alpha Sale", initiator: "sam" }),
          basePending({ id: "2", title: "Beta Promo", initiator: "dana" }),
        ],
        isLoading: false,
        isError: false,
      };

      renderQueue();

      expect(screen.getByTestId("table-row-count")).toHaveTextContent("2");

      await user.clear(screen.getByRole("searchbox", { name: /search approval queue/i }));
      await user.type(screen.getByRole("searchbox", { name: /search approval queue/i }), "Beta");

      expect(screen.getByTestId("table-row-count")).toHaveTextContent("1");
    });
  });

  describe("bulk actions on Pending tab", () => {
    it("should keep Approve, Approve & go live, and Reject disabled until rows are selected", () => {
      mockInboxSnapshot.current = {
        data: [basePending({ id: "x1", title: "Queued" })],
        isLoading: false,
        isError: false,
      };

      renderQueue();

      expect(screen.getByRole("button", { name: /^approve$/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: /approve & go live/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: /^reject$/i })).toBeDisabled();
    });

    it('should call approve mutate once per selected row when Approve is clicked', async () => {
      const user = userEvent.setup();
      mockInboxSnapshot.current = {
        data: [
          basePending({ id: "r1", title: "A" }),
          basePending({ id: "r2", title: "B" }),
        ],
        isLoading: false,
        isError: false,
      };

      renderQueue();

      await user.click(screen.getByTestId("simulate-bulk-select"));

      await user.click(screen.getByRole("button", { name: /^approve$/i }));

      expect(mockApproveMutate).toHaveBeenCalledTimes(2);
      expect(mockApproveMutate).toHaveBeenCalledWith(
        { id: "r1", scheduleType: "immediate", selectedVariantId: undefined },
        expect.any(Object),
      );
      expect(mockApproveMutate).toHaveBeenCalledWith(
        { id: "r2", scheduleType: "immediate", selectedVariantId: undefined },
        expect.any(Object),
      );
    });

    it("should open the reject confirmation dialog and call reject mutate for each selected row", async () => {
      const user = userEvent.setup();
      mockInboxSnapshot.current = {
        data: [basePending({ id: "rej-1", title: "Drop me" })],
        isLoading: false,
        isError: false,
      };

      renderQueue();

      await user.click(screen.getByTestId("simulate-bulk-select"));

      await user.click(screen.getByRole("button", { name: /^reject$/i }));

      const dialog = screen.getByRole("dialog", { name: /reject selected campaigns/i });

      await user.click(within(dialog).getByRole("button", { name: /^reject$/i }));

      expect(mockRejectMutate).toHaveBeenCalledTimes(1);
      expect(mockRejectMutate).toHaveBeenCalledWith("rej-1");
    });
  });
});
