import { useState } from "react";
import { Star, ExternalLink, MapPin, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  GOOGLE_BUSINESS_INFO,
  GOOGLE_MAPS_LINK,
  GOOGLE_REVIEWS_DATA,
  type GoogleReviewItem,
} from "@/lib/reviews";

export function GoogleReviewsSection() {
  const [showFloatingWidget, setShowFloatingWidget] = useState(true);

  // Double the reviews for seamless infinite left-to-right marquee
  const marqueeItems = [...GOOGLE_REVIEWS_DATA, ...GOOGLE_REVIEWS_DATA];

  return (
    <>
      <section id="google-reviews" className="scroll-mt-20 py-12 sm:py-16 bg-background overflow-hidden border-t border-border/50">
        <div className="mx-auto max-w-6xl px-3 sm:px-4">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1 text-xs font-bold text-muted-foreground shadow-soft mb-3">
              <GoogleGIcon className="h-4 w-4" />
              <span>Verified Google Reviews</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Loved by Over 200+ Customers & Parents
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
              Real reviews from our Google Maps profile for fancy costume rentals, personalized frames & gifts in Iyyappanthangal.
            </p>
          </div>
        </div>

        {/* Marquee Carousel (Moving Left to Right) */}
        <div className="relative w-full overflow-hidden py-3">
          {/* Subtle gradient fades on edges */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-8 sm:w-20 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-8 sm:w-20 bg-gradient-to-l from-background to-transparent" />

          <div className="animate-marquee-ltr gap-4 sm:gap-5 px-3">
            {marqueeItems.map((rev, idx) => (
              <GoogleReviewCard key={`${rev.id}-${idx}`} review={rev} />
            ))}
          </div>
        </div>

        {/* Small Bottom Section in Website Color Combination with 'View All' */}
        <div className="mx-auto max-w-6xl px-3 sm:px-4 mt-8 sm:mt-10">
          <div className="rounded-3xl border border-border bg-ivory p-6 sm:p-8 shadow-soft flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-card border border-border shadow-soft">
                <GoogleGIcon className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-foreground">
                    {GOOGLE_BUSINESS_INFO.rating}
                  </span>
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-muted-foreground">
                    (Over 200+ Reviews on Google)
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm font-semibold text-foreground">
                  {GOOGLE_BUSINESS_INFO.name}
                </p>
                <p className="text-[11px] sm:text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" />
                  <span>Kamatchi street, Padmavathi Nagar, Iyyappanthangal</span>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <Button
                asChild
                variant="candy"
                className="w-full sm:w-auto font-bold rounded-full shadow-soft"
              >
                <a href={GOOGLE_MAPS_LINK} target="_blank" rel="noopener noreferrer">
                  <span>View All 200+ Reviews on Google Maps</span>
                  <ExternalLink className="h-4 w-4 ml-1.5" />
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full sm:w-auto font-bold rounded-full border-border bg-card hover:bg-muted"
              >
                <a href={GOOGLE_MAPS_LINK} target="_blank" rel="noopener noreferrer">
                  <span>Write a Review</span>
                  <ExternalLink className="h-3.5 w-3.5 ml-1.5 opacity-70" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Google Review Widget */}
      {showFloatingWidget && (
        <aside
          aria-label="Google customer ratings widget"
          className="fixed bottom-4 left-3 sm:bottom-6 sm:left-6 z-40 animate-fade-in"
        >
          <div className="group relative flex items-center gap-3 rounded-full border border-border/80 bg-card/95 p-2 pr-4 shadow-lift backdrop-blur-md transition-all hover:scale-105 hover:shadow-pop">
            <button
              onClick={() => setShowFloatingWidget(false)}
              className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground hover:bg-destructive hover:text-white transition-colors"
              aria-label="Dismiss review widget"
            >
              <X className="h-3 w-3" />
            </button>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-soft">
              <GoogleGIcon className="h-5 w-5" />
            </div>
            <a
              href={GOOGLE_MAPS_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="text-left cursor-pointer select-none"
            >
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-xs sm:text-sm font-extrabold text-foreground">
                  4.9 Rating
                </span>
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <p className="mt-0.5 text-[10px] sm:text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <span>Over 200+ Reviews on Google Maps</span>
                <ExternalLink className="h-2.5 w-2.5 opacity-60" />
              </p>
            </a>
          </div>
        </aside>
      )}
    </>
  );
}

function GoogleReviewCard({ review }: { review: GoogleReviewItem }) {
  return (
    <article className="w-[280px] sm:w-[320px] shrink-0 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-soft transition-all hover:border-primary/40 hover:shadow-pop flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${review.avatarColor}`}
            >
              {review.author.charAt(0)}
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-foreground line-clamp-1">
                {review.author}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span>{review.timeAgo}</span>
                <span>•</span>
                <span className="flex items-center gap-0.5 text-success font-medium">
                  <CheckCircle2 className="h-2.5 w-2.5" /> Google
                </span>
              </div>
            </div>
          </div>
          <GoogleGIcon className="h-4 w-4 shrink-0" />
        </div>

        <div className="mt-2.5 flex items-center gap-1">
          {[...Array(review.rating)].map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          ))}
          {review.tag && (
            <span className="ml-1.5 text-[10px] font-bold text-muted-foreground">
              {review.tag}
            </span>
          )}
        </div>

        <p className="mt-2 text-xs text-muted-foreground line-clamp-4 leading-relaxed">
          "{review.text}"
        </p>
      </div>
    </article>
  );
}

function GoogleGIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.4 7.34 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.27 2.6 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
      />
    </svg>
  );
}
