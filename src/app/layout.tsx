import type { Metadata, Viewport } from "next";
import { Sora, Atkinson_Hyperlegible } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { Shell } from "@/components/Shell";

const sora = Sora({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--ff-sora", display: "swap" });
const atk = Atkinson_Hyperlegible({ subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"], variable: "--ff-atk", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Rumo à Farda", template: "%s · Rumo à Farda" },
  description: "Aulas, simulados aleatórios e desempenho para os concursos da PMERJ e da Guarda Municipal de Maricá.",
  applicationName: "Rumo à Farda",
  appleWebApp: { capable: true, title: "Rumo à Farda", statusBarStyle: "default" }
};
export const viewport: Viewport = { themeColor: "#F3F6F5", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${sora.variable} ${atk.variable}`}>
      <body>
        <StoreProvider><Shell>{children}</Shell></StoreProvider>
      </body>
    </html>
  );
}
