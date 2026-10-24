import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/demo")({
  head: () => ({ meta: [
    { title: "Admin sign in — Lalitha / L Deals" },
    { name: "robots", content: "noindex" },
  ] }),
  component: () => <Navigate to="/admin/login" replace />,
});