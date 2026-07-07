import { supabase } from "./supabase";

export async function hasStreakInsurance(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("user_streak_recovery")
    .select("coupons")
    .eq("user_id", userId)
    .single();
  return (data?.coupons ?? 0) > 0;
}

export async function useStreakCoupon(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("user_streak_recovery")
    .select("coupons")
    .eq("user_id", userId)
    .single();
  if (!data || data.coupons <= 0) return false;
  await supabase
    .from("user_streak_recovery")
    .update({ coupons: data.coupons - 1, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  return true;
}

export async function getStreakCoupons(userId: string): Promise<number> {
  const { data } = await supabase
    .from("user_streak_recovery")
    .select("coupons")
    .eq("user_id", userId)
    .single();
  return data?.coupons ?? 0;
}
