# Portail éditeurs WCL — tutoriel d'accès et parcours utilisateurs

Ce tutoriel fait tourner le portail **en local**, sur une base isolée. Rien de ce
qui suit ne touche la production.

---

## 1. Prérequis

| | |
|---|---|
| Docker | démarré |
| Supabase CLI | `supabase --version` ≥ 2.x |
| Node | ≥ 18 |
| **Un clone de `wclplay`** | sur la branche `feat/publisher-tenancy`, **à côté de ce dépôt** (`../wclplay`) ou indiqué via `WCLPLAY_SQL=` |

Le dernier point n'est pas facultatif : le schéma du portail (26 fichiers SQL)
est canonique dans `wclplay`, jamais dupliqué ici. Sans lui, `./start.sh`
s'arrête au premier fichier, avec un message qui dit exactement quoi faire.

---

## 2. Démarrer (une commande)

```bash
cd wclPortal && ./start.sh
```

C'est tout. Le script vérifie les prérequis, démarre le backend local, applique
le schéma, crée les comptes de démonstration, installe les dépendances et lance
le portail. Il est **idempotent** : réexécutable autant de fois que voulu.

Le portail répond sur **http://127.0.0.1:5174**.
Studio (pour inspecter la base) : **http://127.0.0.1:54323**.

> Le premier démarrage télécharge les images Docker de Supabase : comptez
> plusieurs minutes. Les suivants sont immédiats.
>
> Si le SQL du portail n'est pas trouvé (il vit dans `wclplay`, sur la branche
> `feat/publisher-tenancy` tant que la PR n'est pas fusionnée), indiquez-le :
> `WCLPLAY_SQL=/chemin/vers/wclplay/supabase ./start.sh`

---

## 3. Parcours 1 — Module A : découvrir WCL sans compte

1. Ouvrir **http://127.0.0.1:5174** — la vitrine est **publique**, aucun compte requis.
2. Lire « Le modèle de rémunération, en cinq lignes » : pool, page rémunérée,
   page validée, taux, domaine public.
3. Basculer la langue avec **FR / EN / ES** en haut à droite. Le choix est mémorisé.

*Ce que cela vérifie :* le cahier veut qu'un éditeur comprenne le modèle **avant**
de créer un compte, et en trois langues.

---

## 4. Parcours 2 — Module B : créer un espace éditeur

