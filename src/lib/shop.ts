export const SHOP = {
  name: "Lalitha / L Deals",
  phoneDisplay: "+91 80720 44100",
  waNumber: "918072044100",
  hours: ["11:00 AM – 1:00 PM", "5:00 PM – 9:30 PM"],
};

export const DEFAULT_ADDRESS = "1, Sri Kamatchi St, Padmavathi Nagar, Iyyappanthangal, Tamil Nadu 600077, India";
export const mapsLink = (address: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
export const directionsLink = (
  s: { maps_link?: string | null; address?: string | null } | null | undefined,
) => (s?.maps_link && s.maps_link.trim()) || mapsLink(s?.address || DEFAULT_ADDRESS);

export const SECTION_LABEL = { costumes: "Costumes", frames: "Custom Photo Frames", gifts: "Gifts" } as const;

export function imageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("data:") || path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:")) {
    return path;
  }
  return `/api/public/images/${path.split("/").map(encodeURIComponent).join("/")}`;
}

export function waLink(text: string) {
  return `https://wa.me/${SHOP.waNumber}?text=${encodeURIComponent(text)}`;
}

export const WA_GREETING =
  "Hi Lalitha / L Deals! I'm interested in your costumes, custom photo frames, gifts, and offers. Please share more details.";

export const inr = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
