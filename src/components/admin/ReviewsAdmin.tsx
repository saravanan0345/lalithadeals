import { useState, useEffect } from "react";
import { Star, Check, X, Trash2, Plus, MessageSquare, ShieldCheck, Clock } from "lucide-react";
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
} from "@/components/ui/dialog";
import {
  fetchAllReviewsForAdmin,
  updateReviewStatus,
  deleteReview,
  submitWebsiteReview,
  type WebsiteReview,
} from "@/lib/reviews";

export function ReviewsAdmin() {
  const [reviews, setReviews] = useState<WebsiteReview[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Form state for manual review add
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [section, setSection] = useState<"costumes" | "frames" | "gifts" | "general">("costumes");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [adding, setAdding] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchAllReviewsForAdmin();
      setReviews(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (id: string, newStatus: "pending" | "approved" | "rejected") => {
    const ok = await updateReviewStatus(id, newStatus);
    if (ok) {
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)),
      );
      if (newStatus === "approved") {
        toast.success("Review approved and published to website!");
      } else if (newStatus === "rejected") {
        toast.info("Review rejected");
      } else {
        toast.info("Review moved to pending");
      }
    } else {
      toast.error("Could not update review status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    const ok = await deleteReview(id);
    if (ok) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success("Review deleted");
    } else {
      toast.error("Could not delete review");
    }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      toast.error("Name and review comment are required");
      return;
    }

    setAdding(true);
    try {
      const res = await submitWebsiteReview({
        name,
        location,
        section,
        rating,
        comment,
      });

      // Automatically approve manually added admin reviews
      await updateReviewStatus(res.review.id, "approved");

      toast.success("Review added and published!");
      setName("");
      setLocation("");
      setComment("");
      setRating(5);
      setAddModalOpen(false);
      loadData();
    } catch {
      toast.error("Failed to add review");
    } finally {
      setAdding(false);
    }
  };

  const pendingCount = reviews.filter((r) => r.status === "pending").length;

  const filteredReviews = reviews.filter((r) => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Customer Reviews Moderation
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Approve reviews posted on the website before they appear publicly.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="candy"
            className="rounded-full font-bold gap-1.5"
            onClick={() => setAddModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Add Review Manually</span>
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
            filter === "all"
              ? "bg-primary text-primary-foreground shadow-soft"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          All ({reviews.length})
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`relative rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
            filter === "pending"
              ? "bg-primary text-primary-foreground shadow-soft"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          <span>Pending Approval ({pendingCount})</span>
          {pendingCount > 0 && (
            <span className="ml-1.5 rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] text-white">
              !
            </span>
          )}
        </button>
        <button
          onClick={() => setFilter("approved")}
          className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
            filter === "approved"
              ? "bg-primary text-primary-foreground shadow-soft"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Approved ({reviews.filter((r) => r.status === "approved").length})
        </button>
        <button
          onClick={() => setFilter("rejected")}
          className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
            filter === "rejected"
              ? "bg-primary text-primary-foreground shadow-soft"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Rejected ({reviews.filter((r) => r.status === "rejected").length})
        </button>
      </div>

      {/* Reviews List */}
      {loading ? (
        <p className="py-10 text-center text-xs text-muted-foreground">Loading reviews…</p>
      ) : filteredReviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold text-foreground">No reviews found in this view</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {filter === "pending"
              ? "All submitted reviews have been moderated!"
              : "Reviews submitted by customers will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-soft transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground text-sm sm:text-base">
                      {rev.name}
                    </span>
                    {rev.location && (
                      <span className="text-xs text-muted-foreground">
                        ({rev.location})
                      </span>
                    )}

                    {rev.status === "approved" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">
                        <ShieldCheck className="h-3 w-3" />
                        Approved (Live)
                      </span>
                    )}
                    {rev.status === "pending" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                        <Clock className="h-3 w-3" />
                        Pending Approval
                      </span>
                    )}
                    {rev.status === "rejected" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-bold text-destructive">
                        <X className="h-3 w-3" />
                        Rejected
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs font-semibold capitalize text-muted-foreground">
                      {rev.section}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(rev.created_at).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                </div>

                {/* Moderation Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {rev.status !== "approved" && (
                    <Button
                      size="sm"
                      variant="candy"
                      className="rounded-full font-bold text-xs gap-1"
                      onClick={() => handleStatusChange(rev.id, "approved")}
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Approve</span>
                    </Button>
                  )}
                  {rev.status !== "rejected" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full font-bold text-xs gap-1 border-border"
                      onClick={() => handleStatusChange(rev.id, "rejected")}
                    >
                      <X className="h-3.5 w-3.5" />
                      <span>Reject</span>
                    </Button>
                  )}
                  {rev.status !== "pending" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-full font-bold text-xs text-muted-foreground"
                      onClick={() => handleStatusChange(rev.id, "pending")}
                    >
                      Set Pending
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(rev.id)}
                    aria-label="Delete review"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <p className="mt-3 text-xs sm:text-sm text-foreground/90 bg-muted/40 rounded-xl p-3">
                "{rev.comment}"
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Add Manual Review Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-md rounded-3xl p-5 sm:p-7 bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Add Customer Review</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleManualAdd} className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label className="text-xs font-bold">Rating</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className="p-1"
                  >
                    <Star
                      className={`h-5 w-5 ${
                        s <= rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="admin-rev-name" className="text-xs font-bold">Customer Name</Label>
              <Input
                id="admin-rev-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh K."
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="admin-rev-loc" className="text-xs font-bold">Location (Optional)</Label>
              <Input
                id="admin-rev-loc"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Porur / Iyyappanthangal"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="admin-rev-sec" className="text-xs font-bold">Section</Label>
              <select
                id="admin-rev-sec"
                value={section}
                onChange={(e) => setSection(e.target.value as any)}
                className="w-full h-9 rounded-md border border-input bg-card px-3 text-xs"
              >
                <option value="costumes">Fancy Costumes</option>
                <option value="frames">Photo Frames</option>
                <option value="gifts">Gifts</option>
                <option value="general">General Experience</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="admin-rev-text" className="text-xs font-bold">Review Message</Label>
              <Textarea
                id="admin-rev-text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Customer's feedback..."
                rows={3}
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full text-xs font-bold"
                onClick={() => setAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="candy"
                disabled={adding}
                className="rounded-full text-xs font-bold"
              >
                {adding ? "Adding…" : "Publish Review"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
