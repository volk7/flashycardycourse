import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CardFormDialog } from "@/components/cards/card-form-dialog";
import { CardList } from "@/components/cards/card-list";
import { GenerateCardsWithAiButton } from "@/components/cards/generate-cards-with-ai-button";
import { DeleteDeckButton } from "@/components/decks/delete-deck-button";
import { EditDeckDialog } from "@/components/decks/edit-deck-dialog";
import { Button } from "@/components/ui/button";
import { getOwnedDeckWithCards } from "@/lib/decks";

type DeckPageProps = {
  params: Promise<{ deckId: string }>;
};

export default async function DeckPage({ params }: DeckPageProps) {
  const { userId, has } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { deckId: deckIdParam } = await params;
  const deckId = Number(deckIdParam);

  if (!Number.isInteger(deckId) || deckId <= 0) {
    notFound();
  }

  const deck = await getOwnedDeckWithCards(deckId, userId);

  if (!deck) {
    notFound();
  }

  const canUseAi = has({ feature: "ai_flashcard_generation" });

  return (
    <div className="flex flex-col flex-1 p-8 max-w-5xl mx-auto w-full gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <Button variant="ghost" size="sm" asChild className="self-start -ml-2">
            <Link href="/dashboard">← Back to dashboard</Link>
          </Button>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{deck.title}</h1>
            {deck.description && (
              <p className="text-muted-foreground mt-1">{deck.description}</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {deck.cards.length > 0 ? (
            <Button size="sm" asChild>
              <Link href={`/dashboard/decks/${deck.id}/study`}>Study</Link>
            </Button>
          ) : (
            <Button size="sm" disabled>
              Study
            </Button>
          )}
          <EditDeckDialog deck={deck} />
          <DeleteDeckButton deckId={deck.id} deckTitle={deck.title} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <h2 className="font-semibold text-lg">
          Cards ({deck.cards.length})
        </h2>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <GenerateCardsWithAiButton
            deckId={deck.id}
            deckTitle={deck.title}
            canUseAi={canUseAi}
            hasDescription={Boolean(deck.description?.trim())}
          />
          <CardFormDialog deckId={deck.id} />
        </div>
      </div>

      <CardList deckId={deck.id} cards={deck.cards} />
    </div>
  );
}
