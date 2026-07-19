"use client";

import { useState, useRef, useEffect } from "react";
import { Trash2, Server, Check, X, Pencil, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { StorageManager } from "@/lib/storage";
import { cn } from "@/lib/utils";

function timeAgo(date?: Date | string): string {
  if (!date) return "";
  const d = new Date(date);
  const seconds = Math.floor((new Date().getTime() - d.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ConnectionCard({
  connection,
  clearConnectionById,
  onNameUpdated,
}: {
  connection: IConnection;
  clearConnectionById: (id: string) => void;
  onNameUpdated?: () => void;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(connection.name || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const onClickConnect = () => {
    window.scrollTo(0, 0);
    router.push("/app/databases?connectionId=" + connection.id);
  };

  const onClickRemove = () => {
    clearConnectionById(connection.id);
  };

  const handleSaveName = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== connection.name) {
      StorageManager.updateConnectionName(connection.id, trimmed);
      onNameUpdated?.();
    } else {
      setEditName(connection.name || "");
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(connection.name || "");
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSaveName();
    if (e.key === "Escape") handleCancelEdit();
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    StorageManager.updateConnectionFavorite(
      connection.id,
      !connection.isFavorite,
    );
    onNameUpdated?.();
  };

  return (
    <div
      onClick={isEditing ? undefined : onClickConnect}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl border bg-card p-3.5",
        !isEditing && "cursor-pointer",
        connection.isFavorite
          ? "border-yellow-300 hover:border-yellow-400"
          : "border-border hover:border-primary/40",
        "hover:shadow-md hover:bg-primary/[0.02]",
        "active:scale-[0.99] transition-all duration-150",
      )}
    >
      {/* Icon */}
      <div className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
        <Server className="h-4 w-4 text-primary" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-1.5">
            <Input
              ref={inputRef}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSaveName}
              onClick={(e) => e.stopPropagation()}
              className="h-7 text-sm px-2 py-0"
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                handleSaveName();
              }}
            >
              <Check className="h-3.5 w-3.5 text-green-600" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                handleCancelEdit();
              }}
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        ) : (
          <h3 className="font-mono font-medium text-sm text-foreground group-hover:text-primary transition-colors break-words leading-snug">
            {connection.name || "Unnamed Connection"}
          </h3>
        )}

        {!isEditing && connection.lastUsed && (
          <span className="text-[10px] text-muted-foreground/70 mt-0.5 block">
            Last used {timeAgo(connection.lastUsed)}
          </span>
        )}

        {/* Connect cue below timestamp */}
        {!isEditing && (
          <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-150 mt-0.5 block">
            Connect →
          </span>
        )}
      </div>

      {/* Actions on hover */}
      {!isEditing && (
        <div className="hidden group-hover:flex items-center gap-1 shrink-0">
          {/* Favorite toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFavorite}
            className={cn(
              "h-6 w-6 rounded-md",
              connection.isFavorite
                ? "text-yellow-500 hover:text-yellow-600 hover:bg-yellow-500/10"
                : "text-muted-foreground hover:text-yellow-500 hover:bg-yellow-500/10",
            )}
            aria-label={connection.isFavorite ? "Unfavorite" : "Favorite"}
          >
            <Star
              className={cn(
                "h-3 w-3",
                connection.isFavorite && "fill-yellow-500",
              )}
            />
          </Button>

          {/* Edit */}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="h-6 w-6 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10"
            aria-label="Edit name"
          >
            <Pencil className="h-3 w-3" />
          </Button>

          {/* Delete */}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onClickRemove();
            }}
            className="h-6 w-6 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            aria-label="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
