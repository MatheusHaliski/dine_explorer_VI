"use client";

import {
    collection,
    getDocs,
    limit,
    orderBy,
    query,
    startAfter,
    type DocumentData,
    type QueryDocumentSnapshot,
} from "firebase/firestore/lite";

import { getDb } from "./getDb";

type ListRestaurantsOptions = {
    pageSize?: number;
    afterDoc?: QueryDocumentSnapshot<DocumentData> | null;
};

export async function listRestaurants(
    options: ListRestaurantsOptions = {}
): Promise<{
    restaurants: (DocumentData & { id: string })[];
    lastDoc: QueryDocumentSnapshot<DocumentData> | null;
}> {
    const db = getDb();
    if (!db) throw new Error("Firestore is not configured.");

    const pageSize = Math.min(Math.max(options.pageSize ?? 20, 1), 50);

    const constraints = [orderBy("name"), limit(pageSize)];
    const restaurantsQuery = options.afterDoc
        ? query(collection(db, "restaurants"), ...constraints, startAfter(options.afterDoc))
        : query(collection(db, "restaurants"), ...constraints);

    const snapshot = await getDocs(restaurantsQuery);

    return {
        restaurants: snapshot.docs.map((d) => ({ id: d.id, ...d.data() })),
        lastDoc: snapshot.docs.at(-1) ?? null,
    };
}
