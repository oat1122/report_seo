"use client";

import React from "react";
import { BarChart3, List, Lightbulb, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StickyNavigationProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

const navItems = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "top-keywords", label: "Top Keywords", icon: List },
  { id: "recommendations", label: "Recommendations", icon: Lightbulb },
  { id: "other-keywords", label: "Other Keywords", icon: MoreHorizontal },
];

export const StickyNavigation: React.FC<StickyNavigationProps> = ({
  activeSection,
  onNavigate,
}) => {
  return (
    <nav className="sticky top-20 z-10 mb-6 overflow-hidden rounded-2xl border border-border bg-background shadow-md">
      <div className="flex gap-2 overflow-x-auto bg-card p-3">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = activeSection === id;
          return (
            <Button
              key={id}
              variant={isActive ? "default" : "ghost"}
              onClick={() => onNavigate(id)}
              className={cn(
                "whitespace-nowrap",
                isActive
                  ? "bg-info text-info-foreground hover:bg-info/90"
                  : "text-muted-foreground",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Button>
          );
        })}
      </div>
    </nav>
  );
};
