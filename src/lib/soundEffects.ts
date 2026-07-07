import { Howl } from "howler";

const SOUND_ENABLED_KEY = "tmf_sound_enabled";
const VOLUME_KEY = "tmf_sound_volume";

export function isSoundEnabled(): boolean {
  return localStorage.getItem(SOUND_ENABLED_KEY) !== "false";
}

export function setSoundEnabled(v: boolean) {
  localStorage.setItem(SOUND_ENABLED_KEY, String(v));
}

export function getSoundVolume(): number {
  return parseFloat(localStorage.getItem(VOLUME_KEY) ?? "0.5");
}

export function setSoundVolume(v: number) {
  localStorage.setItem(VOLUME_KEY, String(v));
}

// Lazy-initialized Howl instances
const _sounds: Partial<Record<SoundName, Howl>> = {};

type SoundName = "click" | "unlock" | "success" | "error" | "weaponObtained" | "levelUp" | "tabSwitch" | "proutAppear";

const SOUND_CONFIG: Record<SoundName, { src: string; volume: number }> = {
  click:          { src: "/sounds/click.mp3",          volume: 0.3 },
  unlock:         { src: "/sounds/unlock.mp3",         volume: 0.5 },
  success:        { src: "/sounds/success.mp3",        volume: 0.4 },
  error:          { src: "/sounds/error.mp3",          volume: 0.4 },
  weaponObtained: { src: "/sounds/weapon-obtained.mp3",volume: 0.6 },
  levelUp:        { src: "/sounds/level-up.mp3",       volume: 0.5 },
  tabSwitch:      { src: "/sounds/tab-switch.mp3",     volume: 0.2 },
  proutAppear:    { src: "/sounds/prout-appear.mp3",   volume: 0.4 },
};

function getHowl(name: SoundName): Howl {
  if (!_sounds[name]) {
    const cfg = SOUND_CONFIG[name];
    _sounds[name] = new Howl({
      src: [cfg.src],
      volume: cfg.volume * getSoundVolume(),
      preload: false,
      onloaderror: () => { /* silent fail — placeholder file */ },
    });
  }
  return _sounds[name]!;
}

export function playSound(name: SoundName) {
  if (!isSoundEnabled()) return;
  try { getHowl(name).play(); } catch { /* silent fail */ }
}

// Backward-compatible named exports
export const SFX = {
  click:    () => playSound("click"),
  unlock:   () => playSound("unlock"),
  success:  () => playSound("success"),
  error:    () => playSound("error"),
  weapon:   () => playSound("weaponObtained"),
  levelUp:  () => playSound("levelUp"),
  tab:      () => playSound("tabSwitch"),
  // Legacy Web Audio API stubs — kept for backward compatibility
  mrProutAppear: () => playSound("proutAppear"),
  recordStart:   () => playSound("click"),
  recordStop:    () => playSound("click"),
  noteHit:       (_frequency: number) => { /* no-op — Howler version uses file-based sounds */ },
};
