# wclPortal — Portail éditeurs et auteurs WCL

Quatrième surface de la plateforme WCL, à côté de `wclplay` (Flutter),
du site web et de `wclAdmin` (back-office).

**Démarrage et parcours complets : [TUTORIEL.md](TUTORIEL.md).**

## Ce qui est couvert

| Module du cahier | État |
|---|---|
| A — Vitrine publique, FR/EN/ES | ✅ |
| B — Inscription auteur / éditeur | ✅ (invitations d'équipe et signature à faire) |
| C — Dépôt d'ouvrage, droits, états | ✅ (dépôt de fichier R2 à brancher) |
| D — File de validation WCL, doublons | ✅ |
| E — Statistiques | ⏳ vide tant que la sonde de lecture n'est pas livrée |
| F — Redevances | ⏳ formule publiée, chiffres en attente de la sonde |
| G — Versements | ⏳ aucun rail branché |

Les écrans E, F et G sont **volontairement vides**. Le portail ne fabrique aucun
chiffre : un graphique de démonstration serait la première chose qu'un éditeur
prendrait pour un engagement.

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
