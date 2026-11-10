"use client";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Icon } from "@/components/Icons";

type Mode = "entrar" | "cadastro" | "senha";
const LAST_EMAIL = "rumo-farda-email";

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="auth-wrap">
      <Link href="/" className="auth-brand" aria-label="Rumo à Farda, início">
        <span className="brand-mark" aria-hidden="true"><Icon.shield /></span>
        <span className="brand-name">Rumo à Farda</span>
      </Link>
      <section className="card auth-card">{children}</section>
    </div>
  );
}

export default function Entrar() {
  const { cloud, user, authReady, auth, logout } = useStore();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("entrar");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  // Preenche o último e-mail usado neste aparelho.
  useEffect(() => {
    try { const e = localStorage.getItem(LAST_EMAIL); if (e) setEmail(e); } catch {}
  }, []);

  const go = (m: Mode) => { setMode(m); setErr(""); setMsg(""); };
  const run = async (fn: () => Promise<void>, after?: () => void) => {
    setErr(""); setMsg(""); setBusy(true);
    const c = await auth();
    try { await fn(); after?.(); }
    catch (e) { console.error(e); setErr(c.authMessage(e)); }
    setBusy(false);
  };
  const remember = (e: string) => { try { localStorage.setItem(LAST_EMAIL, e); } catch {} };
  const done = () => router.push("/");

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    const e = email.trim();
    if (mode === "cadastro") {
      if (name.trim().length < 2) return setErr("Informe seu nome.");
      if (pass.length < 6) return setErr("A senha precisa ter pelo menos 6 caracteres.");
      run(async () => (await auth()).signUpEmail(name.trim(), e, pass), () => { remember(e); done(); });
    } else if (mode === "entrar") {
      run(async () => (await auth()).loginEmail(e, pass), () => { remember(e); done(); });
    } else {
      run(async () => (await auth()).resetPassword(e), () => setMsg("Enviamos um link para redefinir a senha. Confira também o spam."));
    }
  };
  const google = () => run(async () => (await auth()).loginGoogle(), done);

  if (!cloud) {
    return (
      <Frame>
        <h1>Login indisponível</h1>
        <p className="muted">O Firebase ainda não foi configurado.</p>
        <Link className="btn" href="/">Voltar ao início</Link>
      </Frame>
    );
  }

  if (!authReady) return <Frame><p className="muted" style={{ margin: 0 }}>Carregando…</p></Frame>;

  if (user) {
    return (
      <Frame>
        <h1>{user.displayName || "Aluno"}</h1>
        <p className="muted" style={{ margin: 0 }}>{user.email}</p>
        <Link className="btn primary" href="/">Continuar estudando</Link>
        <button className="btn ghost" onClick={logout}>Sair da conta</button>
      </Frame>
    );
  }

  const title = mode === "cadastro" ? "Criar conta" : mode === "entrar" ? "Entrar" : "Recuperar senha";
  return (
    <Frame>
      <h1>{title}</h1>

      <form className="auth-form" onSubmit={submit} noValidate>
        {mode === "cadastro" && (
          <div className="field">
            <label htmlFor="nome">Nome</label>
            <input id="nome" className="input" autoComplete="name" value={name} onChange={e => setName(e.target.value)} required />
          </div>
        )}
        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input id="email" className="input" type="email" inputMode="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        {mode !== "senha" && (
          <div className="field">
            <div className="auth-label">
              <label htmlFor="senha">Senha</label>
              {mode === "entrar" && <button type="button" className="link" onClick={() => go("senha")}>Esqueci minha senha</button>}
            </div>
            <input id="senha" className="input" type="password" minLength={6}
              autoComplete={mode === "cadastro" ? "new-password" : "current-password"}
              placeholder={mode === "cadastro" ? "Mínimo de 6 caracteres" : undefined}
              value={pass} onChange={e => setPass(e.target.value)} required />
          </div>
        )}

        {err && <p className="auth-msg bad" role="alert">{err}</p>}
        {msg && <p className="auth-msg ok" role="status">{msg}</p>}

        <button className="btn primary" type="submit" disabled={busy}>
          {busy ? "Aguarde…" : mode === "cadastro" ? "Criar conta" : mode === "entrar" ? "Entrar" : "Enviar link"}
        </button>
      </form>

      {mode !== "senha" && (
        <>
          <div className="auth-or"><span>ou</span></div>
          <button className="btn" type="button" onClick={google} disabled={busy}>Continuar com Google</button>
        </>
      )}

      <p className="auth-switch">
        {mode === "entrar" && <>Não tem conta? <button type="button" className="link" onClick={() => go("cadastro")}>Criar conta</button></>}
        {mode === "cadastro" && <>Já tem conta? <button type="button" className="link" onClick={() => go("entrar")}>Entrar</button></>}
        {mode === "senha" && <button type="button" className="link" onClick={() => go("entrar")}>Voltar para o login</button>}
      </p>
    </Frame>
  );
}
