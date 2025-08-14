import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../services/firebase/firebase";
import { getItem } from "../services/firebase/firestoreService";

export function useCollection(path, whereClause = null) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading"); // 'loading' | 'ready' | 'error'
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!path) {
      setStatus("error");
      setError("No path provided to useCollection.");
      return;
    }

    let q = collection(db, path);

    if (whereClause) {
      const [field, operator, value] = whereClause;
      q = query(q, where(field, operator, value));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(data);
        setStatus("ready");
      },
      (err) => {
        console.error("useCollection error:", err);
        setError(err.message);
        setStatus("error");
      }
    );

    return () => unsubscribe();
  }, [path, JSON.stringify(whereClause)]);

  return { items, status, error };
}

export function useDocument(collection, id, userUid) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    if (!id) return;
    setStatus("loading");

    getItem(collection, id)
      .then((doc) => {
        if (!doc) throw new Error("Document not found");
        setData(doc);
        setStatus("ready");
        // Check edit permission if we have a user
        setCanEdit(!!userUid && userUid === doc.creatorId);
      })
      .catch((err) => {
        console.error("useDocument error:", err);
        setError(err.message || "Failed to load data.");
        setStatus("error");
      });
  }, [collection, id, userUid]);

  return { data, status, error, canEdit };
}
