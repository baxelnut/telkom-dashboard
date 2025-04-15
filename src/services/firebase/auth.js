import { auth } from "./index";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

export const signUp = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

export const logIn = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const logOut = () => signOut(auth);
