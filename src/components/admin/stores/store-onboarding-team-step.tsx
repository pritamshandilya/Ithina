import { Check } from "lucide-react";
import type { AuthSessionUser } from "@/lib/auth/session";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export interface StoreOnboardingTeamStepProps {
  hasStore: boolean;
  usersLoading: boolean;
  assignableUsers: AuthSessionUser[];
  selectedUserIds: Set<string>;
  isFinishing: boolean;
  onToggleUser: (userId: string) => void;
  onBack: () => void;
  onFinish: () => void | Promise<void>;
}

export function StoreOnboardingTeamStep({
  hasStore,
  usersLoading,
  assignableUsers,
  selectedUserIds,
  isFinishing,
  onToggleUser,
  onBack,
  onFinish,
}: StoreOnboardingTeamStepProps) {
  return (
    <Card className="border-border/60 bg-card/70 shadow-xl glassmorphism">
      <CardHeader>
        <CardTitle>Assign users to store</CardTitle>
        <CardDescription>
          Makers and checkers you select will have access to this store.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {!hasStore ? (
          <Skeleton className="h-40 w-full" />
        ) : usersLoading ? (
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
                  onClick={() => onToggleUser(user.id)}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                    selected
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border bg-background/40 text-foreground hover:border-accent/60"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">
                      {user.firstName?.[0] ?? "U"}
                      {user.lastName?.[0] ?? "U"}
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
                  {selected && <Check className="size-4 shrink-0 text-accent" />}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex justify-between pt-2">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button
            type="button"
            className="min-w-[160px]"
            disabled={isFinishing}
            onClick={() => void onFinish()}
          >
            {isFinishing ? "Finishing..." : "Finish onboarding"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

