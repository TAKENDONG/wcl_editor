#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
#  Portail éditeurs WCL — démarrage complet, en une commande.
#
#    ./start.sh
#
#  Backend local (Supabase), schéma, comptes de démonstration, portail.
#  IDEMPOTENT : réexécutable sans effet de bord. Ne touche JAMAIS la production.
#
#  Variables optionnelles :
#    WCLPLAY_SQL   répertoire contenant publishers_*.sql (détecté sinon)
#    PORT          port du portail (5174 par défaut)
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT="${PORT:-5174}"
DEMO_PASSWORD='MotDePasse123!'

say()  { printf '\n\033[1m%s\033[0m\n' "$*"; }
ok()   { printf '  \033[32m✓\033[0m %s\n' "$*"; }
die()  { printf '\n\033[31m✗ %s\033[0m\n\n' "$*" >&2; exit 1; }

# ── 0. Prérequis ────────────────────────────────────────────────────────────
say "0/6  Prérequis"
command -v docker   >/dev/null || die "Docker est requis."
docker info >/dev/null 2>&1    || die "Docker ne tourne pas. Démarrez Docker Desktop."
command -v supabase >/dev/null || die "Supabase CLI requis : brew install supabase/tap/supabase"
command -v node     >/dev/null || die "Node ≥ 18 requis."
command -v curl     >/dev/null || die "curl est requis."
command -v python3  >/dev/null || die "python3 est requis."
ok "docker, supabase, node, curl, python3"

# Le SQL du portail est canonique dans wclplay. Tant que la PR n'est pas
# fusionnée, il n'existe que sur la branche feat/publisher-tenancy — on essaie
# donc plusieurs emplacements plutôt que d'échouer sèchement.
find_sql() {
  local candidates=(
    "${WCLPLAY_SQL:-}"
    "$HERE/../wclplay/supabase"
    "$HERE/../wclplay/.claude/worktrees/portal-schema/supabase"
  )
  for dir in "${candidates[@]}"; do
    [ -n "$dir" ] && [ -f "$dir/publishers_schema.sql" ] && { echo "$dir"; return; }
  done
  return 1
}
SQL_DIR="$(find_sql)" || die "publishers_schema.sql introuvable.
Indiquez son répertoire :  WCLPLAY_SQL=/chemin/vers/wclplay/supabase ./start.sh"
ok "SQL du portail : ${SQL_DIR/#$HOME/~}"

# ── 1. Backend local ────────────────────────────────────────────────────────
say "1/6  Backend local (Supabase)"
SUPA_PROJECT="$(cd "$SQL_DIR/.." && pwd)"
if docker ps --format '{{.Names}}' | grep -q '^supabase_db_'; then
  ok "déjà démarré"
else
  echo "  … premier démarrage : téléchargement des images, comptez plusieurs minutes"
  (cd "$SUPA_PROJECT" && supabase start >/dev/null)
  ok "démarré"
fi

DB_CONTAINER="$(docker ps --filter 'name=supabase_db_' --format '{{.Names}}' | head -1)"
[ -n "$DB_CONTAINER" ] || die "Conteneur Postgres introuvable après le démarrage."

STATUS_JSON="$(cd "$SUPA_PROJECT" && supabase status -o json 2>/dev/null)"
read -r API_URL ANON_KEY <<<"$(printf '%s' "$STATUS_JSON" | python3 -c '
import json, sys
s = json.load(sys.stdin)
print(s["API_URL"], s["ANON_KEY"])')"
ok "API $API_URL"

psql_run() { docker exec -i "$DB_CONTAINER" psql -q -v ON_ERROR_STOP=1 -U postgres -d postgres "$@"; }

# ── 2. Schéma ───────────────────────────────────────────────────────────────
say "2/6  Schéma"
psql_run < "$HERE/supabase/local-bootstrap.sql" 2>&1 | grep -v '^NOTICE' || true
ok "amorce WCL minimale"
for f in publishers_schema publishers_helpers publishers_rls publishers_rpc publishers_admin_rpc; do
  psql_run < "$SQL_DIR/$f.sql" 2>&1 | grep -v '^NOTICE' || true
  ok "$f.sql"
done

