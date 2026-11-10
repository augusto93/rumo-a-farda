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
  const { state, user, cloud, syncing, login, logout } = useStore();
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
                  <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{user.displayName}</span>
                </div>
                <span className="sync">{syncing ? "Sincronizando…" : "Progresso salvo na nuvem"}</span>
                <button className="btn ghost" style={{ minHeight: 34, padding: "4px 8px" }} onClick={logout}>Sair</button>
              </>
            ) : (
              <>
                <span>Entre para salvar seu progresso no celular e no computador.</span>
                <button className="btn" onClick={login}>Entrar com Google</button>
              </>
            )
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
  const { state, user, cloud, login } = useStore();
  return (
    <div className="mtop">
      <div className="row" style={{ gap: 10 }}>
        <div className="brand-mark" aria-hidden="true"><Icon.shield size={18} /></div>
        <b style={{ fontFamily: "var(--font-display)" }}>{title}</b>
      </div>
      {cloud && !user
        ? <button className="chip" style={{ border: 0, cursor: "pointer" }} onClick={login}>Entrar</button>
        : <span className="chip">{TARGETS[state.target].short}</span>}
    </div>
  );
}
