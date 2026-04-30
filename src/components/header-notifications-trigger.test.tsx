import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";

import HeaderNotificationsTrigger from "./header-notifications-trigger";

const mockMarkNotificationsRead = jest.fn();
const mockToastSnapshot = {
  current: {
    notifications: [] as Array<{
      id: string;
      title?: ReactNode;
      description?: ReactNode;
      variant?: "default" | "destructive" | "success" | null;
      createdAt: number;
      readAt?: number;
    }>,
    unreadCount: 0,
    markNotificationsRead: mockMarkNotificationsRead,
  },
};

jest.mock("@/hooks/use-toast", () => ({
  useToast: () => mockToastSnapshot.current,
}));

jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({
    children,
    onOpenChange,
  }: {
    children: ReactNode;
    onOpenChange?: (open: boolean) => void;
  }) => <div onMouseDown={() => onOpenChange?.(true)}>{children}</div>,
  DropdownMenuContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <div role="separator" />,
  DropdownMenuTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

describe("HeaderNotificationsTrigger", () => {
  beforeEach(() => {
    mockMarkNotificationsRead.mockClear();
    mockToastSnapshot.current = {
      notifications: [],
      unreadCount: 0,
      markNotificationsRead: mockMarkNotificationsRead,
    };
  });

  it("should render an empty notification state", () => {
    render(<HeaderNotificationsTrigger />);

    expect(screen.getByRole("button", { name: /notifications/i })).toBeInTheDocument();
    expect(screen.getByText("No notifications yet.")).toBeInTheDocument();
  });

  it("should show recent notifications and mark unread items as read when opened", async () => {
    const user = userEvent.setup();
    mockToastSnapshot.current = {
      notifications: [
        {
          id: "toast-1",
          title: "Upload failed",
          description: "Please try again.",
          variant: "destructive",
          createdAt: new Date("2026-04-29T17:00:00.000Z").getTime(),
        },
      ],
      unreadCount: 1,
      markNotificationsRead: mockMarkNotificationsRead,
    };

    render(<HeaderNotificationsTrigger />);

    const notificationsButton = screen.getByRole("button", { name: /notifications/i });
    expect(within(notificationsButton).getByText("1")).toBeInTheDocument();
    expect(screen.getByText("Upload failed")).toBeInTheDocument();
    expect(screen.getByText("Please try again.")).toBeInTheDocument();

    await user.click(notificationsButton);

    expect(mockMarkNotificationsRead).toHaveBeenCalledTimes(1);
  });
});
