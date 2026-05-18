import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let firestoreInstance: Firestore | null = null;
let authInstance: Auth | null = null;

const getOrInitAdminApp = () => {
    const projectId = process.env.NEXT_FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.NEXT_FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.NEXT_FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error("Server authentication is not configured.");
    }

    if (!getApps().length) {
        initializeApp({
            credential: cert({ projectId, clientEmail, privateKey }),
        });
    }

    return getApps()[0]!;
};

export const getAdminFirestore = (): Firestore => {
    if (firestoreInstance) return firestoreInstance;
    const app = getOrInitAdminApp();
    // [DB-TUNING] Use NEXT_FIREBASE_DATABASE_ID to point to newdedb.
    const databaseId = process.env.NEXT_FIREBASE_DATABASE_ID ?? "(default)";
    // [DB-TUNING] Explicitly bind Admin SDK Firestore to selected databaseId.
    firestoreInstance = getFirestore(app, databaseId);
    return firestoreInstance;
};

export const getAdminAuth = (): Auth => {
    if (authInstance) return authInstance;
    const app = getOrInitAdminApp();
    authInstance = getAuth(app);
    return authInstance;
};

// [DB-TUNING] Reset singletons (used in tests and hot-reload).
export const resetAdminInstances = (): void => {
    firestoreInstance = null;
    authInstance = null;
};
