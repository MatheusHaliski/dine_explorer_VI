import { getAdminFirestore } from "../app/lib/firebaseAdmin";
import { COLLECTIONS, SUB } from "../app/lib/collections";

// [DB-TUNING] Migra review global para subcoleção restaurants/{id}/reviews sem apagar origem.
async function migrateReviews(): Promise<void> {
  const db = getAdminFirestore();
  const snap = await db.collection(COLLECTIONS.REVIEW).where("restaurantId", "!=", null).get();
  let migrated = 0;
  for (const doc of snap.docs) {
    try {
      const data = doc.data() as { restaurantId?: string };
      if (!data.restaurantId) continue;
      await db.collection(COLLECTIONS.RESTAURANTS).doc(data.restaurantId).collection(SUB.REVIEWS).doc(doc.id).set(data, { merge: true });
      migrated++;
      console.log(`[migrate-reviews] migrated ${migrated}/${snap.size}: ${doc.id}`);
    } catch (error) {
      console.error(`[migrate-reviews] failed for ${doc.id}`, error);
    }
  }
  console.log(`[migrate-reviews] done: ${migrated}/${snap.size}`);
}

migrateReviews().catch((error) => { console.error(error); process.exit(1); });
