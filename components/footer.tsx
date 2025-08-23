import { Database, Shield, Heart, Zap, Eye, Server } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 lg:gap-16">
          <div className="md:col-span-2 lg:col-span-2 space-y-4 sm:space-y-6">
            <Link href="/">
              <div className="flex items-center gap-2">
                <Image
                  src="/logo.png"
                  width={28}
                  height={28}
                  alt="logo"
                  className="sm:w-8 sm:h-8"
                />
                <span className="font-mono text-base sm:text-lg font-semibold">
                  MongoInTab
                </span>
              </div>
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-md pt-2 sm:pt-4 text-sm sm:text-base">
              Browse, explore, and manage your MongoDB databases with zero
              setup. Everything runs securely in your browser.
            </p>

            <div className="space-y-2 sm:space-y-3 flex flex-col pt-2">
              <a
                href="https://github.com/MadhabaPatra/mongo-in-tab"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-foreground hover:text-primary transition-colors group w-fit"
              >
                <svg
                  className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform"
                  role="img"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>GitHub</title>
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                Open Source
              </a>

              <a
                href="https://peerlist.io/madhabapatra/project/mongointab"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-foreground hover:text-primary transition-colors group w-fit"
              >
                <img
                  className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 rounded"
                  src="https://dqy38fnwh4fqs.cloudfront.net/company/COMHQ7BA9GLL7K8683MNBGDOG66PBN/logo-1695017827473.webp"
                  alt="Peerlist"
                  width="32"
                  height="32"
                />
                Featured on Peerlist
              </a>

              <p className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                Crafted with love in India
              </p>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <h3 className="font-mono font-bold text-base sm:text-lg flex items-center gap-2">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
              <span className="hidden sm:inline">100% Safe & Secure</span>
              <span className="sm:hidden">Safe & Secure</span>
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-xs sm:text-sm">
                    Instant Access
                  </p>
                  <p className="text-xs text-muted-foreground">
                    No accounts, no signups
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-xs sm:text-sm">
                    Privacy First
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Zero tracking, zero analytics
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <Server className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-xs sm:text-sm">
                    Client-Side Only
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Your data never leaves your browser
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <h3 className="font-mono font-bold text-base sm:text-lg">
              Get in Touch
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <p className="text-xs sm:text-sm font-medium mb-1">
                  Need Help?
                </p>
                <a
                  href="mailto:support@mongointab.app"
                  className="text-xs sm:text-sm text-primary hover:underline font-mono break-all"
                >
                  support@mongointab.app
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 sm:mt-12 lg:mt-16 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
          <p className="text-xs sm:text-sm text-muted-foreground font-mono text-center md:text-left">
            © 2025 MongoInTab • Built for developers.
          </p>
          <div className="flex gap-6 sm:gap-8 text-xs sm:text-sm">
            <a
              href="/privacy"
              className="text-muted-foreground hover:text-foreground transition-colors underline"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
