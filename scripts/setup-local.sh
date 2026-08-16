#!/usr/bin/env bash
# Prépare une base LOCALE complète pour le portail éditeurs.
#
#   ./scripts/setup-local.sh
#
# Prérequis : `supabase start` a été lancé (depuis le dépôt wclplay), Docker tourne.
# Idempotent : ré-exécutable sans effet de bord.
set -euo pipefail

DB_URL="${DB_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"
WCLPLAY="${WCLPLAY:-../wclplay}"
HERE="$(cd "$(dirname "$0")/.." && pwd)"

run() {
  echo "  → $(basename "$1")"
  docker exec -i supabase_db_anjqdvrniawarrueztva psql -q -v ON_ERROR_STOP=1 \
    -U postgres -d postgres < "$1"
}

echo "1/2  Amorce WCL minimale"
run "$HERE/supabase/local-bootstrap.sql"

echo "2/2  Modèle de locataire éditeur"
for f in publishers_schema publishers_helpers publishers_rls publishers_rpc publishers_admin_rpc; do
  run "$WCLPLAY/supabase/$f.sql"
done

echo
echo "Base prête. Studio : http://127.0.0.1:54323"
