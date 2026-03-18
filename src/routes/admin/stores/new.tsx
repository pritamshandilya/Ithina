import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, Globe, Store as StoreIcon, Users as UsersIcon } from "lucide-react";

import MainLayout from "@/components/layouts/main";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useCreateStore, useOrgUsers, useAssignStoreUser } from "@/queries/checker";
import { useDimensionUnits } from "@/queries/checker";
import type { StoreDimensionUnit } from "@/lib/constants/dimensions";
import type { StoreSetting } from "@/types/checker";

export const Route = createFileRoute("/admin/stores/new")({
  component: StoreOnboardingPage,
});

type Step = 0 | 1 | 2;

function StoreOnboardingPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createStoreMutation = useCreateStore();
  const assignStoreUserMutation = useAssignStoreUser();
  const { data: orgUsers = [], isLoading: orgUsersLoading } = useOrgUsers();

  const [step, setStep] = useState<Step>(0);
  const [createdStore, setCreatedStore] = useState<StoreSetting | null>(null);

  const [basicForm, setBasicForm] = useState({
    name: "",
    address: "",
    currency: "USD",
  });

  const [configForm, setConfigForm] = useState({
    default_dimensions: "cm" as StoreDimensionUnit,
  });

  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(
    () => new Set(),
  );

  const canContinueBasic =
    basicForm.name.trim().length > 0 &&
    basicForm.address.trim().length > 0 &&
    basicForm.currency.trim().length > 0;

  const canContinueConfig = configForm.default_dimensions.trim().length > 0;

  const { data: dimensionUnits = [] } = useDimensionUnits();

  const assignableUsers = useMemo(
    () => orgUsers.filter((u) => u.role === "maker" || u.role === "checker"),
    [orgUsers],
  );

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleCreateStore = async () => {
    if (!canContinueBasic || !canContinueConfig) return;
    try {
      const store = await createStoreMutation.mutateAsync({
        name: basicForm.name.trim(),
        address: basicForm.address.trim(),
        currency: basicForm.currency.trim().toUpperCase(),
        default_dimensions: configForm.default_dimensions,
      });
      setCreatedStore(store as StoreSetting);
      toast({
        title: "Store created",
        description: "Next, assign users to this store.",
      });
      setStep(2);
    } catch (error) {
      toast({
        title: "Failed to create store",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFinish = async () => {
    if (!createdStore) {
      navigate({ to: "/admin/stores" });
      return;
    }
    try {
      const storeId = createdStore.id;
      const userIds = Array.from(selectedUserIds);
      await Promise.all(
        userIds.map((userId) =>
          assignStoreUserMutation.mutateAsync({ storeId, userId }),
        ),
      );
      toast({
        title: "Store onboarding complete",
        description: "Users have been assigned successfully.",
      });
      navigate({ to: "/admin/stores" });
    } catch (error) {
      toast({
        title: "Failed to assign users",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (step === 2 && !createdStore) {
      setStep(0);
    }
  }, [step, createdStore]);

  return (
    <MainLayout
      pageHeader={
        <PageHeader
          title="Create Store"
          description="Onboard a new store with basic settings and staff assignments."
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/admin/stores" })}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Back to Stores
          </Button>
        </PageHeader>
      }
    >
      <div className="min-h-screen pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
        <div className="mx-auto w-full max-w-screen-2xl space-y-6">
          {/* Step indicator */}
          <ol className="flex flex-wrap items-stretch gap-3 rounded-2xl px-2 py-3 shadow-sm">
            <StepPill
              step={0}
              currentStep={step}
              icon={StoreIcon}
              label="Basic details"
              description="Name and address"
            />
            <StepSeparator />
            <StepPill
              step={1}
              currentStep={step}
              icon={Globe}
              label="Store configuration"
              description="Defaults & dimensions"
            />
            <StepSeparator />
            <StepPill
              step={2}
              currentStep={step}
              icon={UsersIcon}
              label="Team members"
              description="Assign makers & checkers"
            />
          </ol>

          {/* Step content */}
          {step === 0 && (
            <Card className="border-border/60 bg-card/70 shadow-xl glassmorphism">
              <CardHeader>
                <CardTitle>Basic store details</CardTitle>
                <CardDescription>
                  Name and locate your store. You can refine settings later.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="store-name">Store name</Label>
                  <Input
                    id="store-name"
                    placeholder="e.g. Downtown Flagship"
                    value={basicForm.name}
                    onChange={(e) =>
                      setBasicForm((f) => ({ ...f, name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-address">Address</Label>
                  <Input
                    id="store-address"
                    placeholder="Street, City, Region"
                    value={basicForm.address}
                    onChange={(e) =>
                      setBasicForm((f) => ({ ...f, address: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-currency">Currency</Label>
                  <Input
                    id="store-currency"
                    placeholder="e.g. USD, EUR"
                    value={basicForm.currency}
                    onChange={(e) =>
                      setBasicForm((f) => ({ ...f, currency: e.target.value }))
                    }
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <Button
                    className="min-w-[140px]"
                    disabled={!canContinueBasic}
                    onClick={() => setStep(1)}
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 1 && (
            <Card className="border-border/60 bg-card/70 shadow-xl glassmorphism">
              <CardHeader>
                <CardTitle>Store configuration</CardTitle>
                <CardDescription>
                  Choose measurement defaults for shelves and planograms.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Default dimension unit</Label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {dimensionUnits.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() =>
                            setConfigForm({ default_dimensions: opt as StoreDimensionUnit })
                          }
                          className={`flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                            configForm.default_dimensions === opt
                              ? "border-accent bg-accent/10 text-accent"
                              : "border-border bg-background/40 text-muted-foreground hover:border-accent/60"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(0)}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    className="min-w-[160px]"
                    disabled={!canContinueConfig || createStoreMutation.isPending}
                    onClick={handleCreateStore}
                  >
                    {createStoreMutation.isPending ? "Creating..." : "Create store"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="border-border/60 bg-card/70 shadow-xl glassmorphism">
              <CardHeader>
                <CardTitle>Assign users to store</CardTitle>
                <CardDescription>
                  Makers and checkers you select will have access to this store.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!createdStore ? (
                  <Skeleton className="h-40 w-full" />
                ) : (
                  <>
                    {orgUsersLoading ? (
                      <Skeleton className="h-32 w-full" />
                    ) : assignableUsers.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No makers or checkers available to assign yet.
                      </p>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {assignableUsers.map((user) => {
                          const selected = selectedUserIds.has(user.id);
                          return (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => toggleUserSelection(user.id)}
                              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                                selected
                                  ? "border-accent bg-accent/10 text-accent"
                                  : "border-border bg-background/40 text-foreground hover:border-accent/60"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">
                                  {user.firstName[0]}
                                  {user.lastName[0]}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate font-medium">
                                    {user.firstName} {user.lastName}
                                  </p>
                                  <p className="truncate text-[11px] text-muted-foreground">
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                              {selected && (
                                <Check className="size-4 shrink-0 text-accent" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}

                <div className="flex justify-between pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    className="min-w-[160px]"
                    disabled={assignStoreUserMutation.isPending}
                    onClick={handleFinish}
                  >
                    {assignStoreUserMutation.isPending ? "Finishing..." : "Finish onboarding"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

interface StepPillProps {
  step: Step;
  currentStep: Step;
  icon: typeof StoreIcon;
  label: string;
  description: string;
}

function StepPill({ step, currentStep, icon: Icon, label, description }: StepPillProps) {
  const isActive = step === currentStep;
  const isCompleted = step < currentStep;

  return (
    <li className="flex-1 min-w-[180px]">
      <div
        className={`flex h-full items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-colors ${
          isActive
            ? "border-accent bg-accent/10 text-accent shadow-md shadow-accent/20"
            : isCompleted
              ? "border-emerald-500/40 bg-emerald-500/8 text-emerald-400"
              : "border-border/70 bg-card/70 text-muted-foreground"
        }`}
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-xs font-semibold">
          {isCompleted ? <Check className="size-4" /> : step + 1}
        </div>
        <div className="flex flex-col items-start gap-0.5">
          <div className="flex items-center gap-2">
            <Icon className="size-4" />
            <span className="text-sm font-semibold">{label}</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </li>
  );
}

function StepSeparator() {
  return (
    <li className="flex items-center">
      <div className="h-px w-6 rounded-full bg-border/70" />
    </li>
  );
}

