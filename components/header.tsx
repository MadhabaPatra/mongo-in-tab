"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GitHubStarButton } from "@/components/github-star-button";
import Image from "next/image";
import { StorageManager } from "@/lib/storage";
import { useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();
  const onClickSampleDatabase = () => {
    const connection = StorageManager.loadSampleConnection();

    router.push("/app/databases?connectionId=" + connection);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 sm:px-4 md:px-6">
      <div className="flex h-14 sm:h-16 items-center justify-between">
        {/* Logo Section */}
        <Link href="/" className="flex-shrink-0">
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

        {/* Navigation Section */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
          {/* GitHub Star Button - Desktop only */}
          <div className="hidden md:block">
            <GitHubStarButton
              owner="MadhabaPatra"
              repo="mongo-in-tab"
              className="cursor-pointer"
            />
          </div>

          {/* Try Sample Button */}
          <Button
            variant="ghost"
            size="sm"
            className="
              hover:bg-transparent hover:text-primary
              px-2 sm:px-3 md:px-4
              text-xs sm:text-sm
              h-8 sm:h-9
            "
            onClick={onClickSampleDatabase}
          >
            <span className="inline">Try Sample</span>
          </Button>

          {/* Go to App Button */}
          <Link href="/app">
            <Button
              size="sm"
              className="
                px-2 sm:px-3 md:px-4
                text-xs sm:text-sm
                h-8 sm:h-9
                min-w-[60px] sm:min-w-[80px]
              "
            >
              <span className="hidden sm:inline">Go to App</span>
              <span className="sm:hidden">App</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
