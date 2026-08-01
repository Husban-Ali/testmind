import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BuildCraft - Award-Winning Construction Company",
  description: "From concept to completion, we deliver exceptional construction services backed by 25+ years of excellence.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
