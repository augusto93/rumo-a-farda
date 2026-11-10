"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { fmtDate, fmtTime, pct } from "@/lib/catalog";
import { Icon } from "./Icons";
import { scoreColor } from "./ui";

export function History({ max }: { max: number }) {
  const { state } = useStore();
  const h = state.history.slice(0, max);
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="sec-head">
        <h2>Últimos simulados</h2>
        {state.history.length > max && <Link className="btn ghost" href="/desempenho">Ver todos <Icon.right /></Link>}
      </div>
      {h.length ? (
        <div className="hist">
          {h.map(x => (
            <div key={x.at} className="hist-row">
              <div style={{ minWidth: 0 }}><b>{x.title}</b><div className="muted" style={{ fontSize: ".82rem" }}>{fmtDate(x.at)} · {fmtTime(x.secs)}</div></div>
              <span className="num muted">{x.c}/{x.n}</span>
              <b className="num" style={{ color: scoreColor(pct(x.c, x.n)) }}>{pct(x.c, x.n)}%</b>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty"><b>Nenhum simulado feito ainda</b><span>Os resultados aparecem aqui para você acompanhar a evolução.</span></div>
      )}
    </section>
  );
}
