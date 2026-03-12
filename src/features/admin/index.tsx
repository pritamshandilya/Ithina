import { AlertTriangle, CheckCircle, Image, Loader2, Zap } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import PageHeader from "@/components/shared/page-header";
import LoadingSpinner from "@/components/shared/loading-spinner";
import { cn } from "@/lib/utils";
import type { AdminTab, NewRuleForm } from "@/types/admin";
import {
  useAddComplianceRule,
  useBrandTone,
  useComplianceRulesQuery,
  useGlobalDisplayRules,
  useHwPalettes,
  useLcdRules,
  useSaveProfile,
} from "@/hooks/use-admin";

import AiCalibrationTab from "./components/ai-calibration-tab";
import BrandAssetsTab from "./components/brand-assets-tab";
import ComplianceTab from "./components/compliance-tab";
import RuleModal from "./components/rule-modal";

const TABS: { id: AdminTab; label: string; icon: typeof Image }[] = [
  { id: "assets", label: "Brand & Assets", icon: Image },
  { id: "ai", label: "AI Calibration", icon: Zap },
  { id: "compliance", label: "Compliance Rules", icon: CheckCircle },
];

const EMPTY_RULE: NewRuleForm = {
  category: "",
  badge: true,
  priceDisplay: "FULL",
  colorRestrict: "None",
  special: "",
  disclaimer: "",
};

export default function Admin() {
  const [activeTab, setActiveTab] = useState<AdminTab>("assets");
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [newRule, setNewRule] = useState<NewRuleForm>({ ...EMPTY_RULE });

  const { data: palettes = [], isLoading: palLoading, isError: palError } = useHwPalettes();
  const { data: tone, isLoading: toneLoading } = useBrandTone();
  const { data: lcdRules = [], isLoading: lcdLoading } = useLcdRules();
  const { data: complianceRules = [], isLoading: compLoading } = useComplianceRulesQuery();
  const { data: globalRules, isLoading: globalLoading } = useGlobalDisplayRules();

  const addRuleMutation = useAddComplianceRule();
  const saveMutation = useSaveProfile();

  const [localTone, setLocalTone] = useState(tone);
  const [localLcdRules, setLocalLcdRules] = useState(lcdRules);
  const [localComplianceRules, setLocalComplianceRules] = useState(complianceRules);
  const [localGlobalRules, setLocalGlobalRules] = useState(globalRules);

  useEffect(() => { if (tone && !localTone) setLocalTone(tone); }, [tone, localTone]);
  useEffect(() => { if (lcdRules.length > 0 && localLcdRules.length === 0) setLocalLcdRules(lcdRules); }, [lcdRules, localLcdRules.length]);
  useEffect(() => { if (complianceRules.length > 0 && localComplianceRules.length === 0) setLocalComplianceRules(complianceRules); }, [complianceRules, localComplianceRules.length]);
  useEffect(() => { if (globalRules && !localGlobalRules) setLocalGlobalRules(globalRules); }, [globalRules, localGlobalRules]);

  const isLoading = palLoading || toneLoading || lcdLoading || compLoading || globalLoading;
  const hasError = palError;

  const handleToggleLcd = useCallback((key: string) => {
    setLocalLcdRules((prev) =>
      prev.map((r) => (r.key === key ? { ...r, enabled: !r.enabled } : r)),
    );
  }, []);

  const handleAddRule = useCallback(async () => {
    if (!newRule.category) return;
    const rule = await addRuleMutation.mutateAsync(newRule);
    setLocalComplianceRules((prev) => [...prev, rule]);
    setShowRuleModal(false);
    setNewRule({ ...EMPTY_RULE });
  }, [newRule, addRuleMutation]);

  const handleSave = useCallback(async () => {
    await saveMutation.mutateAsync();
  }, [saveMutation]);

  const adminHeader = (
    <PageHeader
      breadcrumbs={[{ label: "Promotions Assistant" }, { label: "Admin Config", isActive: true }]}
      title="System Guardrails"
    />
  );

  if (hasError) {
    return (
      <>
        {adminHeader}
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center" role="alert">
          <AlertTriangle className="size-10 text-rose-400" />
          <h3 className="text-sm font-semibold text-white">Failed to load configuration</h3>
          <p className="text-xs text-slate-400">Please refresh the page and try again.</p>
        </div>
      </>
    );
  }

  return (
    <>
      {adminHeader}

      {isLoading ? (
        <LoadingSpinner label="Loading configuration..." className="flex-1" />
      ) : (
        <div className="relative flex flex-1 flex-col overflow-hidden p-6 animate-[fadeIn_0.4s_ease-out] lg:p-8">
          <div className="relative mx-auto flex h-full w-full max-w-[1200px] flex-col">
            <header className="mb-6 shrink-0">
              <h2 className="text-2xl font-bold tracking-tight text-white">System Guardrails & Brand Profile</h2>
              <p className="mt-1 text-sm text-slate-400">
                Configure the strict JSON constraints enforced by the Agent Pipeline.
              </p>
            </header>

            <div className="mb-6 flex shrink-0 items-center gap-8 border-b border-ithina-border" role="tablist" aria-label="Admin settings tabs">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`panel-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors",
                      isActive
                        ? "border-ithina-purple text-ithina-purple"
                        : "border-transparent text-slate-400 hover:text-slate-200",
                    )}
                  >
                    <Icon className="size-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="flex-1 overflow-y-auto pb-24">
              <div id="panel-assets" role="tabpanel" hidden={activeTab !== "assets"}>
                {activeTab === "assets" && <BrandAssetsTab palettes={palettes} />}
              </div>
              <div id="panel-ai" role="tabpanel" hidden={activeTab !== "ai"}>
                {activeTab === "ai" && localTone && (
                  <AiCalibrationTab
                    tone={localTone}
                    lcdRules={localLcdRules}
                    onToneChange={setLocalTone}
                    onToggleLcd={handleToggleLcd}
                  />
                )}
              </div>
              <div id="panel-compliance" role="tabpanel" hidden={activeTab !== "compliance"}>
                {activeTab === "compliance" && localGlobalRules && (
                  <ComplianceTab
                    rules={localComplianceRules}
                    globalRules={localGlobalRules}
                    onGlobalChange={setLocalGlobalRules}
                    onOpenModal={() => setShowRuleModal(true)}
                  />
                )}
              </div>
            </div>

            <div className="absolute bottom-0 left-0 z-20 flex w-full justify-end border-t border-ithina-border bg-ithina-bg p-6">
              <button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-ithina-purple px-8 py-2.5 text-sm font-bold text-white transition-all hover:bg-ithina-purple-hover disabled:opacity-50"
                style={!saveMutation.isPending ? { boxShadow: "0 0 20px rgba(168,85,247,0.2)" } : undefined}
              >
                {saveMutation.isPending && <Loader2 className="size-4 animate-spin" />}
                {saveMutation.isPending ? "Saving Configuration..." : "Save Profile JSON"}
              </button>
            </div>
          </div>

          {showRuleModal && (
            <RuleModal
              form={newRule}
              onChange={setNewRule}
              onSave={handleAddRule}
              onClose={() => setShowRuleModal(false)}
            />
          )}
        </div>
      )}
    </>
  );
}
