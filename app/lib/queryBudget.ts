// [DB-TUNING] Limite seguro centralizado para paginação e budget de leitura.
export function safeLimit(requested: number | null, max = 50): number {
  if (!requested || requested <= 0 || !Number.isFinite(requested)) return 20;
  return Math.min(requested, max);
}
