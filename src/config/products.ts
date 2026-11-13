export const productSlugs = ["custom-metal-enclosures-cabinets", "equipment-housings-machine-covers", "sheet-metal-panels-chassis"] as const;
export type ProductSlug = typeof productSlugs[number];
export function isProductSlug(slug: string): slug is ProductSlug {
  return productSlugs.includes(slug as ProductSlug);
}
