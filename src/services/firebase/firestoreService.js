import {
  collection,
  getDocs,
  query,
  doc,
  getDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

export const getItems = async (collectionName) => {
  const colRef = collection(db, collectionName);
  const q = query(colRef);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const getItem = async (
  collectionName,
  searchValue,
  searchField = "id"
) => {
  if (searchField === "id") {
    const docRef = doc(db, collectionName, searchValue);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
  }

  // Search by another field (e.g. email)
  const q = query(
    collection(db, collectionName),
    where(searchField, "==", searchValue)
  );
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;

  // Take the first match
  const docSnap = querySnapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
};
