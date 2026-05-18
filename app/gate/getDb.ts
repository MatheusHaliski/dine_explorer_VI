"use client";

// [DB-TUNING] Migração para SDK completo com suporte a databaseId configurável e realtime APIs.
import { getFirestore, type Firestore } from "firebase/firestore";
import { firebaseAuthGate } from "@/app/gate/firebaseClient";

let _db: Firestore | null = null;

export function getDb(): Firestore | null {
  if (typeof window === "undefined") return null;
  if (_db) return _db;
  const { firebaseApp, hasFirebaseConfig } = firebaseAuthGate();
  if (!firebaseApp || !hasFirebaseConfig) return null;
  _db = getFirestore(firebaseApp, process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID ?? "(default)");
  return _db;
}

export function getDbOrThrow(): Firestore {
  const db = getDb();
  if (!db) throw new Error("Firestore unavailable: firebase app not configured or running outside client.");
  return db;
}
