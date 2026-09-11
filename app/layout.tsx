import type { Metadata } from "next";
import "@fontsource/space-mono/400.css";
import "@fontsource/space-mono/700.css";
import "@fontsource/silkscreen/400.css";
import "./globals.css";
export const metadata: Metadata = {
  title: "democracy.exe — An experiment in choosing",
  description:
    "100 students. Three candidates. One impossible question. An interactive school election exploring voting systems and Arrow’s impossibility theorem.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
