// Carregado sob demanda (import dinâmico) só quando o Firebase está configurado.
import { initializeApp, getApps } from "firebase/app";
import {
  initializeAuth, getAuth, browserLocalPersistence, indexedDBLocalPersistence, browserPopupRedirectResolver,
  GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updateProfile,
  type Auth, type User
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { firebaseConfig, type CloudUser } from "./firebase";

const app = getApps()[0] || initializeApp(firebaseConfig);

// Sessão fica guardada no aparelho: o aluno entra uma vez e continua logado,
// sem precisar digitar e-mail e senha de novo a cada visita.
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: [indexedDBLocalPersistence, browserLocalPersistence],
    popupRedirectResolver: browserPopupRedirectResolver
  });
} catch {
  auth = getAuth(app); // já inicializado (hot reload)
}
auth.languageCode = "pt";
const db = getFirestore(app);

const PROGRESS_FIELDS = ["done", "seen", "history", "target", "updatedAt"];

const toCloud = (u: User): CloudUser => ({ uid: u.uid, displayName: u.displayName, email: u.email, photoURL: u.photoURL });

/** Cria/atualiza o perfil do aluno em users/{uid} sem mexer no progresso. */
async function saveProfile(u: User, extra: Record<string, unknown> = {}) {
  const ref = doc(db, "users", u.uid);
  const snap = await getDoc(ref);
  const profile: Record<string, unknown> = {
    name: u.displayName || "",
    email: u.email || "",
    provider: u.providerData[0]?.providerId || "password",
    lastLoginAt: serverTimestamp(),
    ...extra
  };
  if (!snap.exists() || !snap.get("profile.createdAt")) profile.createdAt = serverTimestamp();
  await setDoc(ref, { profile }, { merge: true });
}

export const watchUser = (cb: (u: CloudUser | null) => void) =>
  onAuthStateChanged(auth, u => cb(u ? toCloud(u) : null));

export const loginGoogle = async () => {
  const { user } = await signInWithPopup(auth, new GoogleAuthProvider());
  await saveProfile(user);
};

export const signUpEmail = async (name: string, email: string, password: string) => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName: name });
  await saveProfile(user, { name });
};

export const loginEmail = async (email: string, password: string) => {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  await saveProfile(user);
};

export const resetPassword = (email: string) => sendPasswordResetEmail(auth, email);

export const logout = () => signOut(auth);

export const readProgress = async (uid: string) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
};

/** Grava só os campos de progresso (substituindo-os por inteiro) e preserva o perfil. */
export const writeProgress = (uid: string, data: object) =>
  setDoc(doc(db, "users", uid), data, { mergeFields: PROGRESS_FIELDS });

/** Mensagens de erro do Firebase em português. */
export function authMessage(e: unknown): string {
  const code = (e as { code?: string })?.code || "";
  const map: Record<string, string> = {
    "auth/email-already-in-use": "Este e-mail já tem cadastro. Use a aba Entrar.",
    "auth/invalid-email": "E-mail inválido.",
    "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/wrong-password": "E-mail ou senha incorretos.",
    "auth/user-not-found": "Não encontramos cadastro com este e-mail.",
    "auth/too-many-requests": "Muitas tentativas. Aguarde alguns minutos e tente de novo.",
    "auth/network-request-failed": "Sem conexão com a internet.",
    "auth/popup-closed-by-user": "Janela de login fechada antes de concluir.",
    "auth/popup-blocked": "O navegador bloqueou a janela de login. Libere pop-ups e tente de novo.",
    "auth/operation-not-allowed": "Este tipo de login não está ativado no Firebase.",
    "auth/unauthorized-domain": "Este domínio não está autorizado no Firebase (Authentication → Settings)."
  };
  return map[code] || "Não foi possível concluir. Tente novamente.";
}
