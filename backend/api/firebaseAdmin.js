import admin from "firebase-admin";

// import serviceAccount from "../keys/serviceAccountKey.json" assert { type: "json" }; // IN DEVELOPMENT

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON); // IN PRODUCTION

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const db = admin.firestore();
