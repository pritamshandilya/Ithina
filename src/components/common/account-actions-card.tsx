import { Settings, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AccountActionsCardProps {
  onManageAccount: () => void;
  onLogout: () => void;
}

export function AccountActionsCard({
  onManageAccount,
  onLogout,
}: AccountActionsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Actions</CardTitle>
        <CardDescription>
          Manage your account settings and security
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Manage Account Button */}
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={onManageAccount}
          aria-label="Manage account settings"
        >
          <Settings />
          Manage Account
        </Button>

        {/* Logout Button */}
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={onLogout}
          aria-label="Logout from account"
        >
          <LogOut />
          Logout
        </Button>
      </CardContent>
    </Card>
  );
}
