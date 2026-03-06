import { useContext } from "react";

import { AuthContext } from "./context";

export * from "./context";
export * from "./provider";

export function useAuth() {
  return useContext(AuthContext);
}
