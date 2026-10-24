import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getQuote } from "./shop.functions";
import type { CartItem } from "./cart";

export function useQuote(items: CartItem[]) {
  const fn = useServerFn(getQuote);
  return useQuery({
    queryKey: ["quote", items],
    queryFn: () => fn({ data: { items } }),
    enabled: items.length > 0,
    placeholderData: (prev) => prev,
  });
}
