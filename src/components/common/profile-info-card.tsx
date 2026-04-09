import { useState } from "react";
import { Edit, Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EditableField } from "@/components/common/editable-field";
import { useToast } from "@/hooks/use-toast";
import type { UserInfo } from "@/providers/auth/context";

interface ProfileInfoCardProps {
  userInfo: UserInfo;
  onSave: (updates: Partial<UserInfo>) => Promise<void>;
  isSaving?: boolean;
}


export function ProfileInfoCard({
  userInfo,
  onSave,
  isSaving = false,
}: ProfileInfoCardProps) {
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  
  const [firstName, setFirstName] = useState(userInfo.firstName);
  const [lastName, setLastName] = useState(userInfo.lastName);
  
  const [firstNameError, setFirstNameError] = useState<string>();
  const [lastNameError, setLastNameError] = useState<string>();

  const validateFields = (): boolean => {
    let isValid = true;

    if (!firstName.trim()) {
      setFirstNameError("First name is required");
      isValid = false;
    } else {
      setFirstNameError(undefined);
    }
    if (!lastName.trim()) {
      setLastNameError("Last name is required");
      isValid = false;
    } else {
      setLastNameError(undefined);
    }

    return isValid;
  };

  const handleEdit = () => {
    setIsEditing(true);
    setFirstName(userInfo.firstName);
    setLastName(userInfo.lastName);
    setFirstNameError(undefined);
    setLastNameError(undefined);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFirstName(userInfo.firstName);
    setLastName(userInfo.lastName);
    setFirstNameError(undefined);
    setLastNameError(undefined);
  };

  const handleSave = async () => {
    if (!validateFields()) {
      return;
    }

    try {
      await onSave({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      setIsEditing(false);

      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to save changes",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while saving your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details and information
            </CardDescription>
          </div>
          
          {/* Edit/Save/Cancel buttons */}
          <div className="flex gap-2">
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                aria-label="Edit profile information"
              >
                <Edit />
                Edit
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSaving}
                  aria-label="Cancel editing"
                >
                  <X />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  aria-label="Save changes"
                >
                  <Save />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* First Name Field */}
        <EditableField
          label="First Name"
          value={firstName}
          isEditing={isEditing}
          onChange={setFirstName}
          error={firstNameError}
          required
        />

        {/* Last Name Field */}
        <EditableField
          label="Last Name"
          value={lastName}
          isEditing={isEditing}
          onChange={setLastName}
          error={lastNameError}
          required
        />

        {/* Email Field (Read-only) */}
        <EditableField
          label="Email"
          value={userInfo.email}
          isEditing={false}
          onChange={() => {}}
        />
      </CardContent>
    </Card>
  );
}
