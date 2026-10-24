import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import hero from "@/assets/hero.jpg";
import { Button } from "@/components/ui/button";
import { OffersSection, Section, type ShopSection } from "@/components/site/Sections";
import { catalogQuery, type Catalog } from "@/lib/queries";
import { DEFAULT_ADDRESS, SHOP, WA_GREETING, directionsLink, imageUrl, waLink } from "@/lib/shop";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lalitha / L Deals — Costume Rentals, Photo Frames & Gifts" },
      { name: "description", content: "Rent costumes for kids and events, order custom photo frames and gifts, and see our latest special offers." },
      { property: "og:title", content: "Lalitha / L Deals — Costume Rentals, Photo Frames & Gifts" },
      { property: "og:description", content: "Costume rentals, custom photo frames and gifts with special offers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  component: Home,
});

function Home() {
  const { data } = useSuspenseQuery(catalogQuery);
  return (
    <>
      <Hero settings={data.settings} />
      <OffersSection data={data} viewAll />
      <Section id="costumes" title="Costumes" tint="bg-blush/40" viewAll
        intro="Rental costumes for children 15 and under, plus blazers up to age 25."
        data={data} section="costumes" />
      <Section id="frames" title="Custom Photo Frames" tint="bg-lavender/50" viewAll
        intro={data.settings?.frame_instructions || "Personalised frames made for your favourite moments."}
        data={data} section="frames" />
      <Section id="gifts" title="Gifts" tint="bg-sage/50" viewAll intro="Thoughtful gifts for every occasion." data={data} section="gifts" />
      <About data={data} />
    </>
  );
}

function Hero({ settings }: { settings: Catalog["settings"] }) {
  const src = imageUrl(settings?.hero_image_path) ?? hero;
  const alt = settings?.hero_alt || "Costumes on a rack beside a gift box and photo frame";
  return (
    <section className="bg-hero">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-20">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Welcome to L Deals</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">Costumes, frames & gifts for every little celebration.</h1>
          <p className="mt-5 max-w-md text-muted-foreground">Rent beautiful costumes for school events and fancy dress, order a custom photo frame, or pick a thoughtful gift — all in one place.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg"><a href="#offers">View Offers</a></Button>
            <Button asChild size="lg" variant="soft"><a href="#costumes">Explore Costumes</a></Button>
            <Button asChild size="lg" variant="whatsapp"><a href={waLink(WA_GREETING)} target="_blank" rel="noreferrer">Contact on WhatsApp</a></Button>
          </div>
        </div>
        <img src={src} alt={alt} width={1600} height={1008} className="aspect-[4/3] w-full rounded-3xl object-cover shadow-lift" />
      </div>
    </section>
  );
}

function About({ data }: { data: Catalog }) {
  const s = data.settings;
  return (
    <section id="contact" className="scroll-mt-24 py-16">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
          <h2 className="text-2xl font-semibold">About Lalitha / L Deals</h2>
          <p className="mt-3 whitespace-pre-line text-muted-foreground">{s?.about || "We rent costumes for school programmes, fancy-dress events and celebrations, and create custom photo frames and gifts."}</p>
        </div>
        <div className="rounded-3xl border border-border bg-ivory p-8 shadow-soft">
          <h2 className="text-2xl font-semibold">Visit or message us</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div><dt className="font-medium">Shop hours</dt><dd className="text-muted-foreground">{SHOP.hours.join(" and ")}</dd></div>
            <div><dt className="font-medium">WhatsApp</dt><dd className="text-muted-foreground">{SHOP.phoneDisplay}</dd></div>
            <div><dt className="font-medium">Address</dt><dd className="whitespace-pre-line text-muted-foreground">{s?.address || DEFAULT_ADDRESS}</dd></div>
          </dl>
          <div className="mt-6 flex flex-wrap gap-3"><Button asChild variant="whatsapp"><a href={waLink(WA_GREETING)} target="_blank" rel="noreferrer">Chat on WhatsApp</a></Button><Button asChild variant="soft"><a href={directionsLink(s)} target="_blank" rel="noreferrer">Get Directions</a></Button></div>
        </div>
      </div>
    </section>
  );
}
