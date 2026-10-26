import { supabase } from "@/integrations/supabase/client";

export const GOOGLE_MAPS_LINK = "https://maps.app.goo.gl/otX6cJUc3FDEkcMq5?g_st=ac";

export interface GoogleReviewItem {
  id: string;
  author: string;
  rating: number;
  timeAgo: string;
  text: string;
  avatarColor: string;
  tag?: string;
}

export const GOOGLE_BUSINESS_INFO = {
  name: "Lalitha Fancy Costumes (LFC)",
  location: "Kamatchi street, Padmavathi Nagar, Iyyappanthangal, Chennai 600077",
  rating: 4.9,
  totalReviews: "150+",
  mapsUrl: GOOGLE_MAPS_LINK,
};

export const GOOGLE_REVIEWS_DATA: GoogleReviewItem[] = [
  {
    id: "gr-1",
    author: "Priya Sundaram",
    rating: 5,
    timeAgo: "1 week ago",
    tag: "Fancy Costumes",
    avatarColor: "bg-rose-500",
    text: "Extremely satisfied with the Krishna costume for my 5-year-old son's school annual day. The dress was neatly washed, ironed, and included all accessories like flute, mukut and necklace. Very polite and courteous service!",
  },
  {
    id: "gr-2",
    author: "Karthik Ramachandran",
    rating: 5,
    timeAgo: "2 weeks ago",
    tag: "Costume Rental",
    avatarColor: "bg-sky-500",
    text: "Best costume rental shop in Iyyappanthangal! They have a huge collection for fancy dress competitions. The police uniform fit my daughter perfectly. Reasonable rental deposit and hassle-free return.",
  },
  {
    id: "gr-3",
    author: "Anitha Venkatesh",
    rating: 5,
    timeAgo: "3 weeks ago",
    tag: "Photo Frames & Gifts",
    avatarColor: "bg-emerald-500",
    text: "Ordered a customized wooden photo frame for my parents' 25th anniversary along with a gift hamper. The quality and finishing of the photo print was top notch. Delivered right on time. Highly recommended!",
  },
  {
    id: "gr-4",
    author: "Dr. Suresh Kumar",
    rating: 5,
    timeAgo: "1 month ago",
    tag: "Event Costumes & Blazers",
    avatarColor: "bg-amber-500",
    text: "Rented blazers and historical costumes for our school drama. Excellent condition, sanitized dresses, and they have various sizes. The owner was very helpful in accommodating last-minute size changes.",
  },
  {
    id: "gr-5",
    author: "Divya Meenakshi",
    rating: 5,
    timeAgo: "1 month ago",
    tag: "Personalised Gifts",
    avatarColor: "bg-purple-500",
    text: "Loved their magic mug and personalized photo frames. Fast response on WhatsApp, sent preview designs before finalizing. Truly a hidden gem in Padmavathi Nagar near oil mill road!",
  },
  {
    id: "gr-6",
    author: "Rajesh Kannan",
    rating: 5,
    timeAgo: "2 months ago",
    tag: "Dance & Drama Costumes",
    avatarColor: "bg-indigo-500",
    text: "Superb quality costumes. We took a Bharatanatyam dance costume and accessories. Everything was complete, fresh, and spotless. Saved us so much time!",
  },
  {
    id: "gr-7",
    author: "Bhavani Shankar",
    rating: 5,
    timeAgo: "2 months ago",
    tag: "Acrylic LED Frames",
    avatarColor: "bg-pink-500",
    text: "Wonderful customer service! Got a customized LED acrylic lamp and costume for my nephew. Prices are very transparent and affordable compared to other shops in Porur.",
  },
  {
    id: "gr-8",
    author: "Saranya Vignesh",
    rating: 5,
    timeAgo: "3 months ago",
    tag: "Fancy Dress & School Events",
    avatarColor: "bg-teal-500",
    text: "Best place for school fancy dress costumes and customized gifts in Iyyappanthangal. Very cooperative staff. 5/5 stars without any doubt!",
  },
];

