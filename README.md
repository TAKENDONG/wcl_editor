# wclPortal — Portail éditeurs et auteurs WCL

Quatrième surface de la plateforme WCL, à côté de `wclplay` (Flutter),
du site web et de `wclAdmin` (back-office).

**Démarrage et parcours complets : [TUTORIEL.md](TUTORIEL.md).**

## Prérequis

| | |
|---|---|
| Docker | démarré |
| Supabase CLI | `supabase --version` ≥ 2.x |
| Node | ≥ 18 |
| **Un clone de `wclplay`** | sur la branche `feat/publisher-tenancy`, **à côté de ce dépôt** (`../wclplay`) ou indiqué via `WCLPLAY_SQL=` |

Le dernier point n'est pas optionnel : le schéma du portail (26 fichiers SQL,
fonctions edge comprises) est canonique dans `wclplay` — voir Architecture
ci-dessous. `./start.sh` échoue sciemment, avec un message explicite, s'il ne
trouve pas ce dépôt.

Ce dépôt n'a **pas d'intégration continue pour l'instant** : `tsc`, les tests
et la construction se vérifient en local (`npm run test`, `npm run build`).
La vérification du schéma, des fonctions edge et de l'application mobile vit
dans `wclplay` (`.github/workflows/verification.yml`).

## Mise en ligne (depuis le 06/10/2026)

**En ligne : https://editor.worldconquestlibrary.org** — projet Cloudflare
Pages `wcl-editor` (adresse technique `wcl-editor.pages.dev`), enregistrement
DNS `editor` → `wcl-editor.pages.dev` (proxifié), comme `account` pour la
console. Pousser ne déploie RIEN : la publication se fait depuis le poste.

```bash
npm ci
npm run test
npm run build      # lit .env.production.local (non versionné)
npx wrangler pages deploy dist --project-name=wcl-editor --branch=main
```

`.env.production.local` porte `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`
du projet de production (`anjqdvrniawarrueztva`), les mêmes que le site et la
console ; la clé anonyme est publique par nature, les droits viennent des RPC.

**Deux dépôts, comme les autres** : `origin` lit `5GIS/wcl_editor` (privé) et
pousse à la fois vers `5GIS/wcl_editor` et `TAKENDONG/wcl_editor`. Vérifier les
deux têtes après chaque poussée. Branche de travail : `master`.

**À vérifier avant d'annoncer le portail** : le schéma `publishers_*.sql` (dans
`wclplay/supabase/`) doit être collé en production ; sans lui, la vitrine
s'affiche mais l'inscription et le dépôt échouent.

## Ce qui est couvert

| Module du cahier | État |
|---|---|
| A — Vitrine publique, FR/EN/ES | ✅ |
| B — Inscription auteur / éditeur, équipe, signature | ✅ |
| C — Dépôt d'ouvrage (fichier compris), droits, états | ✅ |
| D — File de validation WCL, doublons | ✅ |
| E — Statistiques | ✅ écran et calculs livrés ; sans chiffre tant qu'aucune période n'a tourné |
| F — Redevances | ✅ moteur, fiscalité et formule livrés ; sans chiffre tant qu'aucune période n'a tourné |
| G — Versements | ✅ seuils, report et reçus livrés ; **aucun rail de paiement réel branché** |

**E et F affichent zéro tant qu'aucune période n'a été mesurée en production et
consolidée**, pas parce que le calcul manque : le moteur existe et est testé
(26 fichiers SQL, 4 suites de tests). C'est une distinction volontaire — un
graphique de démonstration serait la première chose qu'un éditeur prendrait
pour un engagement chiffré, alors qu'un écran vide décrit honnêtement
« mesuré, mais pas encore de données ».

**Deux règles de calcul s'écartent délibérément du cahier, et sont ratifiées :**
les titres du domaine public **comptent au dénominateur** de la répartition
(sans jamais rien toucher), et il n'y a **pas de seuil à 60 %** — chaque page
traversée est comptée, jamais la longueur totale d'un titre.

**G reste bloqué sur un point réel** : `payout_mark_settled` refuse tout
règlement dont la fiscalité n'a pas été appréciée (`not_assessed` n'est pas une
exonération), et aucun prestataire de paiement n'est branché derrière — les
versements se préparent, ils ne partent pas encore.

## Architecture

Application autonome (React + Vite + TypeScript) contre le **même** projet
Supabase que le reste de WCL, mais **uniquement** au travers de RPC
`SECURITY DEFINER` bornées. Le portail n'a **aucun droit d'écriture** sur les
tables : `publishers_rls.sql` révoque tout à `anon` et `authenticated`.

```
src/
  services/    accès données — seul endroit qui parle à Supabase
  hooks/       état et chargement
  components/  rendu pur, aucune logique métier
  features/    une page par module du cahier
  i18n/        FR / EN / ES
```

Le schéma vit dans `wclplay/supabase/publishers_*.sql` — emplacement canonique
du SQL du projet, pour ne pas créer une seconde source de vérité.
