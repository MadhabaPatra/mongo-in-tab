import type { Metadata } from "next";
import "./globals.css";
import { JetBrains_Mono } from "next/font/google";

export const metadata: Metadata = {
  title: "MongoInTab",
  description:
    "a web-based tool that allows you to connect to and browse your MongoDB databases directly from your browser.",
  authors: {
    url: "https://madhabapatra.com",
    name: "Madhaba Patra",
  },
};

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jetbrainsMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
