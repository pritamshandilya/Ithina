import { CheckCircle2, XCircle } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarUploadOverlay } from "@/components/common/avatar-upload-overlay";
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
  const initials = `${userInfo.firstName.charAt(0)}${userInfo.lastName.charAt(0)}`.toUpperCase();

  return (
    <div className="flex flex-col items-center space-y-4 sm:flex-row sm:items-start sm:space-x-6 sm:space-y-0">
      {/* Avatar Section */}
      <div className="relative">
        <Avatar className="size-24 sm:size-32">
          {userInfo.profilePictureUrl && (
            <AvatarImage
              src={userInfo.profilePictureUrl}
              alt={`${userInfo.firstName} ${userInfo.lastName}`}
            />
          )}
          <AvatarFallback className="bg-accent text-accent-foreground text-2xl sm:text-3xl font-semibold">
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
      <div className="flex-1 text-center sm:text-left space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          {userInfo.firstName} {userInfo.lastName}
        </h1>
        
        <div className="flex flex-col items-center sm:items-start space-y-1">
          <p className="text-base text-muted-foreground">{userInfo.email}</p>
          
          {/* Email Verification Badge */}
          <div className="flex items-center gap-1.5">
            {userInfo.emailVerified ? (
              <>
                <CheckCircle2 className="size-4 text-chart-2" />
                <span className="text-sm text-chart-2">Email verified</span>
              </>
            ) : (
              <>
                <XCircle className="size-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Email not verified</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
