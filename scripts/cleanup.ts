import { Timestamp } from "firebase-admin/firestore";
import { getAdminFirestore } from "../app/lib/firebaseAdmin";
import { COLLECTIONS, SUB } from "../app/lib/collections";

// [DB-TUNING] Limpeza de idempotência expirada e pedidos pendentes antigos.
export async function cleanExpiredIdempotency(): Promise<void> {
  const db = getAdminFirestore();
  const now = Timestamp.now();
  const restaurants = await db.collection(COLLECTIONS.RESTAURANTS).get();
  for (const restaurant of restaurants.docs) {
    const old = await restaurant.ref.collection(SUB.IDEMPOTENCY).where("expiresAt", "<", now).get();
    const batch = db.batch();
    old.docs.forEach((doc) => batch.delete(doc.ref));
    if (!old.empty) await batch.commit();
  }
}

export async function cleanOldPendingOrders(): Promise<void> {
  const db = getAdminFirestore();
  const cutoff = Timestamp.fromMillis(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const restaurants = await db.collection(COLLECTIONS.RESTAURANTS).get();
  for (const restaurant of restaurants.docs) {
    const old = await restaurant.ref.collection(SUB.ORDERS).where("status", "==", "pending_checkout").where("createdAt", "<", cutoff).get();
    const batch = db.batch();
    old.docs.forEach((doc) => batch.delete(doc.ref));
    if (!old.empty) await batch.commit();
  }
}
