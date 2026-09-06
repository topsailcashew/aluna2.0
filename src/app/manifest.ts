import type { MetadataRoute } from "next";

/**
 * Installed-app identity. `background_color` paints the cold-start splash behind
 * the icon; keeping it the light canvas means no dark flash before the app
 * itself paints. Icons include a maskable full-bleed variant for Android.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aluna",
    short_name: "Aluna",
    description: "Notice, name, and track how you feel.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#eef3f0",
    theme_color: "#eef3f0",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
