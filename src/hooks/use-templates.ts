import { useQuery } from "@tanstack/react-query";

import {
  getBuiltinTemplates,
  getTemplateHwFilters,
  getTemplateTags,
  getTemplates,
} from "@/services/templates";

export const templateKeys = {
  all: ["templates"] as const,
  list: ["templates", "list"] as const,
  builtin: ["templates", "builtin"] as const,
  hwFilters: ["templates", "hwFilters"] as const,
  tags: ["templates", "tags"] as const,
};

export function useTemplateList() {
  return useQuery({
    queryKey: templateKeys.list,
    queryFn: getTemplates,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function useBuiltinTemplates() {
  return useQuery({
    queryKey: templateKeys.builtin,
    queryFn: getBuiltinTemplates,
    staleTime: Infinity,
    gcTime: 10 * 60_000,
  });
}

export function useTemplateHwFilters() {
  return useQuery({
    queryKey: templateKeys.hwFilters,
    queryFn: getTemplateHwFilters,
    staleTime: Infinity,
    gcTime: 10 * 60_000,
  });
}

export function useTemplateTags() {
  return useQuery({
    queryKey: templateKeys.tags,
    queryFn: getTemplateTags,
    staleTime: Infinity,
    gcTime: 10 * 60_000,
  });
}
