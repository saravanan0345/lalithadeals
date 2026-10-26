import { useState, useEffect } from "react";
import { Star, MessageSquarePlus, CheckCircle2, HeartHandshake, ShieldCheck, Filter } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  fetchPublicReviews,
  submitWebsiteReview,
  type WebsiteReview,
} from "@/lib/reviews";

const SECTION_LABELS: Record<string, string> = {
  costumes: "Fancy Costumes",
  frames: "Photo Frames",
  gifts: "Gifts",
  general: "Store Experience",
};

export function CustomerReviewsSection() {
  const [reviews, setReviews] = useState<WebsiteReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [viewAllModalOpen, setViewAllModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Form state
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [section, setSection] = useState<"costumes" | "frames" | "gifts" | "general">("costumes");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await fetchPublicReviews();
      setReviews(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please share a short review");
      return;
    }

    setSubmitting(true);
    try {
      await submitWebsiteReview({
        name,
        location,
        section,
        rating,
        comment,
      });

      setSubmitted(true);
      toast.success("Review submitted! It will appear once approved by our team.");
      // Reset form
      setName("");
      setLocation("");
      setComment("");
      setRating(5);
    } catch {
      toast.error("Could not submit your review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate overall/average rating
  const totalReviewsCount = reviews.length;
  const averageRating =
    totalReviewsCount > 0
      ? (
          reviews.reduce((acc, curr) => acc + curr.rating, 0) /
          totalReviewsCount
        ).toFixed(1)
      : "5.0";

  // Duplicate reviews for seamless left-to-right infinite marquee
  const marqueeItems =
    reviews.length > 0
      ? [...reviews, ...reviews, ...reviews]
      : [];

  const filteredViewAllReviews = reviews.filter((r) => {
    if (categoryFilter === "all") return true;
    return r.section === categoryFilter;
  });

  return (
    <>
      <section
        id="customer-reviews"
        className="scroll-mt-20 py-12 sm:py-16 bg-ivory/50 border-t border-border/70 overflow-hidden"
      >
        <div className="mx-auto max-w-6xl px-3 sm:px-4">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1 text-xs font-bold text-primary shadow-soft mb-3">
              <HeartHandshake className="h-4 w-4" />
              <span>Customer Feedback</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Customer Reviews
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
              Direct reviews shared by customers on our website for costume rentals, personalized frames & gifts.
            </p>
          </div>
        </div>

        {/* Marquee Carousel (Moving Left to Right like Google Reviews) */}
        {loading ? (
          <p className="text-center py-10 text-xs text-muted-foreground">Loading customer reviews…</p>
        ) : reviews.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-center max-w-md mx-auto my-4">
            <p className="text-sm font-semibold text-foreground">No approved reviews yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Be the first to share your experience with Lalitha Deals!
            </p>
            <Button
              variant="candy"
              size="sm"
              className="mt-4 rounded-full font-bold"
              onClick={() => {
                setSubmitted(false);
                setSubmitModalOpen(true);
              }}
            >
              Write First Review
            </Button>
          </div>
        ) : (
          <div className="relative w-full overflow-hidden py-3">
            {/* Subtle gradient fades on edges */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-8 sm:w-20 bg-gradient-to-r from-ivory/80 to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-8 sm:w-20 bg-gradient-to-l from-ivory/80 to-transparent" />

            <div className="animate-marquee-ltr gap-4 sm:gap-5 px-3">
              {marqueeItems.map((rev, idx) => (
                <CustomerReviewCard key={`${rev.id}-${idx}`} review={rev} />
              ))}
            </div>
          </div>
        )}

        {/* Small Bottom Section in Website Color Combination with Overall Rating & 'View All' */}
        <div className="mx-auto max-w-6xl px-3 sm:px-4 mt-8 sm:mt-10">
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-soft flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-border shadow-soft">
                <HeartHandshake className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-foreground">
                    {averageRating}
                  </span>
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-muted-foreground">
                    ({totalReviewsCount} Website Customer Reviews)
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm font-semibold text-foreground">
                  Overall Customer Rating: {averageRating} out of 5 Stars
                </p>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                  Verified feedback submitted directly through Lalitha Deals storefront.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <Button
                variant="candy"
                className="w-full sm:w-auto font-bold rounded-full shadow-soft"
                onClick={() => setViewAllModalOpen(true)}
              >
                View All Reviews
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto font-bold rounded-full border-border bg-card hover:bg-muted"
                onClick={() => {
                  setSubmitted(false);
                  setSubmitModalOpen(true);
                }}
              >
                <MessageSquarePlus className="h-4 w-4 mr-1.5 text-primary" />
                <span>Write a Review</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 'View All' Website Reviews Modal Dialog */}
      <Dialog open={viewAllModalOpen} onOpenChange={setViewAllModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl p-5 sm:p-7 bg-card">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <HeartHandshake className="h-6 w-6 text-primary" />
              <DialogTitle className="text-xl sm:text-2xl font-extrabold text-foreground">
                Website Customer Reviews ({totalReviewsCount})
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs sm:text-sm">
              All approved reviews posted by genuine visitors and customers on this website.
            </DialogDescription>
          </DialogHeader>

          {/* Overall Rating Summary Bar */}
          <div className="my-2 rounded-2xl border border-border bg-ivory p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-extrabold text-foreground">{averageRating}</span>
              <div>
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-semibold text-muted-foreground">
                  Overall Rating • {totalReviewsCount} Verified Reviews
                </span>
              </div>
            </div>
            <Button
              size="sm"
              variant="candy"
              className="rounded-full font-bold text-xs gap-1.5"
              onClick={() => {
                setViewAllModalOpen(false);
                setSubmitted(false);
                setSubmitModalOpen(true);
              }}
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
              <span>Write a Review</span>
            </Button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {["all", "costumes", "frames", "gifts"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                  categoryFilter === cat
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat === "all" ? "All Reviews" : SECTION_LABELS[cat] || cat}
              </button>
            ))}
          </div>

          {/* List of Website Reviews */}
          <div className="mt-3 space-y-3">
            {filteredViewAllReviews.length === 0 ? (
              <p className="text-center py-6 text-xs text-muted-foreground">
                No reviews found for this category.
              </p>
            ) : (
              filteredViewAllReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="rounded-2xl border border-border bg-muted/30 p-4 transition-all hover:bg-muted/50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-extrabold text-primary">
                        {rev.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-foreground">
                          {rev.name}
                        </p>
                        {rev.location && (
                          <p className="text-[10px] text-muted-foreground">
                            {rev.location}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="flex text-amber-500">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                      {SECTION_LABELS[rev.section] || "General"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(rev.created_at).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <p className="mt-2 text-xs sm:text-sm text-foreground/90 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-border flex justify-end">
            <Button
              variant="outline"
              className="rounded-full text-xs font-bold"
              onClick={() => setViewAllModalOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Customer Review Submission Dialog */}
      <Dialog open={submitModalOpen} onOpenChange={setSubmitModalOpen}>
        <DialogContent className="max-w-md rounded-3xl p-5 sm:p-7 bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-foreground">
              Share Your Experience
            </DialogTitle>
            <DialogDescription className="text-xs">
              Tell us about the costumes, photo frames, or gifts you rented or purchased.
            </DialogDescription>
          </DialogHeader>

          {submitted ? (
            <div className="py-6 text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Review Submitted!</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Thank you so much for your feedback! Once approved by our store admin, it will be published on the website.
              </p>
              <Button
                variant="candy"
                className="rounded-full font-bold mt-2"
                onClick={() => setSubmitModalOpen(false)}
              >
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label htmlFor="rev-rating" className="text-xs font-bold">
                  Your Rating
                </Label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 rounded-md hover:scale-110 transition-transform focus:outline-none"
                      aria-label={`${star} Star`}
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/40"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-bold text-foreground">
                    {rating} of 5 Stars
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="rev-name" className="text-xs font-bold">
                    Your Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="rev-name"
                    placeholder="e.g. Priyadharshini"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rev-loc" className="text-xs font-bold">
                    Location / City (Optional)
                  </Label>
                  <Input
                    id="rev-loc"
                    placeholder="e.g. Iyyappanthangal"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rev-section" className="text-xs font-bold">
                  What did you get from us?
                </Label>
                <select
                  id="rev-section"
                  value={section}
                  onChange={(e) => setSection(e.target.value as any)}
                  className="w-full h-9 rounded-xl border border-input bg-card px-3 text-xs font-medium text-foreground"
                >
                  <option value="costumes">Fancy Costumes</option>
                  <option value="frames">Photo Frames</option>
                  <option value="gifts">Gifts & Hampers</option>
                  <option value="general">Overall Store Experience</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rev-comment" className="text-xs font-bold">
                  Your Review <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="rev-comment"
                  placeholder="Share details about dress quality, neatness, on-time delivery, or custom framing..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  required
                  className="rounded-xl text-xs"
                />
              </div>

              <p className="text-[11px] text-muted-foreground italic">
                * Submitted reviews are moderated by store admin before public display.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full text-xs font-bold"
                  onClick={() => setSubmitModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="candy"
                  disabled={submitting}
                  className="rounded-full text-xs font-bold"
                >
                  {submitting ? "Submitting…" : "Post Review"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function CustomerReviewCard({ review }: { review: WebsiteReview }) {
  return (
    <article className="w-[280px] sm:w-[320px] shrink-0 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-soft transition-all hover:border-primary/40 hover:shadow-pop flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-extrabold text-primary">
              {review.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-foreground line-clamp-1">
                {review.name}
              </p>
              {review.location && (
                <p className="text-[10px] text-muted-foreground">
                  {review.location}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-0.5 rounded-full bg-success/10 px-2 py-0.5 text-[9px] font-bold text-success">
            <ShieldCheck className="h-3 w-3" />
            <span>Verified</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex text-amber-500">
            {[...Array(review.rating)].map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[9px] font-bold text-muted-foreground">
            {SECTION_LABELS[review.section] || "General"}
          </span>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-4 leading-relaxed italic">
          "{review.comment}"
        </p>
      </div>

      <p className="mt-3 text-[10px] text-muted-foreground">
        {new Date(review.created_at).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </p>
    </article>
  );
}
