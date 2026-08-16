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

---

## 2. Démarrer (trois commandes)

```bash
# 1. Le backend local (depuis le dépôt wclplay, qui porte supabase/config.toml)
cd wclplay && supabase start

# 2. Le schéma du portail (depuis wclPortal)
cd ../wclPortal && ./scripts/setup-local.sh

# 3. Le portail
cp .env.example .env          # puis coller l'ANON_KEY affichée par `supabase status`
npm install && npm run dev
```

Le portail répond sur **http://127.0.0.1:5174**.
Studio (pour inspecter la base) : **http://127.0.0.1:54323**.

> `setup-local.sh` applique d'abord une amorce WCL minimale, puis les cinq
> fichiers du modèle de locataire. Il est idempotent : réexécutable sans effet
> de bord.

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

En local, le dépôt de fichier n'est pas branché sur R2. Pour poursuivre, simulez-le :

```bash
docker exec supabase_db_anjqdvrniawarrueztva psql -U postgres -d postgres -c \
  "update publisher_submissions set file_key='submissions/x.epub',
     file_format='epub', file_sha256='deadbeef' where state='draft';"
```

5. Renvoyer : l'état passe à **Soumis**.
6. Tenter de le modifier → `not_editable`. **Un dossier envoyé ne bouge plus** :
   c'est exactement ce que WCL examine.

---

## 6. Parcours 4 — Module D : valider, côté WCL

La file est réservée à l'équipe WCL. Avec un compte éditeur, **Validation** répond
`forbidden` — c'est le comportement attendu.

Promouvoir un validateur :

```bash
docker exec supabase_db_anjqdvrniawarrueztva psql -U postgres -d postgres -c \
  "insert into admin_users(user_id)
   select id from auth.users where email='valideur@cmci.cm' on conflict do nothing;"
```

Puis, connecté avec ce compte, aller dans **Validation** :

1. Les dossiers sont classés **du plus ancien au plus récent** — un dossier ne doit
   jamais être doublé par un plus récent.
2. **« Doublons probables »** cherche les mêmes ISBN et titres chez d'autres éditeurs.
3. Trois décisions : **Approuver** · **Demander une correction** (retour en brouillon,
   avec le motif visible par l'éditeur) · **Rejeter**.
4. Tenter un rejet **sans motif** → `notes_required`. Un refus sans motif est
   indéfendable devant un éditeur ; le serveur l'interdit.

---

## 7. Parcours 5 — Modules E, F, G : ce qui est vide, et pourquoi

**Statistiques**, **Redevances** et **Versements** s'ouvrent, mais **ne montrent
aucun chiffre**. C'est délibéré.

Ces écrans se nourrissent de la **sonde de lecture**, qui n'existe pas encore : à ce
jour, l'application ne conserve qu'une position de reprise, pas un journal de pages
horodaté. Afficher un graphique de démonstration serait la première chose qu'un
éditeur prendrait pour un engagement chiffré.

Ce qui **est** déjà là, sur l'écran Redevances : **la formule**.

```
taux_par_page = pool ÷ total_pages_validées_de_la_plateforme
votre_part    = vos_pages_validées × taux_par_page
```

C'est elle que le cahier promet de rendre vérifiable, et elle ne dépend d'aucune
donnée pour être publiée.

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
ALPHA=$(docker exec supabase_db_anjqdvrniawarrueztva psql -tAq -U postgres -d postgres \
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

## 10. Ce qui n'est PAS encore là

Pour que ce tutoriel ne laisse rien supposer de faux :

| Manque | Conséquence |
|---|---|
| **Sonde de lecture** | Modules E et F vides. C'est le chemin critique : livraison applicative, puis un mois d'accumulation, puis deux périodes à blanc. |
| **Dépôt de fichier vers R2** | Le champ fichier est simulé en SQL dans ce tutoriel. |
| **Import en masse** | L'analyseur XLSX de wclAdmin est réutilisable tel quel (`BulkContentImportPage.tsx`). |
| **Équipe multi-utilisateurs (invitations)** | Le modèle et les rôles existent (`publisher_members`, trois rôles) ; l'écran d'invitation reste à faire. |
| **Signature électronique du contrat** | Les colonnes existent (`contract_signed_at`, `contract_version`) ; le parcours non. |
| **Versements** | Aucun rail branché. Ils n'ouvriront qu'après deux périodes calculées à blanc. |
| **2FA** | Exigée par le cahier. Supabase GoTrue la propose ; elle n'est pas activée. |

---

## 11. Arrêter

```bash
# depuis wclPortal
pkill -f "vite" || true
# depuis wclplay
supabase stop
```
