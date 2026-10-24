import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { OffersSection } from "@/components/site/Sections";
import { catalogQuery } from "@/lib/queries";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Special Offers — Lalitha / L Deals" },
      { name: "description", content: "Combos, bundles and seasonal savings at Lalitha / L Deals." },
      { property: "og:title", content: "Special Offers — Lalitha / L Deals" },
      { property: "og:description", content: "Combos, bundles and seasonal savings at Lalitha / L Deals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  component: OffersPage,
});

function OffersPage() {
  const { data } = useSuspenseQuery(catalogQuery);
  return (
    <>
      <OffersSection data={data} />
      <p className="mx-auto max-w-6xl px-4 pb-16"><Link to="/" className="text-sm underline underline-offset-4">Back to home</Link></p>
    </>
  );
}
