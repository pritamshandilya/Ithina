import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CampaignGate from "./campaign-gate";

const mockNavigate = jest.fn();

jest.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}));

describe("CampaignGate", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("should render studio entry options when picker is hidden", async () => {
    const user = userEvent.setup();
    const onShowPicker = jest.fn();

    render(
      <CampaignGate
        showPicker={false}
        recentCampaigns={[]}
        onShowPicker={onShowPicker}
        onHidePicker={jest.fn()}
        onLoadCampaign={jest.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: /campaign studio/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /new campaign/i }));
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/maker/wizard" });

    await user.click(screen.getByRole("button", { name: /open existing/i }));
    expect(onShowPicker).toHaveBeenCalledTimes(1);
  });

  it("should load a selected recent campaign", async () => {
    const user = userEvent.setup();
    const onLoadCampaign = jest.fn();

    render(
      <CampaignGate
        showPicker
        recentCampaigns={[
          {
            id: "c1",
            name: "Holiday Promo",
            skus: 42,
            hw: "ESL",
            status: "Active",
            statusCls: "text-emerald-400",
          },
        ]}
        onShowPicker={jest.fn()}
        onHidePicker={jest.fn()}
        onLoadCampaign={onLoadCampaign}
      />,
    );

    await user.click(screen.getByRole("button", { name: /holiday promo/i }));

    expect(onLoadCampaign).toHaveBeenCalledWith(expect.objectContaining({ id: "c1" }));
  });
});
