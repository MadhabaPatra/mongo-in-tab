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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      <div className="flex h-16 items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2">
            <Image src={"/logo.png"} width="32" height="32" alt="logo" />
            <span className="font-mono text-lg font-semibold">MongoInTab</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <GitHubStarButton
            owner="MadhabaPatra"
            repo="mongo-in-tab"
            className="cursor-pointer"
          />
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-transparent hover:text-primary"
            onClick={onClickSampleDatabase}
          >
            Try Sample
          </Button>
          <Link href="/app">
            <Button size="sm" className="">
              Go to App
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
