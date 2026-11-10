import Link from "next/link";
export default function NotFound() {
  return <div className="empty"><b>Página não encontrada</b><Link className="btn primary" href="/">Voltar ao início</Link></div>;
}
