import {
  IconAnalyser, IconRegistres, IconMissions, IconProfil, IconComposer, IconHistorique,
  IconThunder, IconTimer, IconMusicalNote, IconMelody, IconMarathon, IconSilence, IconExplosion,
  IconClose, IconCheck, IconPlay, IconPause, IconShare, IconEdit, IconDelete, IconSettings,
  IconChevronRight, IconChevronDown, IconBell, IconMail, IconLock, IconUnlock,
  IconFire, IconStar, IconStarEmpty, IconTrophy, IconBadge, IconEgg, IconCrown,
  IconEmoteShy, IconEmoteDiscret, IconEmoteConfiant, IconEmoteExplosif, IconEmoteMajestueux, IconEmoteNaturel,
} from "./index";

const ICON_MAP = {
  analyser: IconAnalyser, registres: IconRegistres, missions: IconMissions,
  profil: IconProfil, composer: IconComposer, historique: IconHistorique,
  thunder: IconThunder, timer: IconTimer, note: IconMusicalNote,
  melody: IconMelody, marathon: IconMarathon, silence: IconSilence, explosion: IconExplosion,
  close: IconClose, check: IconCheck, play: IconPlay, pause: IconPause,
  share: IconShare, edit: IconEdit, delete: IconDelete, settings: IconSettings,
  "chevron-right": IconChevronRight, "chevron-down": IconChevronDown,
  bell: IconBell, mail: IconMail, lock: IconLock, unlock: IconUnlock,
  fire: IconFire, star: IconStar, "star-empty": IconStarEmpty,
  trophy: IconTrophy, badge: IconBadge, egg: IconEgg, crown: IconCrown,
  "emote-shy": IconEmoteShy, "emote-discret": IconEmoteDiscret,
  "emote-confiant": IconEmoteConfiant, "emote-explosif": IconEmoteExplosif,
  "emote-majestueux": IconEmoteMajestueux, "emote-naturel": IconEmoteNaturel,
} as const;

export type IconName = keyof typeof ICON_MAP;

interface Props {
  name: IconName;
  size?: number;
  color?: string;
  className?: string;
}

export function Icon({ name, size = 24, color = "currentColor", className }: Props) {
  const Component = ICON_MAP[name];
  if (!Component) return null;
  return <Component size={size} color={color} className={className} />;
}
