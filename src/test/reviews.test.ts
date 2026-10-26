import { describe, it, expect } from "vitest";
import {
  GOOGLE_BUSINESS_INFO,
  GOOGLE_MAPS_LINK,
  GOOGLE_REVIEWS_DATA,
  SEED_WEBSITE_REVIEWS,
  fetchPublicReviews,
  submitWebsiteReview,
} from "@/lib/reviews";

describe("Reviews module", () => {
  it("contains correct Google Maps business info and link", () => {
    expect(GOOGLE_BUSINESS_INFO.mapsUrl).toBe(GOOGLE_MAPS_LINK);
    expect(GOOGLE_MAPS_LINK).toContain("otX6cJUc3FDEkcMq5");
    expect(GOOGLE_BUSINESS_INFO.rating).toBe(4.9);
    expect(GOOGLE_REVIEWS_DATA.length).toBeGreaterThan(0);
  });

  it("has valid Google reviews with 5-star ratings and content", () => {
    for (const r of GOOGLE_REVIEWS_DATA) {
      expect(r.author).toBeTruthy();
      expect(r.rating).toBe(5);
      expect(r.text).toBeTruthy();
    }
  });

  it("loads public website reviews filtering by approved status", async () => {
    const reviews = await fetchPublicReviews();
    expect(Array.isArray(reviews)).toBe(true);
    for (const r of reviews) {
      expect(r.status).toBe("approved");
    }
  });

  it("submits a new website review with pending status", async () => {
    const res = await submitWebsiteReview({
      name: "Test User",
      rating: 5,
      section: "costumes",
      comment: "Wonderful service and costume quality!",
    });

    expect(res.ok).toBe(true);
    expect(res.review.name).toBe("Test User");
    expect(res.review.status).toBe("pending");
  });
});
