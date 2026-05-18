import { getAdminFirestore } from "../app/lib/firebaseAdmin";

type FirestoreInternalSettings = { databaseId?: string };
type FirestoreWithSettings = { _settings?: FirestoreInternalSettings };

async function verify(): Promise<void> {
  const db = getAdminFirestore();
  // [DB-TUNING] Resolve active databaseId from Firestore settings with env fallback.
  const dbId = (db as unknown as FirestoreWithSettings)._settings?.databaseId
    ?? process.env.NEXT_FIREBASE_DATABASE_ID
    ?? "(default)";

  console.log(`\n✅  Database ID in use: "${dbId}"`);

  if (dbId !== "newdedb") {
    console.error(`\n❌  WRONG DATABASE: expected "newdedb", got "${dbId}"`);
    console.error("    Check NEXT_FIREBASE_DATABASE_ID in .env.local\n");
    process.exit(1);
  }

  try {
    const snap = await db.collection("restaurants").limit(1).get();
    console.log(`✅  Read test OK — restaurants collection has ${snap.size} doc(s)`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`❌  Read test FAILED: ${message}`);
    process.exit(1);
  }

  console.log("\n🎉  All checks passed — project is pointing to newdedb\n");
}

verify().catch((error) => {
  console.error(error);
  process.exit(1);
});
