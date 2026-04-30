import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { CampaignListItem } from "@/types/campaigns";

import CampaignHistoryModal from "./campaign-history-modal";

const campaign: CampaignListItem = {
  id: "camp-1",
  name: "Spring Bakery Push",
  status: "Active",
  skus: 120,
  hardware: ["ESL", "LCD"],
  date: "2026-04-29",
  createdAt: "2026-04-20T10:00:00Z",
  initiator: "Maya",
};

describe("CampaignHistoryModal", () => {
  it("should render campaign summary and generated history events", () => {
    render(<CampaignHistoryModal campaign={campaign} onClose={jest.fn()} />);

    expect(screen.getByRole("dialog", { name: /history for spring bakery push/i })).toBeInTheDocument();
    expect(screen.getByText("Campaign History")).toBeInTheDocument();
    expect(screen.getByText("Spring Bakery Push")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Campaign Created")).toBeInTheDocument();
    expect(screen.getByText("Deployed to ESL")).toBeInTheDocument();
  });

  it("should expand an event to show actor metadata", async () => {
    const user = userEvent.setup();

    render(<CampaignHistoryModal campaign={campaign} onClose={jest.fn()} />);

    await user.click(screen.getByRole("button", { name: /campaign created/i }));

    expect(screen.getAllByText("Maya")).toHaveLength(2);
    expect(screen.getAllByText("ESL, LCD")).toHaveLength(2);
  });

  it("should call onClose from close controls", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    render(<CampaignHistoryModal campaign={campaign} onClose={onClose} />);

    const closeButtons = screen.getAllByRole("button", { name: /^close$/i });
    await user.click(closeButtons[closeButtons.length - 1]);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
