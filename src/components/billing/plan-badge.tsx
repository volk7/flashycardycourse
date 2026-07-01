import { SparklesIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FREE_DECK_LIMIT } from "@/lib/decks";

type PlanBadgeProps = {
  isPro: boolean;
  deckCount: number;
};

export function PlanBadge({ isPro, deckCount }: PlanBadgeProps) {
  const deckLabel = isPro
    ? `${deckCount} deck${deckCount === 1 ? "" : "s"}`
    : `${deckCount}/${FREE_DECK_LIMIT} decks`;

  if (isPro) {
    return (
      <Badge className="border-primary/20 bg-primary/10 text-primary hover:bg-primary/10">
        <SparklesIcon />
        Pro · {deckLabel}
      </Badge>
    );
  }

  return <Badge variant="secondary">Free · {deckLabel}</Badge>;
}
