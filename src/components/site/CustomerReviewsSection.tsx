import { useState, useEffect } from "react";
import { Star, MessageSquarePlus, CheckCircle2, HeartHandshake, ShieldCheck, X } from "lucide-react";
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
  const [modalOpen, setModalOpen] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(true);

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

  return (
    <>
      <section id="customer-reviews" className="scroll-mt-20 py-12 sm:py-16 bg-ivory/50 border-t border-border/70">
        <div className="mx-auto max-w-6xl px-3 sm:px-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-bold text-primary shadow-soft mb-2">
                <HeartHandshake className="h-3.5 w-3.5" />
                <span>Customer Feedback</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Customer Reviews
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                Honest feedback submitted directly by visitors on our website.
              </p>
            </div>

            <Button
              variant="candy"
              className="rounded-full font-bold shadow-soft self-start sm:self-auto gap-2"
              onClick={() => {
                setSubmitted(false);
                setModalOpen(true);
              }}
            >
              <MessageSquarePlus className="h-4 w-4" />
              <span>Write a Customer Review</span>
            </Button>
          </div>

          {/* Floating-style Reviews Grid */}
          {loading ? (
            <p className="text-center py-10 text-xs text-muted-foreground">Loading reviews…</p>
          ) : reviews.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-center max-w-md mx-auto">
              <p className="text-sm font-semibold text-foreground">No approved reviews yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Be the first to share your experience with Lalitha Deals!
              </p>
              <Button
                variant="candy"
                size="sm"
                className="mt-4 rounded-full font-bold"
                onClick={() => setModalOpen(true)}
              >
                Write First Review
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((rev) => (
                <article
                  key={rev.id}
                  className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-lift hover:-translate-y-2 hover:shadow-pop transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-extrabold text-primary">
                          {rev.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-foreground">
                            {rev.name}
                          </p>
                          {rev.location && (
                            <p className="text-[10px] sm:text-xs text-muted-foreground">
                              {rev.location}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success">
                        <ShieldCheck className="h-3 w-3" />
                        <span>Verified</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mb-2.5">
                      <div className="flex text-amber-500">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                        {SECTION_LABELS[rev.section] || "General"}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>

                  <p className="mt-4 text-[10px] text-muted-foreground">
                    Posted on {new Date(rev.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Floating Customer Reviews Action Widget */}
      {showFloatingButton && (
        <aside
          aria-label="Floating customer review widget"
          className="fixed bottom-20 left-3 sm:bottom-24 sm:left-6 z-40 animate-fade-in"
        >
          <div className="group relative flex items-center gap-2.5 rounded-full border border-border/80 bg-card/95 p-2 pr-4 shadow-lift backdrop-blur-md transition-all hover:scale-105 hover:shadow-pop hover:border-primary/50">
            <button
              onClick={() => setShowFloatingButton(false)}
              className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground hover:bg-destructive hover:text-white transition-colors"
              aria-label="Dismiss customer review widget"
            >
              <X className="h-2.5 w-2.5" />
            </button>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MessageSquarePlus className="h-4 w-4" />
            </div>
            <button
              onClick={() => {
                setSubmitted(false);
                setModalOpen(true);
              }}
              className="text-left cursor-pointer select-none"
            >
              <p className="text-xs font-extrabold text-foreground leading-tight">
                Customer Reviews
              </p>
              <p className="text-[10px] font-bold text-primary">
                Write a Review ★
              </p>
            </button>
          </div>
        </aside>
      )}

      {/* Customer Review Submission Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
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
                onClick={() => setModalOpen(false)}
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
                  onClick={() => setModalOpen(false)}
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
