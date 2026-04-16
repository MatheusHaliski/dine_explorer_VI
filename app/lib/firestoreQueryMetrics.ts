export type FirestoreOperationType =
    | "getDocs"
    | "getDoc"
    | "onSnapshot"
    | "getAll"
    | "runQuery"
    | "write";

export type FirestoreQueryMetric = {
    feature_name: string;
    collection: string;
    operation_type: FirestoreOperationType;
    docs_returned: number;
    duration_ms: number;
    status: "success" | "error";
    error_message?: string;
};

export async function withFirestoreQueryMetrics<T>(
    context: Omit<FirestoreQueryMetric, "docs_returned" | "duration_ms" | "status" | "error_message">,
    run: () => Promise<{ result: T; docsReturned: number }>
): Promise<T> {
    const startedAt = Date.now();

    try {
        const { result, docsReturned } = await run();
        const metric: FirestoreQueryMetric = {
            ...context,
            docs_returned: docsReturned,
            duration_ms: Date.now() - startedAt,
            status: "success",
        };

        console.info("[FirestoreMetric]", metric);
        return result;
    } catch (error) {
        const metric: FirestoreQueryMetric = {
            ...context,
            docs_returned: 0,
            duration_ms: Date.now() - startedAt,
            status: "error",
            error_message: error instanceof Error ? error.message : "Unknown error",
        };

        console.error("[FirestoreMetric]", metric);
        throw error;
    }
}
