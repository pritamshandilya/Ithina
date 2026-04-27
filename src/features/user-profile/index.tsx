import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Calendar, CheckCircle2, Edit, LogOut, Save, Settings, X } from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate } from "@tanstack/react-router";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProfileAccountMetadata } from "@/hooks/use-profile-account-metadata";
import { toast } from "@/hooks/use-toast";
import { PromoAuthService } from "@/lib/auth/promo-auth";
import { formatProfileDateTime } from "@/lib/format-datetime";
import { StoreContext } from "@/lib/store-context";
import { cn } from "@/lib/utils";
import { updateUser } from "@/services/users";

function EditableField({
  label,
  value,
  isEditing,
  onChange,
  error,
  required,
}: {
  label: string;
  value: string;
  isEditing: boolean;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </p>
      {isEditing ? (
        <div className="space-y-1">
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={!!error}
            className={cn(error && "border-destructive focus-visible:ring-destructive/20")}
          />
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="flex min-h-9 items-center rounded-md border border-transparent bg-muted/30 px-3 py-2 text-sm text-foreground">
          {value || <span className="text-muted-foreground italic">Not set</span>}
        </p>
      )}
    </div>
  );
}

export default function UserProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [profileVersion, setProfileVersion] = useState(0);
  const user = useMemo(() => PromoAuthService.getCurrentUser(), [profileVersion]);
  const role = user?.role ?? "maker";

  const storeId = useSyncExternalStore(
    StoreContext.subscribe,
    () => StoreContext.getStoreId(),
    () => null,
  );

  const { createdAtIso, lastLoginIso, isLoading: metaLoading } = useProfileAccountMetadata({
    userId: user?.id,
    role,
    storeId,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [firstNameError, setFirstNameError] = useState<string>();
  const [lastNameError, setLastNameError] = useState<string>();

  const saveMutation = useMutation({
    mutationFn: async (payload: { first_name: string; last_name: string }) => {
      if (!user?.id) throw new Error("Not signed in");
      await updateUser(user.id, {
        first_name: payload.first_name,
        last_name: payload.last_name,
      });
      await PromoAuthService.fetchUserInfo();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      setProfileVersion((v) => v + 1);
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your name has been saved.",
      });
    },
    onError: (e: Error) => {
      toast({
        title: "Could not save profile",
        description: e.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-muted-foreground">
        Sign in to view your profile.
      </div>
    );
  }

  const initials = `${(user.firstName || "?").charAt(0)}${(user.lastName || "?").charAt(0)}`.toUpperCase();
  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const createdLabel = formatProfileDateTime(createdAtIso);
  const lastSignInLabel = formatProfileDateTime(lastLoginIso);

  const validate = (): boolean => {
    let ok = true;
    if (!firstName.trim()) {
      setFirstNameError("First name is required");
      ok = false;
    } else setFirstNameError(undefined);
    if (!lastName.trim()) {
      setLastNameError("Last name is required");
      ok = false;
    } else setLastNameError(undefined);
    return ok;
  };

  const handleEdit = () => {
    setIsEditing(true);
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setFirstNameError(undefined);
    setLastNameError(undefined);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setFirstNameError(undefined);
    setLastNameError(undefined);
  };

  const handleSave = () => {
    if (!validate()) return;
    saveMutation.mutate({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
    });
  };

  const handleManageAccount = () => {
    if (role === "admin") {
      navigate({ to: "/admin/organization-settings" });
      return;
    }
    toast({
      title: "Account management",
      description: "Contact your organization admin for account changes beyond your name.",
    });
  };

  const handleLogout = () => {
    PromoAuthService.logout().finally(() => {
      navigate({ to: "/login" });
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto bg-ithina-bg">
      <div className="mx-auto w-full max-w-screen-2xl space-y-6 p-4 sm:p-6">
        <section className="rounded-2xl border border-ithina-border bg-card p-6 shadow-lg sm:p-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <Avatar className="size-24 border-2 border-ithina-purple/30 sm:size-32">
              <AvatarFallback className="bg-ithina-purple/20 text-2xl font-semibold text-ithina-purple sm:text-3xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">{fullName}</h2>
              <p className="text-base text-muted-foreground">{user.email}</p>
              <div className="flex items-center justify-center gap-1.5 sm:justify-start">
                <CheckCircle2 className="size-4 text-emerald-500" aria-hidden />
                <span className="text-sm text-emerald-500">Email verified</span>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-2xl border border-ithina-border bg-card shadow-lg">
              <div className="border-b border-ithina-border/60 p-6 pb-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
                    <p className="text-sm text-muted-foreground">
                      Update your personal details and information.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!isEditing ? (
                      <Button variant="outline" size="sm" onClick={handleEdit} className="gap-1.5">
                        <Edit className="size-4" />
                        Edit
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancel}
                          disabled={saveMutation.isPending}
                          className="gap-1.5"
                        >
                          <X className="size-4" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSave}
                          disabled={saveMutation.isPending}
                          className="gap-1.5"
                        >
                          <Save className="size-4" />
                          {saveMutation.isPending ? "Saving…" : "Save"}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-4 p-6 pt-4">
                <EditableField
                  label="First name"
                  value={isEditing ? firstName : user.firstName}
                  isEditing={isEditing}
                  onChange={setFirstName}
                  error={firstNameError}
                  required
                />
                <EditableField
                  label="Last name"
                  value={isEditing ? lastName : user.lastName}
                  isEditing={isEditing}
                  onChange={setLastName}
                  error={lastNameError}
                  required
                />
                <EditableField label="Email" value={user.email} isEditing={false} onChange={() => {}} />
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-ithina-border bg-card shadow-lg">
              <div className="space-y-1 border-b border-ithina-border/60 p-6 pb-4">
                <h3 className="text-lg font-semibold text-foreground">Account Information</h3>
                <p className="text-sm text-muted-foreground">View your account details and activity.</p>
              </div>
              <div className="space-y-4 p-6 pt-4">
                {metaLoading ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : null}
                {createdLabel ? (
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
                    <div>
                      <p className="text-sm font-medium text-foreground">Account Created</p>
                      <p className="text-sm text-muted-foreground">{createdLabel}</p>
                    </div>
                  </div>
                ) : null}
                {lastSignInLabel ? (
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
                    <div>
                      <p className="text-sm font-medium text-foreground">Last Sign-In</p>
                      <p className="text-sm text-muted-foreground">{lastSignInLabel}</p>
                    </div>
                  </div>
                ) : null}
                <div className="flex items-start gap-3">
                  <Building2 className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
                  <div>
                    <p className="text-sm font-medium text-foreground">Organization</p>
                    <p className="text-sm text-muted-foreground">{user.organization.name}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-ithina-border bg-card shadow-lg">
              <div className="space-y-1 border-b border-ithina-border/60 p-6 pb-4">
                <h3 className="text-lg font-semibold text-foreground">Account Actions</h3>
                <p className="text-sm text-muted-foreground">Manage your account settings and security.</p>
              </div>
              <div className="space-y-3 p-6 pt-4">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 border-ithina-border"
                  onClick={handleManageAccount}
                >
                  <Settings className="size-4" />
                  Manage Account
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 border-ithina-border text-rose-400 hover:bg-rose-400/10 hover:text-rose-300"
                  onClick={handleLogout}
                >
                  <LogOut className="size-4" />
                  Logout
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
