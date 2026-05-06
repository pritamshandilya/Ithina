import { CheckCircle2, XCircle } from "lucide-react";

import { AvatarUploadOverlay } from "@/components/common/AvatarUploadOverlay";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserInfo } from "@/providers/auth/context";

interface ProfileHeaderProps {
  userInfo: UserInfo;
  onAvatarUpload?: (file: File) => void;
  isUploading?: boolean;
}

export function ProfileHeader({
  userInfo,
  onAvatarUpload,
  isUploading = false,
}: ProfileHeaderProps) {
  const initials =
    `${userInfo.firstName.charAt(0)}${userInfo.lastName.charAt(0)}`.toUpperCase();

  return (
    <div className="flex flex-col items-center space-y-4 sm:flex-row sm:items-start sm:space-y-0 sm:space-x-6">
      {/* Avatar Section */}
      <div className="relative">
        <Avatar className="size-24 sm:size-32">
          {userInfo.profilePictureUrl && (
            <AvatarImage
              src={userInfo.profilePictureUrl}
              alt={`${userInfo.firstName} ${userInfo.lastName}`}
            />
          )}
          <AvatarFallback className="bg-accent text-accent-foreground text-2xl font-semibold sm:text-3xl">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Avatar Upload Overlay */}
        {onAvatarUpload && (
          <AvatarUploadOverlay
            onFileSelect={onAvatarUpload}
            isUploading={isUploading}
          />
        )}
      </div>

      {/* User Information Section */}
      <div className="flex-1 space-y-2 text-center sm:text-left">
        <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
          {userInfo.firstName} {userInfo.lastName}
        </h1>

        <div className="flex flex-col items-center space-y-1 sm:items-start">
          <p className="text-muted-foreground text-base">{userInfo.email}</p>

          {/* Email Verification Badge */}
          <div className="flex items-center gap-1.5">
            {userInfo.emailVerified ? (
              <>
                <CheckCircle2 className="text-chart-2 size-4" />
                <span className="text-chart-2 text-sm">Email verified</span>
              </>
            ) : (
              <>
                <XCircle className="text-muted-foreground size-4" />
                <span className="text-muted-foreground text-sm">
                  Email not verified
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
