#!/usr/bin/env bash
# restore-mysql.sh — DineExplorer-p-2026
# Restaura dump MySQL com validação de checksum e confirmação manual.
# Uso: ./restore-mysql.sh <arquivo_backup.sql.gz>
# NUNCA executar em produção sem confirmação explícita.
set -euo pipefail

BACKUP_FILE="${1:?Informe o arquivo de backup como argumento. Ex: ./restore-mysql.sh backup.sql.gz}"

if [[ ! -f "$BACKUP_FILE" ]]; then
  echo "[erro] Arquivo não encontrado: $BACKUP_FILE"
  exit 1
fi

# ── Carregar variáveis do .env ────────────────────────────────
if [[ -f "$(dirname "$0")/../../../.env" ]]; then
  # shellcheck source=/dev/null
  source "$(dirname "$0")/../../../.env"
fi

: "${DB_HOST:?Variável DB_HOST não definida.}"
: "${DB_PORT:?Variável DB_PORT não definida.}"
: "${DB_NAME:?Variável DB_NAME não definida.}"

RESTORE_USER="${RESTORE_DB_USER:-root}"
RESTORE_PASS="${RESTORE_DB_PASSWORD:?Variável RESTORE_DB_PASSWORD não definida.}"

# ── Validar checksum se disponível ───────────────────────────
CHECKSUM_FILE="${BACKUP_FILE%.gz}.sha256"
if [[ -f "$CHECKSUM_FILE" ]]; then
  echo "[restore] Validando checksum..."
  ORIGINAL_SQL="${BACKUP_FILE%.gz}"
  if [[ -f "$ORIGINAL_SQL" ]]; then
    sha256sum -c "$CHECKSUM_FILE"
  else
    echo "[aviso] Arquivo SQL descompactado não encontrado para validar checksum."
    echo "[aviso] Prosseguindo sem validação de integridade."
  fi
fi

# ── Confirmação obrigatória ───────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  ATENÇÃO: Esta operação vai RESTAURAR o banco de dados   ║"
echo "║  ${DB_NAME} e pode SOBRESCREVER dados existentes.        ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
read -r -p "Digite CONFIRMAR para continuar: " CONFIRM
if [[ "$CONFIRM" != "CONFIRMAR" ]]; then
  echo "[restore] Operação cancelada."
  exit 0
fi

echo "[restore] Descompactando ${BACKUP_FILE}..."
TMP_SQL=$(mktemp /tmp/restore_XXXXXX.sql)
trap 'rm -f "$TMP_SQL"' EXIT
gzip -dc "$BACKUP_FILE" > "$TMP_SQL"

echo "[restore] Restaurando no banco ${DB_NAME}..."
MYSQL_PWD="$RESTORE_PASS" mysql \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --user="$RESTORE_USER" \
  "$DB_NAME" < "$TMP_SQL"

echo "[restore] RESTAURAÇÃO CONCLUÍDA."
