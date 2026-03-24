import { useMutation } from "@tanstack/react-query";

import { createFixture } from "../api/fixtures";

export function useCreateFixture() {
  return useMutation({
    mutationFn: createFixture,
  });
}