export interface WebsiteReview {
  id: string;
  name: string;
  rating: number;
  section: "costumes" | "frames" | "gifts" | "general";
  comment: string;
  location?: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

const LOCAL_STORAGE_KEY = "lalitha_website_reviews_v1";

export const SEED_WEBSITE_REVIEWS: WebsiteReview[] = [
  {
    id: "w-rev-1",
    name: "Meera R.",
    rating: 5,
    section: "costumes",
    location: "Iyyappanthangal",
    comment: "Rented Spiderman costume for my son's birthday. The fabric was clean, vibrant, and soft for the kid. Seamless pickup and return!",
    status: "approved",
    created_at: "2026-10-22T10:30:00Z",
  },
  {
    id: "w-rev-2",
    name: "Vigneshwaran K.",
    rating: 5,
    section: "frames",
    location: "Porur",
    comment: "The acrylic photo frame exceeded expectations! Crisp high-definition print and the LED light glow looks elegant on our living room wall.",
    status: "approved",
    created_at: "2026-10-20T14:15:00Z",
  },
  {
    id: "w-rev-3",
    name: "Deepa Lakshmi",
    rating: 5,
    section: "gifts",
    location: "Mangadu",
    comment: "Ordered the engraved pen and keychain box for my husband's promotion. Beautiful engraving and packaged very nicely. Thank you Lalitha Deals!",
    status: "approved",
    created_at: "2026-10-18T16:45:00Z",
  },
];

function readLocalReviews(): WebsiteReview[] {
  if (typeof window === "undefined") return SEED_WEBSITE_REVIEWS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SEED_WEBSITE_REVIEWS));
      return SEED_WEBSITE_REVIEWS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_WEBSITE_REVIEWS;
  } catch {
    return SEED_WEBSITE_REVIEWS;
  }
}

function writeLocalReviews(reviews: WebsiteReview[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reviews));
  } catch (err) {
    console.warn("Could not write reviews to local storage:", err);
  }
}

export async function fetchPublicReviews(): Promise<WebsiteReview[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1000);
    const { data, error } = await supabase
      .from("website_reviews" as any)
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .abortSignal(controller.signal);
    clearTimeout(timeout);

    if (!error && data && data.length > 0) {
      return data as WebsiteReview[];
    }
  } catch {
    // fallback to local
  }

  return readLocalReviews().filter((r) => r.status === "approved");
}

export async function fetchAllReviewsForAdmin(): Promise<WebsiteReview[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1000);
    const { data, error } = await supabase
      .from("website_reviews" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .abortSignal(controller.signal);
    clearTimeout(timeout);

    if (!error && data && data.length > 0) {
      return data as WebsiteReview[];
    }
  } catch {
    // fallback to local
  }

  return readLocalReviews();
}

export async function submitWebsiteReview(input: {
  name: string;
  rating: number;
  section: "costumes" | "frames" | "gifts" | "general";
  comment: string;
  location?: string | null;
}): Promise<{ ok: boolean; review: WebsiteReview }> {
  const newReview: WebsiteReview = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    rating: Math.max(1, Math.min(5, input.rating)),
    section: input.section,
    comment: input.comment.trim(),
    location: input.location?.trim() || null,
    status: "pending",
    created_at: new Date().toISOString(),
  };

  // 1. Save in local storage
  const current = readLocalReviews();
  const updated = [newReview, ...current];
  writeLocalReviews(updated);

  // 2. Try saving to Supabase
  try {
    await supabase.from("website_reviews" as any).insert([newReview]);
  } catch (err) {
    console.warn("Could not insert review in Supabase:", err);
  }

  return { ok: true, review: newReview };
}

export async function updateReviewStatus(
  id: string,
  status: "pending" | "approved" | "rejected",
): Promise<boolean> {
  // Update local storage
  const current = readLocalReviews();
  const updated = current.map((r) => (r.id === id ? { ...r, status } : r));
  writeLocalReviews(updated);

  // Update Supabase
  try {
    const { error } = await supabase
      .from("website_reviews" as any)
      .update({ status })
      .eq("id", id);
    if (!error) return true;
  } catch (err) {
    console.warn("Could not update review in Supabase:", err);
  }

  return true;
}

export async function deleteReview(id: string): Promise<boolean> {
  // Delete from local storage
  const current = readLocalReviews();
  const updated = current.filter((r) => r.id !== id);
  writeLocalReviews(updated);

  // Delete from Supabase
  try {
    const { error } = await supabase
      .from("website_reviews" as any)
      .delete()
      .eq("id", id);
    if (!error) return true;
  } catch (err) {
    console.warn("Could not delete review in Supabase:", err);
  }

  return true;
}
