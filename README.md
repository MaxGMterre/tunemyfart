# Tunemyfart — L'Anal-yser

App d'analyse "scientifique" de pets : note de musique détectée, décibels, durée, courbe sonore, classements.

## Ce qui est déjà fait

- ✅ Détection de note par autocorrélation (`src/lib/pitchDetect.ts`)
- ✅ Hook d'enregistrement micro + analyse en direct (`src/lib/useRecorder.ts`)
- ✅ Écran principal "Anal-yser" (gauge dB + note en direct + waveform + tags alimentation/lieu/odeur)
- ✅ Écran Classement (branché sur une vue Supabase)
- ✅ Schéma Supabase complet (`supabase/schema.sql`) avec RLS
- ✅ Capacitor configuré (prêt à wrapper iOS + Android)

## À faire ensuite (toi + Claude Code en local)

- [ ] Créer le projet Supabase et exécuter `supabase/schema.sql`
- [ ] Brancher l'auth Supabase (email ou anonyme) — pour l'instant `user_id` n'est pas rempli automatiquement
- [ ] Upload du blob audio vers Supabase Storage (le son n'est gardé que localement dans le lecteur de l'écran de résultat)
- [ ] Icônes + splash screen
- [ ] Missions, IA musicale (V2)

---

## 1. Setup initial sur ton Mac

```bash
npm install
cp .env.example .env
```

R�cupère `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans ton projet Supabase → Settings → API.

## 2. Lancer en mode dev (navigateur)

```bash
npm run dev
```

Ouvre l'URL affichée dans Chrome ou Safari. Autorise le micro.

## 3. Configurer Supabase

Dans l'éditeur SQL de ton projet Supabase, colle et exécute le contenu de `supabase/schema.sql`.

## 4. Wrapper en app iOS (priorité, tu as un Mac)

Prérequis : Xcode (App Store), CocoaPods (`sudo gem install cocoapods`).

```bash
npm run build
npx cap add ios
npx cap sync ios
npx cap open ios
```

Dans Xcode :
1. Sélectionne ton iPhone branché en USB (ou un simulateur)
2. Si device réel : Signing & Capabilities → ton Apple ID personnel comme "Team" (gratuit, app valable 7 jours)
3. Clique sur ▶️

## 5. Wrapper en app Android

Prérequis : Android Studio.

```bash
npx cap add android
npx cap sync android
npx cap open android
```

Clique ▶️ avec un émulateur ou ton téléphone en USB (mode développeur activé).

## 6. Après chaque modification du code

```bash
npm run build
npx cap sync
```

## 7. Quand tu seras prêt à publier

- **iOS** : compte Apple Developer (99$/an) requis pour TestFlight/App Store
- **Android** : compte Google Play Console (25$, paiement unique)

On détaillera ces étapes (icônes, descriptions, captures, politique de confidentialité — obligatoire car l'app utilise le micro) au moment voulu.

---

## Structure du projet

```
src/
  lib/             ← cœur logique, sans aucun style
    pitchDetect.ts   → autocorrélation, conversion fréquence→note, dB, waveform
    useRecorder.ts   → hook micro + enregistrement
    supabase.ts      → client Supabase + sauvegarde/lecture
  components/      ← chaque écran/panneau, indépendant
    Recorder.tsx / .css   → écran "Anal-yser"
    Leaderboard.tsx / .css → écran classement
  styles/
    tokens.css       → palette, typographies — modifier ici pour retheme toute l'app
supabase/
  schema.sql        → tables, vues de classement, RLS
```

Le cœur (`lib/`) ne dépend de rien dans `components/` ou `styles/` : tu peux refaire l'identité visuelle sans casser l'analyse audio.
