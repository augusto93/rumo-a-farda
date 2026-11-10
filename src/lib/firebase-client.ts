// Carregado sob demanda (import dinâmico) só quando o Firebase está configurado.
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { firebaseConfig, type CloudUser } from "./firebase";

const app = getApps()[0] || initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export const watchUser = (cb: (u: CloudUser | null) => void) =>
  onAuthStateChanged(auth, u => cb(u ? { uid: u.uid, displayName: u.displayName, photoURL: u.photoURL } : null));
export const login = () => signInWithPopup(auth, new GoogleAuthProvider()).then(() => undefined);
export const logout = () => signOut(auth);
export const readProgress = async (uid: string) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
};
export const writeProgress = (uid: string, data: object) => setDoc(doc(db, "users", uid), data);
