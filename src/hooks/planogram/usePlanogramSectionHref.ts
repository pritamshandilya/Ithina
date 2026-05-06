import { useLocation, useParams } from "@tanstack/react-router";

export type PlanogramSectionHref = {
  list: string;
  newPage: string;
  detail: (planogramId: string) => string;
};

/**
 * Resolves planogram library URLs for checker vs admin (store-scoped) navigation.
 */
export function usePlanogramSectionHref(): PlanogramSectionHref {
  const { pathname } = useLocation();
  const params = useParams({ strict: false }) as { storeId?: string };

  const adminSeg = pathname.match(/^\/admin\/([^/]+)\/planograms(?:\/|$)/)?.[1];
  const storeId = adminSeg ?? params.storeId;

  if (storeId && pathname.startsWith(`/admin/${storeId}/planograms`)) {
    const root = `/admin/${storeId}/planograms`;
    return {
      list: root,
      newPage: `${root}/new`,
      detail: (planogramId: string) => `${root}/${planogramId}`,
    };
  }

  return {
    list: "/checker/planograms",
    newPage: "/checker/planograms/new",
    detail: (planogramId: string) => `/checker/planograms/${planogramId}`,
  };
}
