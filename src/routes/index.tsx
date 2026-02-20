import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

// Dummy authentication function
const isAuthenticated = () => {
  return localStorage.getItem("isLoggedIn") === "true";
};

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate({ to: "/dashboard" });
    } else {
      navigate({ to: "/login" });
    }
  }, [navigate]);

  return null;
}
