import admin from "firebase-admin";
import { db } from "../firebaseAdmin.js";

export const getAllUsers = async (req, res) => {
  try {
    const usersSnapshot = await db.collection("users").get();
    if (usersSnapshot.empty) {
      return res.status(404).json({ error: "No admins found" });
    }
    const admins = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      fullName: doc.data().fullName,
      email: doc.data().email,
      role: doc.data().role,
      docId: doc.data().docId,
      uid: doc.data().uid,
      telegramId: doc.data().telegramId,
    }));
    res.status(200).json({ data: admins });
  } catch (err) {
    console.error("getAllUsers Error:", err);
    res.status(500).json({ error: err.message || "Unknown server error" });
  }
};

export const getUserByEmail = async (req, res) => {
  const email = req.query.email || req.params.email;
  try {
    const snapshot = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();
    if (snapshot.empty) {
      return res.status(404).json({ error: "User not found" });
    }
    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    res.status(200).json({
      data: {
        id: userDoc.id,
        email: userData.email,
        role: userData.role,
        fullName: userData.fullName,
        docId: userData.docId,
        uid: userData.uid,
        telegramId: userData.telegramId,
      },
    });
  } catch (err) {
    console.error("getUserByEmail Error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
};

export const getUserByUid = async (req, res) => {
  const uid = req.query.uid || req.params.uid;
  try {
    const snapshot = await db
      .collection("users")
      .where("uid", "==", uid)
      .limit(1)
      .get();
    if (snapshot.empty) {
      return res.status(404).json({ error: "User not found" });
    }
    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    res.status(200).json({
      data: {
        id: userDoc.id,
        email: userData.email,
        role: userData.role,
        fullName: userData.fullName,
        docId: userData.docId,
        uid: userData.uid,
        telegramId: userData.telegramId,
      },
    });
  } catch (err) {
    console.error("getUserByUid Error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
};

export const updateUserByUid = async (req, res) => {
  try {
    const { uid } = req.params;
    const { fullName, email, telegramId, role } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "Missing uid in URL" });
    }

    const snapshot = await db
      .collection("users")
      .where("uid", "==", uid)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "User not found" });
    }

    const userDoc = snapshot.docs[0];
    const userRef = userDoc.ref;

    // Prepare only provided fields
    const updates = {};
    if (fullName !== undefined) updates.fullName = fullName;
    if (email !== undefined) updates.email = email;
    if (telegramId !== undefined) updates.telegramId = telegramId;
    if (role !== undefined) updates.role = role;

    await userRef.update(updates);

    res.status(200).json({
      message: "User updated successfully",
      data: { id: userDoc.id, ...updates },
    });
  } catch (err) {
    console.error("updateUserByUid Error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
};

export const deleteUserByUid = async (req, res) => {
  try {
    const { uid } = req.params;
    if (!uid) return res.status(400).json({ error: "Missing UID parameter" });

    // Delete Firestore doc
    const snapshot = await db
      .collection("users")
      .where("uid", "==", uid)
      .limit(1)
      .get();

    if (snapshot.empty)
      return res.status(404).json({ error: "User not found" });

    await snapshot.docs[0].ref.delete();

    await admin.auth().deleteUser(uid); // Delete Firebase Auth user

    res.status(200).json({
      message: `User with UID ${uid} deleted from Firestore & Auth successfully`,
    });
  } catch (err) {
    console.error("deleteUserByUid Error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
};

export const getAllAdmins = async (req, res) => {
  try {
    const usersSnapshot = await db
      .collection("users")
      .where("role", "==", "admin")
      .get();
    if (usersSnapshot.empty) {
      return res.status(404).json({ error: "No admins found" });
    }
    const admins = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      email: doc.data().email,
      role: doc.data().role,
      docId: doc.data().docId,
      uid: doc.data().uid,
    }));
    res.status(200).json({ data: admins });
  } catch (err) {
    console.error("getAllAdmins Error:", err);
    res.status(500).json({ error: err.message || "Unknown server error" });
  }
};

export const getAdminInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId param" });
    }
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }
    const userData = userDoc.data();
    if (userData.role !== "admin") {
      return res.status(403).json({ error: "Access denied: Not an admin" });
    }
    const adminInfo = {
      email: userData.email,
      role: userData.role,
      docId: userData.docId,
      uid: userData.uid,
    };
    res.status(200).json({ data: adminInfo });
  } catch (err) {
    console.error("getAdminInfo Error:", err);
    res.status(500).json({ error: err.message || "Unknown server error" });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email || !role) {
      return res
        .status(400)
        .json({ error: "Missing 'email' or 'role' in body" });
    }
    const usersSnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .get();
    if (usersSnapshot.empty) {
      return res.status(404).json({ error: "User not found" });
    }
    const userDoc = usersSnapshot.docs[0];
    const userRef = userDoc.ref;
    await userRef.update({ role });
    return res
      .status(200)
      .json({ message: `User role updated to '${role}' for ${email}` });
  } catch (err) {
    console.error("updateUserRole Error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Unknown server error" });
  }
};

function toTitleCase(str) {
  return str
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export const registerNewUser = async (req, res) => {
  try {
    let { uid, email, firstName, lastName, telegramId } = req.body;
    if (!uid || !email || !firstName || !lastName || !telegramId) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    firstName = toTitleCase(firstName);
    lastName = toTitleCase(lastName);
    const fullName = `${firstName} ${lastName}`;
    const role = "waiting approval";
    const userRef = db.collection("users").doc(uid);
    const snapshot = await userRef.get();
    if (snapshot.exists) {
      return res.status(409).json({ error: "User already registered" });
    }
    await userRef.set({
      uid,
      docId: uid,
      role,
      email,
      fullName,
      telegramId,
      createdAt: new Date().toISOString(),
    });
    res.status(201).json({
      message: "User registered and waiting approval",
      uid,
    });
  } catch (err) {
    console.error("registerNewUser Error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
};
