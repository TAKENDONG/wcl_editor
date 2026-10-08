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

**Base de données** : le cœur (modules A–D) est en production
(`wclplay/supabase/migrations/20261006120000_portail_editeurs_coeur.sql`,
vérifié le 06/10). Vérification, accords, territoires, redevances et versements
viennent de `20261009100000_editeurs_verification_et_redevances.sql` — **à
coller** ; tant qu'il ne l'est pas, ces écrans affichent une erreur et la
vitrine montre les valeurs par défaut.

## Fonctionnement (depuis le 09/10/2026)

**L'ADMINISTRATION SE FAIT DANS LA CONSOLE WCL** (consigne du 09/10/2026 :
« on administre tout dans la console admin ») — page **Éditeurs** de
https://account.worldconquestlibrary.org et de l'application admin, cinq
onglets : Éditeurs, Validation, Redevances, Versements, Réglages. Le portail
est l'espace DES ÉDITEURS ; un membre du personnel y voit un lien « Console
WCL », et les anciennes adresses `/validation`, `/periodes`, `/editeurs`,
`/reglages` y renvoient.

On commence par de **grands éditeurs, sous contrat** ; l'inscription libre
d'auteurs indépendants reste ouverte, avec la même vérification.

1. **Compte** : un compte WCL (le même que l'application). Créé ici, il se
   confirme avec le **code** reçu par e-mail (champ sur `/connexion`).
2. **Éditeur** : `/inscription` crée la maison ou l'auteur, `pending`.
3. **Vérification** par WCL (console, Éditeurs → onglet Éditeurs) : pièces déposées dans
   « Mon compte », acceptées ou refusées avec motif, puis « Vérifier ». Tant
   que le réglage `editeurs_verification_obligatoire` est vrai, un éditeur non
   vérifié ne peut ni soumettre, ni être publié, ni être payé.
4. **Accord-cadre** (console, onglet Éditeurs) : part propre, minimum garanti par mois,
   avance récupérée sur les redevances, pays ouverts par défaut.
5. **Dépôt** (`/catalogue`, un par un ou en masse), droits et pays déclarés.
6. **Validation** (console, onglet Validation) : l'approbation passe par la fonction
   `submission-publish`, qui copie le fichier et la couverture sur R2 (d'où
   l'application lit les livres) avant de publier. Le titre porte ses
   territoires : il n'est ni listé ni ouvert hors des pays déclarés.
7. **Redevances au TEMPS DE LECTURE** des abonnés payants (séances de
   l'application). Deux modèles au choix (`redevances_modele`) :
   `par_abonne` — l'argent de chaque abonné va aux livres qu'il a lus — ou
   `fonds_commun`. Calcul provisoire le 1er de chaque mois ; consolidation par
   WCL dans la console, onglet Redevances (ou le 15 si `redevances_consolidation_auto`).
8. **Versements** (console, onglet Versements) : préparés après
   consolidation, avec seuil, fréquence, report, minimum garanti, avance,
   retenue à la source par pays (une règle par pays est OBLIGATOIRE avant de
   régler). Le virement se fait hors du portail ; on saisit sa référence, un
   reçu est émis.

**Toutes les décisions sont des réglages** (console, onglet Réglages) : part des
éditeurs (défaut 60 %), modèle, assiette nette ou brute, devise de référence
(USD), lecture minimale (2 min) et maximale par jour (6 h), recettes comptées,
frais par prestataire, seuil (10) et fréquence (trimestre) des versements,
vérification obligatoire, consolidation automatique. La vitrine, le contrat et
les conditions générales se composent de ces réglages (`i18n/modele.ts`).

Test de la base : `wclplay/supabase/tests/editeurs_redevances.test.sql`
(48 / 48 sur un PostgreSQL jetable).

**Avant les vrais versements** : saisir les règles de retenue à la source des
pays des éditeurs (avis fiscal), et décider des réglages.

## Ce qui est couvert

| Module du cahier | État |
|---|---|
| A — Vitrine publique, FR/EN/ES | ✅ |
| B — Inscription auteur / éditeur, équipe, signature | ✅ |
| C — Dépôt d'ouvrage (fichier compris), droits, états | ✅ |
| D — File de validation WCL, doublons | ✅ |
| E — Statistiques | ✅ en direct sur les séances de lecture de l'application |
| F — Redevances | ✅ au temps de lecture, deux modèles, réglages (migration 20261009100000) |
| G — Versements | ✅ seuil, fréquence, report, minimum garanti, avance, retenue fiscale, reçus ; virement fait hors du portail |

Les anciens fichiers `royalties_*.sql`, `payouts_*.sql` et `reading_*.sql` de
`wclplay/supabase/` (comptage par PAGES, télémétrie jamais livrée, table
`reading_sessions` homonyme de celle de l'application) ne sont **pas** en
production et ne doivent pas y être collés : la migration 20261009100000 les
remplace.

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
