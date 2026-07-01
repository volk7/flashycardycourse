import Link from "next/link";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DeleteDeckButton } from "@/components/decks/delete-deck-button";
import { EditDeckDialog } from "@/components/decks/edit-deck-dialog";

type DeckListProps = {
  decks: {
    id: number;
    title: string;
    description: string | null;
    cardCount: number;
  }[];
};

export function DeckList({ decks }: DeckListProps) {
  if (decks.length === 0) {
    return (
      <div className="border rounded-xl p-8 text-center text-muted-foreground">
        No decks yet. Create your first deck to get started.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {decks.map((deck) => (
        <Card key={deck.id}>
          <CardHeader>
            <CardTitle>
              <Link
                href={`/dashboard/decks/${deck.id}`}
                className="hover:underline"
              >
                {deck.title}
              </Link>
            </CardTitle>
            {deck.description && (
              <CardDescription>{deck.description}</CardDescription>
            )}
            <CardAction className="flex gap-2">
              <EditDeckDialog deck={deck} />
              <DeleteDeckButton deckId={deck.id} deckTitle={deck.title} />
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {deck.cardCount} card{deck.cardCount === 1 ? "" : "s"}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
