import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import app from "./firebase";

const db = getFirestore(app);

export const addUser = async (user) => {
  try {
    const docRef = await addDoc(collection(db, "users"), user);
    console.log("Document written with ID:", docRef.id);
  } catch (e) {
    console.error("Error adding document:", e);
  }
};

export const getUsers = async () => {
  const querySnapshot = await getDocs(collection(db, "users"));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
