import { CardFormDialog } from "@/components/cards/card-form-dialog";
import { DeleteCardButton } from "@/components/cards/delete-card-button";
import { Button } from "@/components/ui/button";

type CardListProps = {
  deckId: number;
  cards: {
    id: number;
    front: string;
    back: string;
  }[];
};

export function CardList({ deckId, cards }: CardListProps) {
  if (cards.length === 0) {
    return (
      <div className="border rounded-xl p-8 text-center text-muted-foreground">
        No cards in this deck yet. Add your first card to get started.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {cards.map((card) => (
        <div
          key={card.id}
          className="border rounded-xl p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
        >
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Front
              </p>
              <p className="mt-1 whitespace-pre-wrap">{card.front}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Back
              </p>
              <p className="mt-1 whitespace-pre-wrap">{card.back}</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <CardFormDialog
              deckId={deckId}
              card={card}
              trigger={
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              }
            />
            <DeleteCardButton deckId={deckId} cardId={card.id} />
          </div>
        </div>
      ))}
    </div>
  );
}
