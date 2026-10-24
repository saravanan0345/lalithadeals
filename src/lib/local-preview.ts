import type { Database } from "@/integrations/supabase/types";

type PreviewCatalog = {
  categories: Database["public"]["Tables"]["categories"]["Row"][];
  products: Database["public"]["Tables"]["products"]["Row"][];
  offers: Database["public"]["Tables"]["offers"]["Row"][];
  settings: Database["public"]["Tables"]["settings"]["Row"];
};

const createdAt = "2026-10-21T00:00:00.000Z";

export const localPreviewCatalog = {
  categories: [
    {
      id: "00000000-0000-4000-8000-000000000001",
      name: "Kids' costumes",
      section: "costumes",
      sort_order: 0,
      created_at: createdAt,
    },
  ],
  products: [
    {
      id: "00000000-0000-4000-8000-000000000011",
      name: "Celebration costume (sample)",
      section: "costumes",
      category_id: "00000000-0000-4000-8000-000000000001",
      description: "A sample costume listing for the local preview.",
      price: 350,
      mrp: null,
      image_path: null,
      is_available: true,
      stock: 2,
      sort_order: 0,
      created_at: createdAt,
      age_info: "Ages 5–10",
      size_info: "Sample listing",
      rental_terms: "Sample rental terms. Confirm availability with the shop.",
      customization: null,
    },
    {
      id: "00000000-0000-4000-8000-000000000012",
      name: "Personalised photo frame (sample)",
      section: "frames",
      category_id: null,
      description: "A sample frame listing. Add your own catalog after connecting Supabase.",
      price: 650,
      mrp: null,
      image_path: null,
      is_available: true,
      stock: null,
      sort_order: 0,
      created_at: createdAt,
      age_info: null,
      size_info: "Sample listing",
      rental_terms: null,
      customization: "Sample customisation details",
    },
    {
      id: "00000000-0000-4000-8000-000000000013",
      name: "Celebration gift box (sample)",
      section: "gifts",
      category_id: null,
      description: "A sample gift listing for the local preview.",
      price: 500,
      mrp: null,
      image_path: null,
      is_available: true,
      stock: 5,
      sort_order: 0,
      created_at: createdAt,
      age_info: null,
      size_info: null,
      rental_terms: null,
      customization: null,
    },
  ],
  offers: [],
  settings: {
    id: 1,
    about: "This is sample content shown only in local development.",
    address: null,
    delivery_info: null,
    deposit_info: null,
    frame_instructions: null,
    hero_alt: null,
    hero_image_path: null,
    maps_link: null,
    rental_terms: "Sample rental terms. Confirm availability with the shop.",
    updated_at: createdAt,
  },
} satisfies PreviewCatalog;

export function canUseLocalPreview(
  development: boolean,
  supabaseUrl?: string,
  publishableKey?: string,
): boolean {
  return development && (!supabaseUrl || !publishableKey);
}
