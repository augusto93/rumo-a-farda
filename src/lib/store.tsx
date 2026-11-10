"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { firebaseEnabled, type CloudUser } from "./firebase";

type Client = typeof import("./firebase-client");
let clientP: Promise<Client> | null = null;
const client = () => (clientP ??= import("./firebase-client"));
import type { StudyState } from "./types";

const KEY = "rumo-farda-v1";
/** Último usuário logado: abre o app na hora, sem esperar o Firebase confirmar a sessão. */
const USER_KEY = "rumo-farda-user";
function loadUser(): CloudUser | null {
  try { const raw = localStorage.getItem(USER_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
function saveUser(u: CloudUser | null) {
  try { if (u) localStorage.setItem(USER_KEY, JSON.stringify(u)); else localStorage.removeItem(USER_KEY); } catch {}
}
const empty = (): StudyState => ({ done: {}, seen: {}, history: [], target: "pmerj", exam: null, updatedAt: 0 });

function loadLocal(): StudyState {
  try { const raw = localStorage.getItem(KEY); if (raw) return { ...empty(), ...JSON.parse(raw) }; } catch {}
  return empty();
}
function saveLocal(s: StudyState) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} }

/** Junta o progresso do aparelho com o da nuvem sem perder nada. */
function merge(a: StudyState, b: Partial<StudyState>): StudyState {
  const done = { ...(b.done || {}), ...a.done };
  const seen: Record<string, number> = { ...(b.seen || {}) };
  Object.entries(a.seen).forEach(([k, v]) => (seen[k] = Math.max(v, seen[k] || 0)));
  const byAt = new Map<number, StudyState["history"][number]>();
  [...(b.history || []), ...a.history].forEach(h => byAt.set(h.at, h));
  const history = [...byAt.values()].sort((x, y) => y.at - x.at).slice(0, 100);
  const target = (b.updatedAt || 0) > a.updatedAt && b.target ? b.target : a.target;
  return { done, seen, history, target, exam: a.exam, updatedAt: Date.now() };
}

type Ctx = {
  state: StudyState;
  ready: boolean;
  update: (fn: (s: StudyState) => StudyState) => void;
  user: CloudUser | null;
  cloud: boolean;
  syncing: boolean;
  /** carregado o estado de login (evita piscar "Entrar" para quem já está logado) */
  authReady: boolean;
  auth: () => Promise<Client>;
  /** relê nome/e-mail do usuário (ex.: depois do cadastro) */
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  reset: () => void;
};
const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StudyState>(empty);
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<CloudUser | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [authReady, setAuthReady] = useState(!firebaseEnabled);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userRef = useRef<CloudUser | null>(null);

  useEffect(() => {
    setState(loadLocal()); setReady(true);
    if (!firebaseEnabled) return;
    const cached = loadUser();
    if (cached) { setUser(cached); userRef.current = cached; setAuthReady(true); }
  }, []);

  const pushCloud = useCallback((s: StudyState) => {
    const u = userRef.current;
    if (!firebaseEnabled || !u) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSyncing(true);
      try { const { exam, ...rest } = s; void exam; await (await client()).writeProgress(u.uid, rest); } catch (e) { console.error("Falha ao sincronizar", e); }
      setSyncing(false);
    }, 1200);
  }, []);

  useEffect(() => {
    if (!firebaseEnabled) return;
    let off: (() => void) | undefined, alive = true;
    client().then(c => { if (!alive) return; off = c.watchUser(async u => {
      setUser(u); userRef.current = u; setAuthReady(true); saveUser(u);
      if (!u) return;
      setSyncing(true);
      try {
        const remote = await c.readProgress(u.uid);
        setState(prev => {
          const merged = remote ? merge(prev, remote as Partial<StudyState>) : { ...prev, updatedAt: Date.now() };
          saveLocal(merged); pushCloud(merged);
          return merged;
        });
      } catch (e) { console.error(e); }
      setSyncing(false);
    }); });
    return () => { alive = false; off?.(); };
  }, [pushCloud]);

  const update = useCallback((fn: (s: StudyState) => StudyState) => {
    setState(prev => {
      const next = { ...fn(prev), updatedAt: Date.now() };
      saveLocal(next);
      // a prova em andamento fica só no aparelho; o resto vai para a nuvem
      if (next.exam === prev.exam || next.exam === null || next.exam.finished) pushCloud(next);
      return next;
    });
  }, [pushCloud]);

  const refreshUser = useCallback(async () => {
    if (!firebaseEnabled) return;
    const u = (await client()).currentUser();
    if (u) { setUser(u); userRef.current = u; saveUser(u); }
  }, []);

  /** Ao sair, apaga o progresso deste aparelho para não misturar com o próximo aluno. */
  const logout = async () => {
    if (!firebaseEnabled) return;
    if (timer.current) clearTimeout(timer.current);
    await (await client()).logout();
    userRef.current = null; setUser(null); saveUser(null);
    try { localStorage.removeItem(KEY); } catch {}
    setState(empty());
  };
  const reset = () => update(s => ({ ...empty(), target: s.target }));

  return (
    <StoreCtx.Provider value={{ state, ready, update, user, cloud: firebaseEnabled, syncing, authReady, auth: client, refreshUser, logout, reset }}>
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore precisa do StoreProvider");
  return c;
}
