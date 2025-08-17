import type { Metadata } from "next";
import "./globals.css";
import { JetBrains_Mono } from "next/font/google";

export const metadata: Metadata = {
  title: "MongoInTab – Effortless MongoDB Browser Client",
  description:
    "MongoInTab lets you securely connect, view, and manage your MongoDB databases right in your browser. No downloads, no setup—fast, private, and easy MongoDB access for everyone.",
  authors: {
    url: "https://madhabapatra.com",
    name: "Madhaba Patra",
  },
  keywords: [
    "MongoDB",
    "browser client",
    "database management",
    "MongoDB viewer",
    "web-based MongoDB tool",
    "NoSQL management",
    "MongoDB GUI",
    "secure database access",
    "local storage MongoDB",
    "online database client",
  ],
  openGraph: {
    title: "MongoInTab – Effortless MongoDB Browser Client",
    description:
      "Instantly connect and manage your MongoDB—all in your browser. No downloads, no data leaves your device. Simple, private, and powerful.",
    url: "https://mongointab.app",
    type: "website",
    images: [
      {
        url: "https://mongointab.app/logo.png",
        width: 1200,
        height: 630,
        alt: "MongoInTab browser demo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MongoInTab – Effortless MongoDB Browser Client",
    description:
      "Connect, browse, edit, and export your MongoDB databases—right in your browser.",
    site: "@GMadhabananda",
    images: ["https://mongointab.app/logo.png"],
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
