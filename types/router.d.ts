declare module "@tanstack/router-core" {
  interface UpdatableRouteOptionsExtensions {
    meta?: {
      layoutMode?: "default" | "fullReport" | "stickyTable";
    };
  }
}
