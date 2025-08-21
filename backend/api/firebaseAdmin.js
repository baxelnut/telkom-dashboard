import "dotenv/config";

import admin from "firebase-admin";
import fs from "fs";
import path from "path";

let serviceAccount;

// Prefer env var (works in Vercel)
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

  if (parsed.private_key) {
    parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
  }

  serviceAccount = parsed;
  console.log("✅ Service account from ENV");
} else {
  // Fallback for local dev with file
  const keyPath = path.resolve("./keys/serviceAccountKey.json");
  const fileContent = fs.readFileSync(keyPath, "utf8");
  serviceAccount = JSON.parse(fileContent);
  console.log("✅ Service account from file");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("🔥 Firebase Admin initialized");
}

export const db = admin.firestore();
