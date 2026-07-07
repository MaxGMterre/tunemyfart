# Changelog

## [Unreleased] — Sprint Titan Polish Pro & Monétisation

### Ajouts
- 40+ icônes SVG React custom (`src/components/icons/`) + dispatcher `<Icon name="..." />`
- Boutique in-app (`Shop.tsx`, `purchases.ts`, `ads.ts`, migration 008)
- Système de thèmes laboratoire (`themes.ts`) : chêne, marbre, métal, nuit
- `LabTableDecor` enrichi : 11 objets, flamme animée (CSS keyframes), particules de poussière, intégration variables CSS thèmes
- Boutons physiques 3D (Box-shadow multicouche, effet press, variantes primary/secondary/ghost/danger)
- Cards avec texture papier SVG noise data-URI
- Tokens d'animation CSS unifiés (`--anim-enter`, `--anim-leave`, `--anim-spring`)
- Lazy loading React des panneaux lourds (Leaderboard, Missions, Composer, Profile)

### Modifications
- Tab bar : icônes SVG inline en remplacement des emoji
- Tons textuels : reformulations pince-sans-rire style laboratoire victorien
- `.env.example` : variables analytique ajoutées

### Infrastructure
- Migration 008 : table `user_purchases` avec RLS
- Build : 0 erreurs TypeScript, bundle principal 492 kB (gzip 137 kB)

---

## [0.3.0] — Sprint Titan Contenu & Viralité

### Ajouts
- `DailyChallenge` : défi quotidien avec confettis et claim XP
- `Friends` : code ami PROUT-XXXX, ajout/suppression
- `ShareCard` : 4 templates canvas (certificat, story, poster, diplôme)
- `WelcomeModal` : onboarding narratif 4 pages avec personnage Mr. Prout
- `Settings` : toggle analytique opt-in, formulaire de feedback intégré
- `Profile` : barre XP/niveau, grille achievements (15), section amis
- `Leaderboard` : scope "Amis" (nécessite auth)
- Tracking analytique (`track("app_open")`, `track("tab_change")`)

### Infrastructure
- Migrations 002–007 exécutées (profils, missions, classements, amis, défis, XP)
- Fonction RPC `increment_xp`

---

## [0.2.0] — Sprint Titan Univers Mr. Prout

### Ajouts
- Personnages SVG animés (Mr. Prout, Putois mascot)
- `LabTableDecor` initial
- Composer (clavier) déverrouillable via mission
- Formulaire d'enregistrement enrichi (humeur, social, note chercheur)

---

## [0.1.0] — Sprint Fondations

### Ajouts
- Détection note par autocorrélation (`pitchDetect.ts`)
- Hook micro + enregistrement (`useRecorder.ts`)
- Classement mondial/national Supabase
- Capacitor iOS/Android configuré
- Auth Supabase (email + anonyme)
- Schéma base de données initial avec RLS
