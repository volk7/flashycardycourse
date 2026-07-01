import { InfoIcon } from "lucide-react";
import Link from "next/link";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FREE_DECK_LIMIT } from "@/lib/decks";

type DeckLimitNoticeProps = {
  deckCount: number;
};

export function DeckLimitNotice({ deckCount }: DeckLimitNoticeProps) {
  const atLimit = deckCount >= FREE_DECK_LIMIT;
  const remaining = FREE_DECK_LIMIT - deckCount;

  const title = atLimit
    ? `Deck limit reached (${deckCount}/${FREE_DECK_LIMIT})`
    : `Using ${deckCount} of ${FREE_DECK_LIMIT} decks`;

  const description = atLimit
    ? "You've used all decks included on the Free plan. Upgrade to Pro for unlimited decks and AI flashcard generation."
    : deckCount === 0
      ? `The Free plan includes up to ${FREE_DECK_LIMIT} decks. Upgrade to Pro for unlimited decks and AI flashcard generation.`
      : `You have ${remaining} deck${remaining === 1 ? "" : "s"} remaining on the Free plan. Upgrade to Pro for unlimited decks and AI flashcard generation.`;

  return (
    <Alert
      className={
        atLimit ? "border-amber-500/50 bg-amber-500/5" : "border-border bg-muted/40"
      }
    >
      <InfoIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
      <AlertAction>
        <Button size="sm" variant={atLimit ? "default" : "outline"} asChild>
          <Link href="/pricing">Upgrade to Pro</Link>
        </Button>
      </AlertAction>
    </Alert>
  );
}
