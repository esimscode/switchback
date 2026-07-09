import { cn } from "@/lib/utils";

// The Switchback mark: a serpentine trail — two hairpin turns climbing
// bottom-left to top-right — that reads as an S. Drawn in currentColor so
// it is ink-on-canvas in light mode and white-on-black in dark mode.
// Brand rule (docs/brand.md): never recolor, outline, or rotate the mark;
// color is placement (e.g. a lime ground), never a fill on the mark itself.
export function SwitchbackMark({
  className,
  strokeWidth = 11,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      className={cn("size-5", className)}
    >
      <path
        d="M 12 88 L 62 88 C 84 88 84 57 62 57 L 38 57 C 16 57 16 26 38 26 L 88 26"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Horizontal lockup: mark + lowercase wordmark.
export function SwitchbackLogo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <SwitchbackMark className="size-5" strokeWidth={13} />
      <span className="text-sm font-semibold tracking-tight">switchback</span>
    </span>
  );
}
