// Root application layout wrapping all pages
import "../styles/globals.css";
import type { ReactNode } from "react";

// Layout component wrapping all pages
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
