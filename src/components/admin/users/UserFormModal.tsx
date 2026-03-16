import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { User, X, Check, Mail } from "lucide-react";
import type { AuthSessionUser, UserRole } from "@/lib/auth/session";
import type { UpsertUserPayload } from "@/queries/checker/api/org";

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: UpsertUserPayload) => void;
    initialData?: AuthSessionUser;
    isLoading?: boolean;
    mode?: "create" | "invite" | "edit";
}

const EMPTY_USER_FORM: UpsertUserPayload = {
    email: "",
    first_name: "",
    last_name: "",
    role: "maker",
    is_active: true,
};

function getInitialUserFormData(initialData?: AuthSessionUser): UpsertUserPayload {
    if (!initialData) return EMPTY_USER_FORM;

    return {
        email: initialData.email,
        first_name: initialData.firstName,
        last_name: initialData.lastName,
        role: initialData.role,
        is_active: initialData.isActive,
        store_ids: initialData.storeIds,
    };
}

export function UserFormModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    isLoading = false,
    mode = "invite",
}: UserFormModalProps) {
    const draftSeed = `${mode}:${initialData?.email ?? "new"}`;
    const [draftState, setDraftState] = useState<{
        seed: string;
        values: Partial<UpsertUserPayload>;
    }>({
        seed: draftSeed,
        values: {},
    });
    const formData = {
        ...getInitialUserFormData(initialData),
        ...(draftState.seed === draftSeed ? draftState.values : {}),
    };

    const updateField = <K extends keyof UpsertUserPayload>(
        field: K,
        value: UpsertUserPayload[K],
    ) => {
        setDraftState((prev) => ({
            seed: draftSeed,
            values: {
                ...(prev.seed === draftSeed ? prev.values : {}),
                [field]: value,
            },
        }));
    };

    const handleClose = () => {
        setDraftState({ seed: draftSeed, values: {} });
        onClose();
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const title = mode === "edit" ? "Edit User" : mode === "invite" ? "Invite New User" : "Create User";
    const submitLabel = mode === "edit" ? "Save Changes" : mode === "invite" ? "Send Invitation" : "Create User";

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-lg">
            <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden text-foreground glassmorphism">
                <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-accent/20 rounded-md">
                            <User className="w-4 h-4 text-accent" />
                        </div>
                        <h3 className="text-lg font-semibold tracking-tight">
                            {title}
                        </h3>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-1 hover:bg-muted rounded-md transition-colors text-muted-foreground"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-sm font-medium text-muted-foreground">
                                First Name
                            </Label>
                            <Input
                                id="firstName"
                                placeholder="John"
                                value={formData.first_name}
                                onChange={(e) => updateField("first_name", e.target.value)}
                                className="bg-background border-border focus:border-accent transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-sm font-medium text-muted-foreground">
                                Last Name
                            </Label>
                            <Input
                                id="lastName"
                                placeholder="Doe"
                                value={formData.last_name}
                                onChange={(e) => updateField("last_name", e.target.value)}
                                className="bg-background border-border focus:border-accent transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                            Email Address <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="john.doe@example.com"
                                value={formData.email}
                                onChange={(e) => updateField("email", e.target.value)}
                                className="pl-10 bg-background border-border focus:border-accent transition-all"
                                required
                                disabled={mode === "edit"}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role" className="text-sm font-medium text-muted-foreground">
                            Role <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            id="role"
                            value={formData.role}
                            onChange={(e) => updateField("role", e.target.value as UserRole)}
                        >
                            <option value="admin">Admin</option>
                            <option value="checker">Checker (Store Manager)</option>
                            <option value="maker">Maker (Sales Associate)</option>
                        </Select>
                    </div>

                    {mode === "edit" && (
                        <div className="flex items-center gap-2 pt-2">
                            <input
                                id="is_active"
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e) => updateField("is_active", e.target.checked)}
                                className="rounded border-border text-accent focus:ring-accent"
                            />
                            <Label htmlFor="is_active" className="text-sm font-medium">
                                Active Account
                            </Label>
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-6 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                        >
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                                <Check className="w-4 h-4" />
                            )}
                            {submitLabel}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
