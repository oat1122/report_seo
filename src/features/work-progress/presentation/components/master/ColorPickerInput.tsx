"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ColorPickerInputProps {
  value: string | null | undefined;
  onChange: (next: string | null) => void;
  className?: string;
  disabled?: boolean;
}

const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;

export function ColorPickerInput({
  value,
  onChange,
  className,
  disabled,
}: ColorPickerInputProps) {
  const hex = value ?? "";
  const valid = !hex || HEX_PATTERN.test(hex);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <input
        type="color"
        value={valid && hex ? hex : "#cccccc"}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-9 w-12 cursor-pointer rounded-md border border-input bg-transparent disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="เลือกสี"
      />
      <Input
        value={hex}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === "" ? null : v);
        }}
        placeholder="#rrggbb"
        maxLength={7}
        disabled={disabled}
        aria-invalid={!valid}
        className={cn("font-mono", !valid && "border-destructive")}
      />
      {hex && !disabled && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onChange(null)}
          aria-label="ล้างสี"
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}
