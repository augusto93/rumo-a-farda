import { SUBJ, pct } from "@/lib/catalog";
import type { SubjectId } from "@/lib/types";

export function SubjChip({ s }: { s: SubjectId }) {
  return <span className="chip"><span className="dot" style={{ background: SUBJ[s].color }} />{SUBJ[s].short}</span>;
}
export function Bar({ value, color }: { value: number; color?: string }) {
  return <div className="bar" aria-hidden="true"><i style={{ width: value + "%", background: color }} /></div>;
}
export function BreakRow({ s, c, t, showPct }: { s: SubjectId; c: number; t: number; showPct?: boolean }) {
  return (
    <div className="bd-row">
      <span className="row" style={{ gap: 8, flexWrap: "nowrap", minWidth: 0 }}>
        <span className="dot" style={{ background: SUBJ[s].color }} />
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{SUBJ[s].short}</span>
      </span>
      <Bar value={pct(c, t)} color={SUBJ[s].color} />
      <b className="num" style={{ textAlign: "right" }}>{showPct ? pct(c, t) + "%" : `${c}/${t}`}</b>
    </div>
  );
}
export const scoreColor = (p: number) => (p >= 70 ? "var(--ok)" : p >= 50 ? "var(--accent)" : "var(--bad)");
