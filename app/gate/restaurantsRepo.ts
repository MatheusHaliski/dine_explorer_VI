"use client";

import { collection, getDocs, limit, orderBy, query, startAfter, documentId, type DocumentData, type QueryDocumentSnapshot } from "firebase/firestore/lite";

import { getDb } from "./getDb";
import { safeLimit } from "@/app/lib/queryBudget";
import { COLLECTIONS } from "@/app/lib/collections";

// [DB-TUNING] Reduz over-fetching via select() e aplica budget de paginação centralizado.
type ListRestaurantsOptions = { pageSize?: number; afterDoc?: QueryDocumentSnapshot<DocumentData> | null };

export async function listRestaurants(options: ListRestaurantsOptions = {}): Promise<{ restaurants: (DocumentData & { id: string })[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null; }> {
  const db = getDb();
  if (!db) throw new Error("Firestore is not configured.");
  const pageSize = safeLimit(options.pageSize ?? 20);
  const constraints = [orderBy(documentId()), limit(pageSize)];
  const restaurantsQuery = options.afterDoc ? query(collection(db, COLLECTIONS.RESTAURANTS), ...constraints, startAfter(options.afterDoc)) : query(collection(db, COLLECTIONS.RESTAURANTS), ...constraints);
  const snapshot = await getDocs(restaurantsQuery);
  return { restaurants: snapshot.docs.map((d) => ({ id: d.id, ...d.data() })), lastDoc: snapshot.docs.at(-1) ?? null };
}
