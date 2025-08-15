import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "File Converter",
  description: "Ad-free file converter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex items-center justify-center h-screen">
        {children}
      </body>
    </html>
  );
}
