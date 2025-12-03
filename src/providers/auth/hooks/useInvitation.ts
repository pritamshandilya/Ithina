import type { Auth, UserInvite } from '@/lib/auth';
import { useCallback } from 'react';

export function useInvitation(auth: Auth) {
  const sendInvitation = useCallback(async (data: UserInvite | UserInvite[]) => {
    const response = await auth.sendInvitation(data);
  }, [auth]);

  return {
    sendInvitation,
  };
}
