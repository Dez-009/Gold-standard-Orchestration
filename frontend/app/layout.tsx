// Root application layout wrapping all pages
import "../styles/globals.css";
import type { ReactNode } from "react";
// Notes: Bring in the ToastProvider to enable global notifications
import { ToastProvider } from "../components/ToastProvider";

// Layout component wrapping all pages
export default function RootLayout({ children }: { children: ReactNode }) {
  // Notes: Wrap every page with the ToastProvider so toasts work globally
  return (
    <html lang="en">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
