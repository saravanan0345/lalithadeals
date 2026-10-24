import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Section, type ShopSection } from "@/components/site/Sections";
import { catalogQuery } from "@/lib/queries";
import { SECTION_LABEL } from "@/lib/shop";

const SECTIONS: ShopSection[] = ["costumes", "frames", "gifts"];

export const Route = createFileRoute("/shop/$section")({
  loader: async ({ context, params }) => {
    if (!SECTIONS.includes(params.section as ShopSection)) throw notFound();
    await context.queryClient.ensureQueryData(catalogQuery);
    return { title: SECTION_LABEL[params.section as ShopSection] };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — Lalitha / L Deals` },
          { name: "description", content: `Browse all ${loaderData.title.toLowerCase()} at Lalitha / L Deals.` },
          { property: "og:title", content: `${loaderData.title} — Lalitha / L Deals` },
          { property: "og:description", content: `Browse all ${loaderData.title.toLowerCase()} at Lalitha / L Deals.` },
          { property: "og:type", content: "website" },
          { name: "twitter:card", content: "summary_large_image" },
        ]
      : [{ title: "Not found — Lalitha / L Deals" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-4 py-24 text-center"><h1 className="text-2xl font-semibold">Section not found</h1><Link to="/" className="mt-4 inline-block underline">Back to shop</Link></div>
  ),
  component: ShopSectionPage,
});

function ShopSectionPage() {
  const { section } = Route.useParams() as { section: ShopSection };
  const { data } = useSuspenseQuery(catalogQuery);
  const tint = section === "costumes" ? "bg-blush/40" : section === "frames" ? "bg-lavender/50" : "bg-sage/50";
  const intro = section === "costumes"
    ? "Rental costumes for children 15 and under, plus blazers up to age 25."
    : section === "frames"
      ? data.settings?.frame_instructions || "Personalised frames made for your favourite moments."
      : "Thoughtful gifts for every occasion.";
  return (
    <>
      <Section id="all" title={SECTION_LABEL[section]} intro={intro} data={data} section={section} tint={tint} />
      <p className="mx-auto max-w-6xl px-4 pb-16"><Link to="/" className="text-sm underline underline-offset-4">Back to home</Link></p>
    </>
  );
}
