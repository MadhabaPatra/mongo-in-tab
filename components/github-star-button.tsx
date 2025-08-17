"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, ExternalLink } from "lucide-react";

interface GitHubStarButtonProps {
  owner: string;
  repo: string;
  className?: string;
}

interface GitHubRepo {
  stargazers_count: number;
}

export function GitHubStarButton({
  owner,
  repo,
  className,
}: GitHubStarButtonProps) {
  const [stars, setStars] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchStars = async () => {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}`,
          {
            headers: {
              Accept: "application/vnd.github.v3+json",
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch repository data");
        }

        const data: GitHubRepo = await response.json();
        setStars(data.stargazers_count);
      } catch (err) {
        console.error("Error fetching GitHub stars:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStars();
  }, [owner, repo]);

  const formatStarCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const repoUrl = `https://github.com/${owner}/${repo}`;

  if (loading) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={`cursor-default flex items-center gap-2 ${className}`}
        disabled
      >
        <Star className="h-4 w-4" />
        <Skeleton className="h-4 w-8" />
        <ExternalLink className="h-3 w-3" />
      </Button>
    );
  }

  if (error || stars === null) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={`hover:bg-transparent hover:text-primary flex items-center gap-2 ${className}`}
        asChild
      >
        <a href={repoUrl} target="_blank" rel="noopener noreferrer">
          <Star className="h-4 w-4" />
          <span>Star</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`hover:bg-transparent hover:text-primary flex items-center gap-2 ${className}`}
      asChild
    >
      <a href={repoUrl} target="_blank" rel="noopener noreferrer">
        <Star className="h-4 w-4" />
        <span>{formatStarCount(stars)}</span>
        <ExternalLink className="h-3 w-3" />
      </a>
    </Button>
  );
}
