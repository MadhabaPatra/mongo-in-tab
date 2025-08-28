import type { Metadata } from "next";
import "./globals.css";
import { JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";

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
        <Toaster />
        <script
          data-name="BMC-Widget"
          data-cfasync="false"
          src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js"
          data-id="gmadhabananda"
          data-description="Support me on Buy me a coffee!"
          data-message="☕️ Love MongoInTab? Support development!"
          data-color="#FDDD04"
          data-position="Right"
          data-x_margin="18"
          data-y_margin="18"
        ></script>
        <script
          async
          src="https://cdn.seline.com/seline.js"
          data-token={process.env.SELINE_TOKEN}
        ></script>
      </body>
    </html>
  );
}
