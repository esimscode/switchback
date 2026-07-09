import { Badge } from "@/components/ui/badge";
import type { FitClassification } from "@/generated/prisma/enums";
import { FIT_CLASSIFICATION_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";

// DESIGN.md pastel blocks carry the fit signal — black ink on every surface.
const FIT_STYLES: Record<FitClassification, string> = {
  STRONG_FIT: "bg-block-lime text-black",
  STRETCH_FIT: "bg-block-mint text-black",
  BRIDGE_ROLE: "bg-block-cream text-black",
  NOT_WORTH_IT: "bg-block-pink text-black",
};

export function FitBadge({
  fit,
  className,
}: {
  fit: FitClassification;
  className?: string;
}) {
  return (
    <Badge className={cn(FIT_STYLES[fit], className)}>
      {FIT_CLASSIFICATION_LABELS[fit]}
    </Badge>
  );
}
