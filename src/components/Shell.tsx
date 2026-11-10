"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Icon } from "./Icons";
import { useStore } from "@/lib/store";
import { TARGETS } from "@/lib/catalog";

const NAV = [
  { href: "/", label: "Início", icon: Icon.home },
  { href: "/aulas", label: "Aulas", icon: Icon.book },
  { href: "/simulado", label: "Simulado", icon: Icon.exam },
  { href: "/desempenho", label: "Desempenho", icon: Icon.chart }
];

export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const { state, user, cloud, syncing, authReady, logout } = useStore();
  // A tela de login é independente: sem menu lateral nem barra inferior.
  if (path === "/entrar") return <main className="auth-page">{children}</main>;
  const active = (h: string) => (h === "/" ? path === "/" : path.startsWith(h));
  const links = NAV.map(n => (
    <Link key={n.href} href={n.href} aria-current={active(n.href) ? "page" : undefined}>
      <n.icon /><span>{n.label}</span>
    </Link>
  ));
  return (
    <div className="app">
      <aside className="side" aria-label="Menu">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true"><Icon.shield /></div>
          <div><div className="brand-name">Rumo à Farda</div><div className="brand-sub">PMERJ · Guarda de Maricá</div></div>
        </div>
        <nav className="nav">{links}</nav>
        <div className="side-foot account">
          <div className="eyebrow">Foco atual</div>
          <b>{TARGETS[state.target].name}</b>
          {cloud ? (
            user ? (
              <>
                <div className="row" style={{ gap: 8 }}>
                  {user.photoURL && <img src={user.photoURL} alt="" referrerPolicy="no-referrer" />}
                  <Link href="/entrar" style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{user.displayName || user.email}</Link>
                </div>
                <span className="sync">{syncing ? "Sincronizando…" : "Progresso salvo na nuvem"}</span>
                <button className="btn ghost" style={{ minHeight: 34, padding: "4px 8px" }} onClick={logout}>Sair</button>
              </>
            ) : authReady ? (
              <>
                <span>Crie sua conta para salvar o progresso no celular e no computador.</span>
                <Link className="btn" href="/entrar">Entrar ou cadastrar</Link>
              </>
            ) : null
          ) : (
            <span>Progresso salvo neste aparelho.</span>
          )}
        </div>
      </aside>
      <main className="main"><div className="wrap">{children}</div></main>
      <nav className="tabbar" aria-label="Navegação">{links}</nav>
    </div>
  );
}

export function MobileTop({ title }: { title: string }) {
  const { state, user, cloud, authReady } = useStore();
  return (
    <div className="mtop">
      <div className="row" style={{ gap: 10 }}>
        <div className="brand-mark" aria-hidden="true"><Icon.shield size={18} /></div>
        <b style={{ fontFamily: "var(--font-display)" }}>{title}</b>
      </div>
      {cloud && authReady && !user
        ? <Link className="chip" href="/entrar">Entrar</Link>
        : <span className="chip">{TARGETS[state.target].short}</span>}
    </div>
  );
}
