# TuneMyFart — L'Anal-yser Scientifique

Application mobile d'analyse acoustique de flatulences : note de musique, décibels, durée, courbe sonore, classements, missions quotidiennes et composition musicale.

Stack : React 19 + TypeScript + Vite 8 + Capacitor 6 + Supabase.

---

## Fonctionnalités

- **Anal-yser** — détection de note par autocorrélation, gauge dB temps réel, waveform, tags alimentation / lieu / odeur
- **Registres** — classement mondial, national, amis (scope switcher)
- **Missions** — 15+ défis, XP, barre de niveau, récompenses quotidiennes
- **Spécimen** — profil utilisateur, achievements, code ami PROUT-XXXX
- **Clavier** — composition musicale (déverrouillable)
- **Boutique** — achats in-app et pub récompensée (stubs Capacitor)
- **Thèmes** — 5 ambiances laboratoire (chêne, marbre, métal, nuit)

---

## Setup

```bash
npm install
cp .env.example .env
# remplir VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
npm run dev
```

### Base de données

Exécuter les migrations dans l'ordre via psql ou Supabase SQL Editor :

```bash
PGPASSWORD='...' psql "postgresql://postgres@<ref>.supabase.co:5432/postgres" \
  -f supabase/migrations/all_migrations_combined.sql
```

---

## Build

```bash
npm run build          # → dist/ (bundle principal < 600 kB)
npx cap sync ios       # → ios/App/
npx cap open ios       # → Xcode
```

### iOS

Prérequis : Xcode + CocoaPods (`sudo gem install cocoapods`).

```bash
cd ios/App && pod install
```

Dans Xcode : sélectionner le device, Signing → Apple ID personnel (dev gratuit, 7 jours), ▶️.

### Android

```bash
npx cap add android
npx cap sync android
npx cap open android
```

---

## Structure

```
src/
  lib/
    pitchDetect.ts      → autocorrélation, note, dB, waveform
    useRecorder.ts      → hook micro + enregistrement
    supabase.ts         → client + helpers CRUD
    analytics.ts        → analytics opt-in
    purchases.ts        → stubs IAP Capacitor
    ads.ts              → stub pub récompensée
    themes.ts           → 5 thèmes CSS variables
  components/
    Recorder/           → écran principal
    Leaderboard/        → classements
    Missions/           → défis + XP
    Profile/            → profil + achievements + amis
    Composer/           → clavier composition
    Shop/               → boutique
    DailyChallenge/     → défi quotidien
    Friends/            → liste d'amis
    icons/              → 40+ icônes SVG React
    ui/                 → Button, Card, Toast, Loading
  styles/
    tokens.css          → palette, typographies, animations
supabase/
  migrations/           → 001–008, SQL versionnés
```

---

## Publications

- **iOS** : compte Apple Developer (99 $/an) requis pour TestFlight / App Store
- **Android** : Google Play Console (25 $, unique)
- Politique de confidentialité obligatoire (utilisation du microphone + données utilisateur)