# ── 3. Comptes de démonstration ─────────────────────────────────────────────
say "3/6  Comptes de démonstration"
signup() {  # un compte déjà présent renvoie une erreur : on l'ignore
  curl -s -X POST "$API_URL/auth/v1/signup" -H "apikey: $ANON_KEY" \
    -H 'Content-Type: application/json' \
    -d "{\"email\":\"$1\",\"password\":\"$DEMO_PASSWORD\"}" >/dev/null || true
}
token() {
  curl -s -X POST "$API_URL/auth/v1/token?grant_type=password" -H "apikey: $ANON_KEY" \
    -H 'Content-Type: application/json' \
    -d "{\"email\":\"$1\",\"password\":\"$DEMO_PASSWORD\"}" \
    | python3 -c 'import json,sys; print(json.load(sys.stdin).get("access_token",""))'
}
rpc() {  # $1 fonction, $2 jeton, $3 corps JSON
  curl -s -X POST "$API_URL/rest/v1/rpc/$1" -H "apikey: $ANON_KEY" \
    -H "Authorization: Bearer $2" -H 'Content-Type: application/json' -d "$3"
}

for account in alice@editions-alpha.cm bob@auteur.fr valideur@cmci.cm; do
  signup "$account"
done
psql_run -c "insert into admin_users(user_id)
             select id from auth.users where email='valideur@cmci.cm'
             on conflict do nothing;" >/dev/null
ok "alice (éditeur) · bob (auteur) · valideur (WCL, admin_users)"

# ── 4. Jeu de démonstration ─────────────────────────────────────────────────
say "4/6  Jeu de démonstration"
ALICE="$(token alice@editions-alpha.cm)"
BOB="$(token bob@auteur.fr)"
[ -n "$ALICE" ] || die "Impossible d'obtenir un jeton pour alice."

has_publisher() {
  psql_run -tAc "select count(*) from publishers where display_name = '$1';" | tr -d '[:space:]'
}
[ "$(has_publisher 'Editions Alpha')" = "0" ] && rpc publisher_register "$ALICE" \
  '{"p_kind":"publisher","p_display_name":"Editions Alpha","p_country_code":"CM",
    "p_contact_email":"alice@editions-alpha.cm","p_legal_name":"Alpha SARL"}' >/dev/null
[ "$(has_publisher 'Bob Auteur')" = "0" ] && rpc publisher_register "$BOB" \
  '{"p_kind":"author","p_display_name":"Bob Auteur","p_country_code":"FR",
    "p_contact_email":"bob@auteur.fr"}' >/dev/null
ok "deux espaces éditeurs cloisonnés"

# Un dossier en attente, pour que la file de validation ne soit pas vide.
if [ "$(psql_run -tAc "select count(*) from publisher_submissions;" | tr -d '[:space:]')" = "0" ]; then
  ALPHA="$(psql_run -tAc "select id from publishers where display_name='Editions Alpha';" | tr -d '[:space:]')"
  SUB="$(rpc submission_save "$ALICE" "{\"p_publisher_id\":\"$ALPHA\",\"p_id\":null,
      \"p_title\":\"Le Sel de la Terre\",\"p_authors\":\"Frère Zach\",\"p_language\":\"fr\",
      \"p_description\":\"Un essai sur la vocation.\",\"p_isbn\":\"978-2-1234-5680-3\"}" | tr -d '"')"
  # Le dépôt de fichier vers R2 n'est pas branché en local : on le simule.
  psql_run -c "update publisher_submissions set file_key='submissions/sel.epub',
               file_format='epub', file_sha256='deadbeef' where id='$SUB';" >/dev/null
  rpc submission_submit "$ALICE" \
    "{\"p_id\":\"$SUB\",\"p_rights\":\"licensed\",\"p_territories\":[\"CM\"],\"p_languages\":[\"fr\"]}" >/dev/null
  ok "un ouvrage en attente de validation"
else
  ok "jeu déjà en place"
fi

# ── 5. Portail ──────────────────────────────────────────────────────────────
say "5/6  Portail"
printf 'VITE_SUPABASE_URL=%s\nVITE_SUPABASE_ANON_KEY=%s\n' "$API_URL" "$ANON_KEY" > "$HERE/.env"
ok ".env"
[ -d "$HERE/node_modules" ] || (cd "$HERE" && npm install --silent)
ok "dépendances"

say "6/6  Prêt"
cat <<EOF
  Portail      http://127.0.0.1:$PORT
  Studio       http://127.0.0.1:54323

  Comptes (mot de passe : $DEMO_PASSWORD)
    alice@editions-alpha.cm   maison d'édition « Editions Alpha »
    bob@auteur.fr             auteur indépendant — pour tester le cloisonnement
    valideur@cmci.cm          validateur WCL, accès à l'onglet Validation

  Les onglets Statistiques / Redevances / Versements sont VIDES à dessein :
  ils dépendent de la sonde de lecture, qui n'est pas livrée.

  Ctrl+C pour arrêter le portail. « supabase stop » pour arrêter le backend.

EOF
cd "$HERE" && exec npm run dev -- --port "$PORT"
