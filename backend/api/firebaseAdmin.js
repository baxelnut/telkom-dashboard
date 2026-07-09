import "dotenv/config";

import fs from "fs";
import path from "path";

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(
      /\\n/g,
      "\n",
    );
  }
} else {
  const keyPath = path.resolve("./keys/serviceAccountKey.json");
  serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));
}

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

export const db = getFirestore();
