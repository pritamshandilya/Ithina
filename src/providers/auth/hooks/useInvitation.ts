import { useCallback } from "react";

import type { Auth, UserInvite } from "@/lib/auth";

export function useInvitation(auth: Auth) {
  const sendInvitation = useCallback(
    async (data: UserInvite | UserInvite[], organizationId?: string) => {
      const response = await auth.sendInvitation(data, organizationId);
      
      return response;
    },
    [auth],
  );

  const listInvitations = useCallback(async (organizationId?: string) => {
    const invitations = await auth.fetchInvitations(organizationId);

    return invitations;
  }, [auth]);

  const revokeInvitation = useCallback(
    async (invitationId: string,) => {
      const response = await auth.revokeInvitation(invitationId);

      return response;
    },
    [auth],
  );

  return {
    sendInvitation,
    listInvitations,
    revokeInvitation,
  };
}
