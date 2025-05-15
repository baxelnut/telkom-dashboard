import { db } from "../firebaseAdmin.js";

export const getAllUsers = async (req, res) => {
  try {
    const usersSnapshot = await db.collection("users").get();

    if (usersSnapshot.empty) {
      return res.status(404).json({ error: "No admins found" });
    }

    const admins = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      email: doc.data().email,
      role: doc.data().role,
    }));

    res.status(200).json({ data: admins });
  } catch (err) {
    console.error("🔥 getAllUsers Error:", err);
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
      },
    });
  } catch (err) {
    console.error("🔥 getUserByEmail Error:", err);
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
    }));

    res.status(200).json({ data: admins });
  } catch (err) {
    console.error("🔥 getAllAdmins Error:", err);
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
    };

    res.status(200).json({ data: adminInfo });
  } catch (err) {
    console.error("🔥 getAdminInfo Error:", err);
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
    console.error("🔥 updateUserRole Error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Unknown server error" });
  }
};

export const registerNewUser = async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body;

    if (!email || !firstName || !lastName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const fullName = `${firstName} ${lastName}`;
    const role = "waiting approval";

    const newUserRef = db.collection("users").doc();
    await newUserRef.set({
      email,
      fullName,
      role,
    });

    res.status(201).json({
      message: "User registered and waiting approval",
      userId: newUserRef.id,
    });
  } catch (err) {
    console.error("🔥 registerNewUser Error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
};
