import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Music Master",
  description: "Step-by-step guitar learning and music source tools",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
