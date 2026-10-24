import { createFileRoute } from "@tanstack/react-router";

// Serves catalogue images from the private image store so they work on the site and in WhatsApp links.
export const Route = createFileRoute("/api/public/images/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = decodeURIComponent(params._splat ?? "");
        if (!/^(products|offers|hero)\/[\w-]+\.(jpg|jpeg|png|webp|gif)$/i.test(path)) {
          return new Response("Not found", { status: 404 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from("product-images").download(path);
        if (error || !data) return new Response("Not found", { status: 404 });
        return new Response(data, {
          headers: { "content-type": data.type || "image/jpeg", "cache-control": "public, max-age=3600" },
        });
      },
    },
  },
});