1. Cliquer **« Devenir auteur ou éditeur »** → redirigé vers la connexion.
2. Saisir une adresse et un mot de passe, puis **« Créer un compte »**.
   *(En local, aucun courriel de confirmation n'est exigé.)*
3. Aller sur **/inscription**. Choisir :
   - **Auteur indépendant** → nom public, pays, courriel ;
   - **Maison d'édition** → en plus, une **raison sociale**, exigée par le serveur.
4. Valider. Vous êtes automatiquement **administrateur** de cet espace.

**Essayez de tricher :** créez une maison d'édition en laissant la raison sociale
vide. Le serveur répond `legal_name_required` — la règle est dans la RPC, pas dans
le formulaire, donc contourner l'interface ne sert à rien.

---

## 5. Parcours 3 — Module C : déposer un ouvrage

1. Aller dans **Catalogue**.
2. Remplir le formulaire : titre, auteur, langue, ISBN, description.
3. Choisir la **déclaration de droits** et les **territoires**.
4. **« Enregistrer »** crée un brouillon. **« Envoyer en validation »** le soumet.

Deux refus **volontaires**, à constater :

| Tentative | Réponse du serveur |
|---|---|
| Envoyer sans fichier déposé | `file_required` |
| Envoyer avec droits « inconnu » | `rights_declaration_required` |

5. Déposer un fichier **EPUB** réel dans le formulaire. Il part dans le
   compartiment privé `submissions`, puis le **serveur** le mesure (fonction
   edge `submission-file`) et renvoie le nombre de pages normalisées — ce
   nombre n'est jamais calculé par le navigateur, c'est l'assiette de la
   rémunération. Un **PDF** est accepté au dépôt mais refusé à cette étape :
   ses pages ne peuvent pas encore être comptées.
6. Renvoyer : l'état passe à **Soumis**.
7. Tenter de le modifier → `not_editable`. **Un dossier envoyé ne bouge plus** :
   c'est exactement ce que WCL examine.

---

## 6. Parcours 4 — Module D : valider, côté WCL

La file est réservée à l'équipe WCL. Avec un compte éditeur, **Validation** répond
`forbidden` — c'est le comportement attendu.

`start.sh` a déjà promu `valideur@cmci.cm`. Pour en promouvoir un autre :

```bash
docker exec "$(docker ps --filter name=supabase_db_ --format '{{.Names}}')" \
  psql -U postgres -d postgres -c \
  "insert into admin_users(user_id)
   select id from auth.users where email='VOTRE@ADRESSE' on conflict do nothing;"
```

Connecté comme validateur, aller dans **Validation** :

1. Les dossiers sont classés **du plus ancien au plus récent** — un dossier ne doit
   jamais être doublé par un plus récent.
2. **« Doublons probables »** cherche les mêmes ISBN et titres chez d'autres éditeurs.
3. Trois décisions : **Approuver** · **Demander une correction** (retour en brouillon,
   avec le motif visible par l'éditeur) · **Rejeter**.
4. Tenter un rejet **sans motif** → `notes_required`. Un refus sans motif est
   indéfendable devant un éditeur ; le serveur l'interdit.

---

## 7. Parcours 5 — Modules E, F, G : ce qui tourne, et ce qui reste vide

**Statistiques**, **Redevances** et **Versements** s'ouvrent, mais **ne montrent
aucun chiffre**. Ce n'est plus faute de calcul — la sonde de lecture, le moteur
de redevances et les versements existent et sont testés — c'est parce
qu'**aucune période n'a encore tourné en production**.

La sonde (application Flutter) mesure chaque page lue et l'envoie au serveur ;
`royalty_close_period()` consolide une période en pool réparti au prorata des
pages validées ; `payout_prepare_period()` construit les versements avec seuil
et report. Chaque étage est testé (`royalties.test.sql`, `payouts.test.sql`,
`payouts_tax.test.sql`, `reading_retention.test.sql`) — mais tester le calcul
et l'avoir vu tourner sur de vraies lectures sont deux choses différentes, et
seule la seconde peut remplir ces écrans.

Ce qui **est** déjà vérifiable ici, sans attendre une seule lecture : **la
formule**, publiée sur l'écran Redevances —

```
taux_par_page = pool ÷ total_pages_validées_de_la_plateforme
votre_part    = vos_pages_validées × taux_par_page
```

— et deux règles qui s'écartent délibérément du cahier, ratifiées : les titres
du domaine public **comptent au dénominateur** sans jamais rien toucher, et il
n'y a **pas de seuil à 60 %** — chaque page traversée est comptée, jamais la
longueur totale d'un titre.

Sur l'écran Versements, deux refus **volontaires**, pas des bugs : régler un
versement dont la fiscalité n'a pas été appréciée est refusé
(`not_assessed` n'est pas une exonération), et aucun prestataire de paiement
réel n'est branché derrière — les versements se préparent, ils ne partent pas.

---

## 8. Vérifier le cloisonnement vous-même

C'est la propriété la plus importante du portail : **un éditeur ne doit rien voir
d'un autre**. Ne me croyez pas sur parole — testez-le.

```bash
API=http://127.0.0.1:54321
ANON=$(grep VITE_SUPABASE_ANON_KEY .env | cut -d= -f2)

# jeton de Bob
B=$(curl -s -X POST "$API/auth/v1/token?grant_type=password" -H "apikey: $ANON" \
     -H "Content-Type: application/json" \
     -d '{"email":"bob@auteur.fr","password":"MotDePasse123!"}' \
     | python3 -c "import sys,json;print(json.load(sys.stdin)['access_token'])")

# identifiant de l'éditeur d'Alice
ALPHA=$(docker exec "$(docker ps --filter name=supabase_db_ --format '{{.Names}}')" \
        psql -tAq -U postgres -d postgres \
        -c "select id from publishers where display_name='Editions Alpha';")

# 1. Bob lit-il le catalogue d'Alice ?         → 0
curl -s "$API/rest/v1/publisher_submissions?publisher_id=eq.$ALPHA&select=id" \
  -H "apikey: $ANON" -H "Authorization: Bearer $B"

# 2. Bob écrit-il chez Alice ?                 → forbidden
curl -s -X POST "$API/rest/v1/rpc/submission_save" -H "apikey: $ANON" \
  -H "Authorization: Bearer $B" -H "Content-Type: application/json" \
  -d "{\"p_publisher_id\":\"$ALPHA\",\"p_id\":null,\"p_title\":\"Vol\",
       \"p_authors\":\"X\",\"p_language\":\"fr\"}"

# 3. Bob écrit-il DIRECTEMENT en table ?       → 42501, privilège insuffisant
curl -s -X POST "$API/rest/v1/publishers" -H "apikey: $ANON" \
  -H "Authorization: Bearer $B" -H "Content-Type: application/json" \
  -d '{"kind":"author","display_name":"Pirate","country_code":"FR","contact_email":"x@y.z"}'
```

Le troisième cas est le plus important : l'écriture directe échoue **au niveau des
privilèges**, avant toute politique RLS. Le portail n'a aucun droit d'écriture sur
les tables — il ne passe que par des RPC.

Le même jeu tourne aussi hors HTTP :

```bash
docker run --rm -d --name pgportal -e POSTGRES_PASSWORD=x postgres:16-alpine
docker cp ../wclplay/supabase pgportal:/sql
docker exec pgportal psql -U postgres -q -f /sql/publishers_schema.test.sql
docker rm -f pgportal
# attendu : RESULTAT : 14 / 14
```

---

## 9. Comptes utilisés dans ce tutoriel

| Compte | Rôle | Mot de passe |
|---|---|---|
| `alice@editions-alpha.cm` | maison d'édition « Editions Alpha » | `MotDePasse123!` |
| `bob@auteur.fr` | auteur indépendant | `MotDePasse123!` |
| `valideur@cmci.cm` | validateur WCL (`admin_users`) | `MotDePasse123!` |

Comptes de démonstration locaux uniquement.

---

## 9 bis. Nouveaux parcours

**Compte** (`/compte`) — signature électronique du contrat, équipe et rôles
(inviter, changer de rôle, révoquer ; le dernier administrateur ne peut pas
l'être), pièces justificatives, coordonnées de versement et informations
fiscales *réservées aux rôles administrateur et comptable*, double
authentification TOTP.

À constater : connectez-vous en **bob@auteur.fr** (comptable d'Editions Alpha)
— il voit les versements mais le serveur lui refuse le dépôt d'un ouvrage.

**Conditions générales** (`/conditions`) — publiques, liées depuis l'accueil.
Elles énoncent aussi ce qui n'est **pas** garanti en matière de protection.

**Import en masse** — en bas du catalogue. Téléchargez le modèle, remplissez-le,
réimportez : chaque ligne devient un brouillon. Le fichier de chaque ouvrage
s'attache ensuite, un à un.

**Dépôt de fichier** — le fichier part dans un compartiment privé, puis le
**serveur** le mesure et renvoie le nombre de pages normalisées. Ce nombre
n'est jamais calculé par le navigateur : c'est l'assiette de la rémunération.

---

## 10. Ce qui n'est PAS encore là

Pour que ce tutoriel ne laisse rien supposer de faux :

| Manque | Conséquence |
|---|---|
| **Conversion assistée des PDF** | Le PDF est accepté au dépôt mais **refusé à la mesure** : ses pages ne peuvent pas être comptées en l'état. |
| **Critères éditoriaux dans l'écran de validation** | La table et la fonction existent (`editorial_criteria`, `editorial_blocking_gaps`, qui rend `NULL` — pas zéro — tant qu'aucun critère n'est défini), mais rien dans l'écran **Validation** ne les affiche encore : la conformité à la ligne éditoriale reste un jugement humain non assisté. |
| **Versements réels** | Seuils, report et reçus sont livrés (`payouts_engine.sql`), mais aucun prestataire de paiement n'est branché derrière : rien ne part encore. Ils n'ouvriront qu'après deux périodes calculées à blanc. |

---

## 11. Arrêter

```bash
# Ctrl+C dans le terminal où tourne start.sh, puis :
supabase stop --project-id "$(basename "$(cd ../wclplay && pwd)")" 2>/dev/null || \
  (cd ../wclplay && supabase stop)
```
