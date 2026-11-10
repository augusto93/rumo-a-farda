const p = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
export const Icon = {
  home: () => <svg viewBox="0 0 24 24" {...p}><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /></svg>,
  book: () => <svg viewBox="0 0 24 24" {...p}><path d="M4 19.5V5a2 2 0 0 1 2-2h14v16H6.5A2.5 2.5 0 0 0 4 21.5v-2Z" /><path d="M8 7h8M8 11h6" /></svg>,
  exam: () => <svg viewBox="0 0 24 24" {...p}><rect x="5" y="3" width="14" height="18" rx="2" /><path d="m9 9 1.5 1.5L13 8M9 15h6" /></svg>,
  chart: () => <svg viewBox="0 0 24 24" {...p}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>,
  play: () => <svg viewBox="0 0 24 24" fill="#2F5D7C"><path d="M7 4.5v15l13-7.5z" /></svg>,
  check: () => <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-10" /></svg>,
  left: () => <svg viewBox="0 0 24 24" {...p}><path d="M15 18 9 12l6-6" /></svg>,
  right: () => <svg viewBox="0 0 24 24" {...p}><path d="m9 18 6-6-6-6" /></svg>,
  clock: () => <svg viewBox="0 0 24 24" width={18} height={18} {...p}><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2M9 2h6" /></svg>,
  shuffle: () => <svg viewBox="0 0 24 24" {...p}><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" /></svg>,
  shield: ({ size = 20 }: { size?: number }) => <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="#F4F8FA" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" /><path d="m9 12 2 2 4-4" /></svg>
};
