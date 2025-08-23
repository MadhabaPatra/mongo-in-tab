"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Heart, Search, Zap } from "lucide-react";

interface Supporter {
  displayName: string;
  profileHandle: string;
  profilePicture: string;
}

export default function PeerlistSupportersPage() {
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSupporters();
  }, []);

  const fetchSupporters = async () => {
    try {
      const response = await fetch("/api/peerlist-supporters");

      if (!response.ok) {
        throw new Error("Failed to fetch supporters");
      }

      const data = await response.json();

      setSupporters(data?.data?.upvotes || []);
    } catch (err) {
      setSupporters([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSupporters = supporters.filter((supporter) => {
    const query = searchQuery.toLowerCase();
    return (
      supporter.displayName.toLowerCase().includes(query) ||
      supporter.profileHandle.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-20 max-w-6xl">
          <div className="text-center mb-16">
            <Skeleton className="h-10 w-72 mx-auto mb-4" />
            <Skeleton className="h-5 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <Skeleton className="w-20 h-20 rounded-full mb-3" />
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-20 max-w-6xl">
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <img
              src="https://dqy38fnwh4fqs.cloudfront.net/UHR8A9Q68ARA6DRIANGBK8GEDA6L/projects/mongointab--effortless-mongodb-browser-clientgithuba02e0264-133a-4eeb-b532-3a1ab2d07863"
              alt="MongoInTab"
              className="object-cover bg-gray-100 rounded-lg w-24 h-24 border border-gray-200 shrink-0"
            />
            <div className="group absolute -top-3 -left-3">
              <img
                src="https://dqy38fnwh4fqs.cloudfront.net/website/spotlight/staff-pick-light.png"
                width="52"
                height="52"
                alt="Staff Pick"
                className="cursor-pointer"
              />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-black text-white text-xs font-medium px-2 py-1 rounded whitespace-nowrap">
                  Staff Picked
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black"></div>
                </div>
              </div>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Our Peerlist Supporters
          </h1>
          <p className="text-muted-foreground mb-8">
            Thank you for your support! 💚
          </p>

          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search supporters by name or handle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
            />
          </div>
        </div>

        {filteredSupporters.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No supporters found matching "{searchQuery}"
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {filteredSupporters.map((supporter, index) => (
            <a
              key={index}
              href={`https://peerlist.io/${supporter.profileHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center text-center hover:scale-105 transition-transform duration-200"
            >
              <div className="relative mb-3">
                <img
                  src={
                    supporter?.profilePicture ||
                    "https://peerlist.io/images/emptyDP.png"
                  }
                  alt={supporter.displayName}
                  className="w-20 h-20 rounded-full object-cover ring-2 ring-border group-hover:ring-primary transition-colors"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-background rounded-full flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-yellow-500 fill-yello-500" />
                </div>
              </div>
              <h3 className="font-medium text-sm mb-0.5 group-hover:text-primary transition-colors">
                {supporter.displayName}
              </h3>
              <p className="text-xs text-muted-foreground">
                @{supporter.profileHandle}
              </p>
            </a>
          ))}
        </div>

        <div className="mt-20 text-center">
          <div className="inline-flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Want to show your support?
            </p>
            <a
              href="https://peerlist.io/madhabapatra/project/mongointab"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <Heart className="w-4 h-4" />
              Support on Peerlist
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
