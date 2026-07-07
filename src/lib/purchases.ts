export interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  type: "consumable" | "non-consumable" | "subscription";
}

export const PRODUCTS: Product[] = [
  {
    id: "tmf_premium_lifetime",
    title: "Tunemyfart Premium",
    description: "Débloque tous les cosmétiques + retire les pubs à vie",
    price: "4,99 €",
    type: "non-consumable",
  },
  {
    id: "tmf_cosmetic_gold_avatar",
    title: "Avatar doré",
    description: "Un avatar exclusif brass métallisé",
    price: "1,99 €",
    type: "non-consumable",
  },
  {
    id: "tmf_theme_night_lab",
    title: "Thème Laboratoire Nocturne",
    description: "Ambiance sombre exclusive avec lune",
    price: "2,49 €",
    type: "non-consumable",
  },
  {
    id: "tmf_theme_marble",
    title: "Thème Marbre Impérial",
    description: "Plateau de marbre gris velouté",
    price: "1,49 €",
    type: "non-consumable",
  },
];

// Stub: simule l'achat. Retournera true quand Capacitor IAP sera branché.
export async function purchaseProduct(productId: string): Promise<boolean> {
  // TODO: intégrer @capacitor-community/in-app-purchases
  void productId;
  return false;
}

export async function restorePurchases(): Promise<string[]> {
  // TODO: retourne la liste des product IDs restaurés
  return [];
}

export async function isPremium(userId: string): Promise<boolean> {
  // Check Supabase user_purchases table
  const { supabase } = await import("./supabase");
  const { data } = await supabase
    .from("user_purchases")
    .select("product_id")
    .eq("user_id", userId)
    .eq("product_id", "tmf_premium_lifetime")
    .maybeSingle();
  return !!data;
}
