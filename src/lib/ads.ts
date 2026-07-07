interface Reward { xp: number }
interface AdResult { rewarded: boolean; xp: number }

// Stub: simule une pub récompensée. Sera remplacé par AdMob via Capacitor.
export async function showRewardedAd(reward: Reward): Promise<AdResult> {
  // TODO: intégrer @capacitor-community/admob
  return new Promise((resolve) => {
    setTimeout(() => resolve({ rewarded: true, xp: reward.xp }), 2000);
  });
}

export function isAdsEnabled(): boolean {
  return localStorage.getItem("tmf_ads_enabled") !== "false";
}
