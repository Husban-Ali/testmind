import type { Metadata } from "next";
import "./globals.css";
import ResponsiveAppBar from "./component/ResponsiveAppBar";
import Footer from "./component/Footer";

export const metadata: Metadata = {
  title: "BuildCraft - Award-Winning Construction Company",
  description: "From concept to completion, we deliver exceptional construction services backed by 25+ years of excellence.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
      <ResponsiveAppBar />  
        {children}
        <Footer />
        </body>
    </html>
  );
}
