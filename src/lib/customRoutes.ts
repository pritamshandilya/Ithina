import { routeTree } from "../routeTree.gen";
import { Route as LoginRouteImport } from "../routes/login";
import { Route as SignupRouteImport } from "../routes/signup";

const LoginRoute = LoginRouteImport.update({
  path: "/login",
  getParentRoute: () => routeTree,
});

const SignupRoute = SignupRouteImport.update({
  path: "/signup",
  getParentRoute: () => routeTree,
});

const customRoutes: Record<string, typeof LoginRoute | typeof SignupRoute> = {
  "/login": LoginRoute,
  "/signup": SignupRoute,
};

export const customRouteTree = {
  ...routeTree,
  LoginRoute,
  SignupRoute,
  getCustomRoute: (id: string) => {
    return customRoutes[id] || routeTree[id as keyof typeof routeTree] || null;
  },
};