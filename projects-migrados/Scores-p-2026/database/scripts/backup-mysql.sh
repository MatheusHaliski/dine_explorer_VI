#!/usr/bin/env bash
# backup-mysql.sh — Scores-p-2026
# Gera dump MySQL seguro com checksum e compactação.
# Uso: ./backup-mysql.sh
set -euo pipefail

# ── Carregar variáveis do .env ────────────────────────────────
if [[ -f "$(dirname "$0")/../../../.env" ]]; then
  # shellcheck source=/dev/null
  source "$(dirname "$0")/../../../.env"
fi

: "${DB_HOST:?Variável DB_HOST não definida.}"
: "${DB_PORT:?Variável DB_PORT não definida.}"
: "${DB_NAME:?Variável DB_NAME não definida.}"
: "${BACKUP_DIR:=./database/backups}"

# Usuário de backup — nunca use o root da aplicação aqui
BACKUP_USER="${BACKUP_DB_USER:-scores-p-2026_backup_user}"
BACKUP_PASS="${BACKUP_DB_PASSWORD:?Variável BACKUP_DB_PASSWORD não definida.}"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_backup_${TIMESTAMP}.sql"

mkdir -p "$BACKUP_DIR"

echo "[backup] Iniciando dump de ${DB_NAME} em ${BACKUP_FILE}..."

# Não exibe senha no log — passa via variável de ambiente do processo
MYSQL_PWD="$BACKUP_PASS" mysqldump \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --user="$BACKUP_USER" \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  --set-gtid-purged=OFF \
  "$DB_NAME" > "$BACKUP_FILE"

echo "[backup] Dump concluído. Gerando checksum..."
sha256sum "$BACKUP_FILE" > "${BACKUP_FILE}.sha256"

echo "[backup] Compactando..."
gzip "$BACKUP_FILE"

echo "[backup] Backup salvo em: ${BACKUP_FILE}.gz"
echo "[backup] Checksum: ${BACKUP_FILE}.sha256"
echo "[backup] CONCLUÍDO com sucesso."
