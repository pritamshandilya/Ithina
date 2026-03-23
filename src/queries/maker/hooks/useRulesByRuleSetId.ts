/**
 * useRulesByRuleSetId Hook
 *
 * Fetches rules in a compliance rule set (read-only view for maker).
 * API errors (e.g. not found) surface as query error + a destructive toast once per rule set id.
 */

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";

import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/exceptions/ApiError";
import { fetchRulesByRuleSetId } from "@/queries/maker/api/compliance-rule-sets";

export const rulesByRuleSetIdKeys = {
  all: ["rules-by-rule-set"] as const,
  byId: (ruleSetId: string | null) =>
    [...rulesByRuleSetIdKeys.all, ruleSetId] as const,
};

function rulesLoadErrorDescription(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return "This compliance rule set was not found.";
    }
    if (error.status === 422) {
      return "Invalid rule set id or request.";
    }
    return error.message || "Could not load compliance rules.";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Could not load compliance rules.";
}

export function useRulesByRuleSetId(ruleSetId: string | null) {
  const { toast } = useToast();
  const lastToastedForIdRef = useRef<string | null>(null);

  useEffect(() => {
    lastToastedForIdRef.current = null;
  }, [ruleSetId]);

  const query = useQuery({
    queryKey: rulesByRuleSetIdKeys.byId(ruleSetId),
    queryFn: () => fetchRulesByRuleSetId(ruleSetId!),
    enabled: !!ruleSetId,
    staleTime: 2 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && (error.status === 404 || error.status === 422)) {
        return false;
      }
      return failureCount < 2;
    },
  });

  useEffect(() => {
    if (!ruleSetId || !query.isError || query.isPending) return;
    if (lastToastedForIdRef.current === ruleSetId) return;
    lastToastedForIdRef.current = ruleSetId;
    toast({
      title: "Compliance rule set",
      description: rulesLoadErrorDescription(query.error),
      variant: "destructive",
    });
  }, [ruleSetId, query.isError, query.isPending, query.error, toast]);

  return query;
}
