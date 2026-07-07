import { useState } from "react";

const FAQ_ITEMS = [
  { q: "Comment fonctionne la détection de note ?", c: "L'app utilise l'autocorrélation (méthode ACF) sur le signal audio capturé par votre microphone. L'algorithme identifie la fréquence fondamentale et la convertit en note de musique." },
  { q: "Mes données sont-elles privées ?", c: "Vos enregistrements audio ne sont jamais envoyés vers nos serveurs sans votre accord explicite. Seules les métadonnées (note, dB, durée) sont sauvegardées si vous choisissez de certifier votre relevé." },
  { q: "Comment changer mon pseudo ?", c: "Allez dans l'onglet Spécimen → icône ⚙️ → Identité scientifique. Modifiez votre pseudo et sauvegardez." },
  { q: "Qu'est-ce que le mode session ?", c: "Le mode session permet d'enregistrer jusqu'à 5 minutes en continu, idéal pour capturer plusieurs flatulences consécutives ou des séquences longues." },
  { q: "Comment débloquer le Clavier (Composer) ?", c: "Complétez la mission 'Octave complet' : enregistrez au moins une note dans chacune des 8 octaves. Une notification vous informera du déverrouillage." },
  { q: "À quoi sert le spectrogramme ?", c: "Le spectrogramme affiche les fréquences présentes dans votre relevé en temps réel. Les couleurs vont du bleu (faible intensité) au rouge (forte intensité)." },
  { q: "Comment défier un ami en duel ?", c: "Dans l'onglet Duels, sélectionnez un ami depuis votre liste, choisissez la catégorie (dB max, durée, ou richesse mélodique) et envoyez le défi. Votre ami a 24h pour répondre." },
  { q: "Les sons sont-ils enregistrés en permanence ?", c: "Non. L'app n'accède au microphone que lorsque vous appuyez sur le bouton REC. Dès l'arrêt, le stream micro est libéré." },
  { q: "Qu'est-ce que le timbre cristallin ?", c: "Un signal quasi-sinusoïdal pur, pauvre en harmoniques. Il indique une note très 'propre' acoustiquement, proche d'un signal de synthétiseur." },
  { q: "Comment fonctionne le streak ?", c: "Un streak comptabilise les jours consécutifs avec au moins un relevé certifié. Si vous manquez un jour, vous pouvez le rattraper en enregistrant 2 relevés le lendemain." },
  { q: "Les classements sont-ils mondiaux ?", c: "Oui. L'onglet Registres affiche les classements global, national, par ville, et entre amis. Le meilleur relevé de chaque catégorie est retenu." },
  { q: "Comment partager mon relevé ?", c: "Après l'analyse, appuyez sur 'Diffuser ce spécimen'. Vous pouvez choisir parmi 4 modèles (certificat, story, poster, diplôme) et partager via les applications de votre appareil." },
  { q: "Y a-t-il des achats in-app ?", c: "Certains thèmes et cosmétiques seront disponibles à l'achat. Les fonctionnalités d'analyse et de classement restent gratuites à vie." },
  { q: "L'app fonctionne-t-elle hors-ligne ?", c: "L'analyse audio fonctionne sans réseau. La sauvegarde des relevés et l'accès aux classements nécessitent une connexion." },
  { q: "Comment signaler un bug ?", c: "Dans Paramètres → Envoyer un retour, sélectionnez 'Bug' et décrivez le problème. Les logs techniques sont optionnellement joints si vous avez activé l'envoi de diagnostics." },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const filtered = FAQ_ITEMS.filter(({ q, c }) => {
    const term = search.toLowerCase();
    return q.toLowerCase().includes(term) || c.toLowerCase().includes(term);
  });

  return (
    <div className="faq-panel">
      <input
        className="faq-search"
        type="search"
        placeholder="Rechercher dans la FAQ…"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setOpenIndex(null); }}
        aria-label="Rechercher dans la FAQ"
      />
      <div className="faq-list">
        {filtered.length === 0 && (
          <p className="faq-empty">Aucun résultat pour cette recherche.</p>
        )}
        {filtered.map(({ q, c }, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={i} className={`faq-item${isOpen ? " faq-item--open" : ""}`}>
              <button
                className="faq-question"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
              >
                <span className="faq-q-text">{q}</span>
                <span className="faq-chevron" aria-hidden="true">▼</span>
              </button>
              <div className="faq-answer" aria-hidden={!isOpen}>
                <div className="faq-answer-inner">{c}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
