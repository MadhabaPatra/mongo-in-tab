import { Button } from "@/components/ui/button";
import { Database, ExternalLink, Star } from "lucide-react";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      <div className="flex h-16 items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            <span className="font-mono text-lg font-semibold">
              Mongo_in_tab
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer hover:bg-transparent hover:text-primary flex items-center gap-2"
            asChild
          >
            <a
              href="https://github.com/MadhabaPatra/mongo-in-tab"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Star className="h-4 w-4" />
              <span className="text-sm font-medium">1.2k</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-transparent hover:text-primary"
          >
            Try Sample
          </Button>
          <Button size="sm" className="">
            Go to App
          </Button>
        </div>
      </div>
    </header>
  );
}
