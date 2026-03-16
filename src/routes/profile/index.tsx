import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import MainLayout from "@/components/layouts/main";
import {
  AccountActionsCard,
  AccountMetadataCard,
  ProfileHeader,
  ProfileInfoCard,
} from "@/components/common";
import { useToast } from "@/hooks/use-toast";
import {
  AuthSessionService,
  getInitialsFromEmail,
} from "@/lib/auth/session";
import type { UserInfo } from "@/providers/auth/context";
import { useStore } from "@/providers/store";
import type { BeforeLoadArgs } from "@/routes/__root";
import { requireAuth } from "@/routes/-guards/requireAuth";
import type { RootState } from "@/store";

import "./profile.css";

export const Route = createFileRoute("/profile/")({
  beforeLoad: ({ context, location }: BeforeLoadArgs) => {
    requireAuth(context, location);
  },
  component: ProfilePage,
});

const selectProfile = (state: RootState) => state.profile ?? {};

function ProfilePage() {
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { setSelectedStore } = useStore();
  const { toast } = useToast();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const localProfile = useSelector(selectProfile);
  const currentUser = useMemo(() => AuthSessionService.getCurrentUser(), []);

  const userInfo: UserInfo | null = useMemo(() => {
    if (!currentUser) return null;

    const fallbackNames = getInitialsFromEmail(currentUser.email);
    const firstName =
      localProfile?.firstName ||
      currentUser.firstName.trim() ||
      fallbackNames.firstName;
    const lastName =
      localProfile?.lastName ||
      currentUser.lastName.trim() ||
      fallbackNames.lastName;

    return {
      id: currentUser.id,
      firstName,
      lastName,
      email: currentUser.email,
      emailVerified: true,
      profilePictureUrl: localProfile?.profilePictureUrl,
      createdAt: new Date().toISOString(),
      lastSignInAt: new Date().toISOString(),
      organizationName: currentUser.organization.name,
      organizationId: currentUser.organization.id,
    };
  }, [currentUser, localProfile]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleAvatarUpload = async (file: File) => {
    try {
      setIsUploadingAvatar(true);

      // Validate file type (Requirements: 3.2)
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description:
            "Please select a valid image file (JPEG, PNG, GIF, or WebP)",
          variant: "destructive",
        });
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));

      dispatch({
        type: "profile/setProfile",
        payload: {
          ...localProfile,
          profilePictureUrl: URL.createObjectURL(file),
        },
      });

      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleProfileUpdate = async (updates: Partial<UserInfo>) => {
    if (!userInfo) return;

    try {
      setIsSavingProfile(true);

      // Validate required fields (Requirements: 2.3)
      if (updates.firstName !== undefined && !updates.firstName.trim()) {
        toast({
          title: "Validation error",
          description: "First name cannot be empty",
          variant: "destructive",
        });
        throw new Error("First name is required");
      }

      if (updates.lastName !== undefined && !updates.lastName.trim()) {
        toast({
          title: "Validation error",
          description: "Last name cannot be empty",
          variant: "destructive",
        });
        throw new Error("Last name is required");
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));

      dispatch({
        type: "profile/setProfile",
        payload: {
          ...localProfile,
          firstName: updates.firstName ?? userInfo.firstName,
          lastName: updates.lastName ?? userInfo.lastName,
        },
      });

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      if (
        !(
          error instanceof Error &&
          (error.message.includes("required") ||
            error.message.includes("empty"))
        )
      ) {
        toast({
          title: "Update failed",
          description:
            error instanceof Error
              ? error.message
              : "Failed to save changes. Please try again.",
          variant: "destructive",
        });
      }

      throw error;
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleManageAccount = () => {
    try {
      // In a real app, this would navigate to account management
      toast({
        title: "Account Management",
        description: "This would open your account management page.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to open account management. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    AuthSessionService.logout();
    queryClient.clear();
    setSelectedStore(null);
    router.invalidate();
    navigate({ to: "/login" });
  };
  if (isLoading) {
    return (
      <MainLayout>
        <div className="bg-primary min-h-screen pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
          <div className="mx-auto max-w-screen-2xl space-y-4">
            <div className="flex items-center justify-center py-16">
              <div className="space-y-4 text-center">
                <div className="border-accent mx-auto h-12 w-12 animate-spin rounded-full border-b-2" />
                <p className="text-muted-foreground text-sm">
                  Loading profile...
                </p>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!userInfo) {
    return (
      <MainLayout>
        <div className="bg-primary min-h-screen pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
          <div className="mx-auto max-w-screen-2xl space-y-4">
            <div className="flex items-center justify-center py-16">
              <div className="max-w-md space-y-4 text-center">
                <div className="stat-card">
                  <h2 className="text-foreground mb-2 text-xl font-semibold">
                    Failed to load profile information
                  </h2>
                  <p className="text-muted-foreground mb-6 text-sm">
                    Unable to retrieve your profile data. Please try again.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-primary min-h-screen pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
        <div className="mx-auto max-w-screen-2xl space-y-4">
          {/* Page Header */}
          <div className="space-y-2">
            <h1 className="text-foreground text-2xl font-bold">Profile</h1>
            <p className="text-muted-foreground text-sm">
              Manage your account information and preferences
            </p>
          </div>

          <div className="stat-card">
            <ProfileHeader
              userInfo={userInfo}
              onAvatarUpload={handleAvatarUpload}
              isUploading={isUploadingAvatar}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left column - Profile Information */}
            <div className="space-y-4 lg:col-span-2">
              <ProfileInfoCard
                userInfo={userInfo}
                onSave={handleProfileUpdate}
                isSaving={isSavingProfile}
              />
            </div>

            {/* Right column - Metadata and Actions */}
            <div className="space-y-4">
              <AccountMetadataCard userInfo={userInfo} />

              <AccountActionsCard
                onManageAccount={handleManageAccount}
                onLogout={handleLogout}
              />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
