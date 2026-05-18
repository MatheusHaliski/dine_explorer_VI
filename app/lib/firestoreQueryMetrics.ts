// [DB-TUNING] Métricas expandidas com agregação em memória, alertas de lentidão e reads estimados.
export type FirestoreOperationType = "getDocs" | "getDoc" | "onSnapshot" | "getAll" | "runQuery" | "write";

export type FirestoreQueryMetric = {
  feature_name: string;
  collection: string;
  operation_type: FirestoreOperationType;
  docs_returned: number;
  reads_billed: number;
  duration_ms: number;
  status: "success" | "error";
  error_message?: string;
  created_at: number;
};

const metricStore: FirestoreQueryMetric[] = [];

export function getFirestoreMetrics(): FirestoreQueryMetric[] {
  return [...metricStore];
}

function pushMetric(metric: FirestoreQueryMetric): void {
  metricStore.push(metric);
  if (metricStore.length > 1000) metricStore.shift();
}

export async function withFirestoreQueryMetrics<T>(
  context: Omit<FirestoreQueryMetric, "docs_returned" | "reads_billed" | "duration_ms" | "status" | "error_message" | "created_at">,
  run: () => Promise<{ result: T; docsReturned: number }>
): Promise<T> {
  const startedAt = Date.now();
  try {
    const { result, docsReturned } = await run();
    const metric: FirestoreQueryMetric = {
      ...context,
      docs_returned: docsReturned,
      reads_billed: docsReturned,
      duration_ms: Date.now() - startedAt,
      status: "success",
      created_at: Date.now(),
    };
    pushMetric(metric);
    if (metric.duration_ms > 1000) console.warn("[FirestoreMetric:Warning]", metric);
    if (metric.duration_ms > 500) {
      console.warn("[SlowQuery]", { feature: context.feature_name, collection: context.collection, duration_ms: metric.duration_ms, docs_returned: docsReturned });
    }
    console.info("[FirestoreMetric]", metric);
    return result;
  } catch (error) {
    const metric: FirestoreQueryMetric = {
      ...context,
      docs_returned: 0,
      reads_billed: 0,
      duration_ms: Date.now() - startedAt,
      status: "error",
      error_message: error instanceof Error ? error.message : "Unknown error",
      created_at: Date.now(),
    };
    pushMetric(metric);
    console.error("[FirestoreMetric]", metric);
    throw error;
  }
}
