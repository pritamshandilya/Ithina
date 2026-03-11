import CampaignHistoryTable from "./components/campaign-history-table";
import InsightsGrid from "./components/insights-grid";
import RoosStatusBadge from "./components/roos-status-badge";
import StatCardsGrid from "./components/stat-cards-grid";
import PageHeader from "@/components/shared/page-header";

export default function Dashboard() {
  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Promotions Assistant" },
          { label: "Assistant Dashboard", isActive: true },
        ]}
        title="Overview & Insights"
        actions={<RoosStatusBadge />}
      />

      <div className="flex flex-1 flex-col gap-8 overflow-y-auto p-6 lg:p-8">
        <StatCardsGrid />
        <InsightsGrid />
        <CampaignHistoryTable />
      </div>
    </>
  );
}

