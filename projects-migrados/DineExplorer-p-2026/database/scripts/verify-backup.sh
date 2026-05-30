#!/usr/bin/env bash
# verify-backup.sh — DineExplorer-p-2026
# Valida integridade dos backups existentes.
# Uso: ./verify-backup.sh [diretorio_backups]
set -euo pipefail

BACKUP_DIR="${1:-./database/backups}"

if [[ ! -d "$BACKUP_DIR" ]]; then
  echo "[erro] Diretório de backups não encontrado: $BACKUP_DIR"
  exit 1
fi

FOUND=0
VALID=0
INVALID=0

for SHA_FILE in "$BACKUP_DIR"/*.sha256; do
  [[ -f "$SHA_FILE" ]] || continue
  SQL_FILE="${SHA_FILE%.sha256}"
  FOUND=$((FOUND + 1))
  if [[ -f "$SQL_FILE" ]]; then
    if sha256sum -c "$SHA_FILE" --quiet 2>/dev/null; then
      echo "[ok]    $SQL_FILE"
      VALID=$((VALID + 1))
    else
      echo "[ERRO]  $SQL_FILE — checksum INVÁLIDO!"
      INVALID=$((INVALID + 1))
    fi
  else
    echo "[aviso] Arquivo SQL não encontrado para: $SHA_FILE"
  fi
done

echo ""
echo "Verificados: $FOUND | Válidos: $VALID | Inválidos: $INVALID"
[[ $INVALID -eq 0 ]] && exit 0 || exit 1
