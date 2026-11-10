import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rumo à Farda — PMERJ e Guarda de Maricá",
    short_name: "Rumo à Farda",
    description: "Aulas e simulados aleatórios para concursos policiais.",
    start_url: "/",
    display: "standalone",
    background_color: "#F3F6F5",
    theme_color: "#2F5D7C",
    lang: "pt-BR",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
    ]
  };
}
