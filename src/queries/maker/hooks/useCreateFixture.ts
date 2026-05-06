import { useMutation } from "@tanstack/react-query";

import { createFixture } from "@/lib/api/maker/fixtures";

export function useCreateFixture() {
  return useMutation({
    mutationFn: createFixture,
  });
}
