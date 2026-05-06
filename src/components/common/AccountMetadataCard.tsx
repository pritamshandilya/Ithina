import { format } from "date-fns";
import { Building2, Calendar, MapPin } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { UserInfo } from "@/providers/auth/context";

interface AccountMetadataCardProps {
  userInfo: UserInfo;
}

export function AccountMetadataCard({ userInfo }: AccountMetadataCardProps) {
  const formatDate = (dateString: string | undefined): string | null => {
    if (!dateString) return null;

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;

      // Format: "January 15, 2024 at 3:45 PM"
      return format(date, "MMMM d, yyyy 'at' h:mm a");
    } catch {
      return null;
    }
  };

  const formattedCreatedAt = formatDate(userInfo.createdAt);
  const formattedLastSignInAt = formatDate(userInfo.lastSignInAt);

  const hasMetadata =
    formattedCreatedAt ||
    formattedLastSignInAt ||
    userInfo.locale ||
    userInfo.organizationName;

  if (!hasMetadata) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
        <CardDescription>
          View your account details and activity
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Account Creation Date */}
        {formattedCreatedAt && (
          <div className="flex items-start gap-3">
            <Calendar className="text-muted-foreground mt-0.5 size-5" />
            <div className="flex-1">
              <p className="text-foreground text-sm font-medium">
                Account Created
              </p>
              <p className="text-muted-foreground text-sm">
                {formattedCreatedAt}
              </p>
            </div>
          </div>
        )}

        {/* Last Sign-In Date */}
        {formattedLastSignInAt && (
          <div className="flex items-start gap-3">
            <Calendar className="text-muted-foreground mt-0.5 size-5" />
            <div className="flex-1">
              <p className="text-foreground text-sm font-medium">
                Last Sign-In
              </p>
              <p className="text-muted-foreground text-sm">
                {formattedLastSignInAt}
              </p>
            </div>
          </div>
        )}

        {/* User Locale */}
        {userInfo.locale && (
          <div className="flex items-start gap-3">
            <MapPin className="text-muted-foreground mt-0.5 size-5" />
            <div className="flex-1">
              <p className="text-foreground text-sm font-medium">Locale</p>
              <p className="text-muted-foreground text-sm">{userInfo.locale}</p>
            </div>
          </div>
        )}

        {/* Organization */}
        {userInfo.organizationName && (
          <div className="flex items-start gap-3">
            <Building2 className="text-muted-foreground mt-0.5 size-5" />
            <div className="flex-1">
              <p className="text-foreground text-sm font-medium">
                Organization
              </p>
              <p className="text-muted-foreground text-sm">
                {userInfo.organizationName}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
