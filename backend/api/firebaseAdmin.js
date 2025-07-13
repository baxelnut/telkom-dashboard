// Only use dotenv locally
if (process.env.NODE_ENV !== "production") {
  import("dotenv/config");
}

import admin from "firebase-admin";
import fs from "fs";
import path from "path";

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const parsed = JSON.parse(rawJson);

    if (parsed.private_key) {
      parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
    }

    serviceAccount = parsed;
    console.log("Loaded service account from ENV");
  } catch (err) {
    console.error("Invalid FIREBASE_SERVICE_ACCOUNT_JSON:", err);
    throw err;
  }
} else {
  const keyPath = path.resolve("./keys/serviceAccountKey.json");
  try {
    const fileContent = fs.readFileSync(keyPath, "utf8");
    serviceAccount = JSON.parse(fileContent);
    console.log("Loaded service account from file");
  } catch (err) {
    console.error(`Failed to load service account file at ${keyPath}:`, err);
    throw err;
  }
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("Firebase Admin initialized");
}

export const db = admin.firestore();
