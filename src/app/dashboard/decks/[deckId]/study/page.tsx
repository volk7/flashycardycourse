import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { FlashcardStudy } from "@/components/study/flashcard-study";
import { Button } from "@/components/ui/button";
import { getOwnedDeckWithCards } from "@/lib/decks";

type StudyPageProps = {
  params: Promise<{ deckId: string }>;
};

export default async function StudyPage({ params }: StudyPageProps) {
  const { userId } = await auth();

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

  const cards = deck.cards.map((card) => ({
    id: card.id,
    front: card.front,
    back: card.back,
  }));

  return (
    <div className="flex flex-col flex-1 p-8 max-w-5xl mx-auto w-full gap-8">
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" asChild className="self-start -ml-2">
          <Link href={`/dashboard/decks/${deck.id}`}>← Back to deck</Link>
        </Button>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Study</h1>
          <p className="text-muted-foreground mt-1">{deck.title}</p>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="border rounded-xl p-8 text-center text-muted-foreground">
          <p>This deck has no cards yet.</p>
          <Button variant="outline" size="sm" asChild className="mt-4">
            <Link href={`/dashboard/decks/${deck.id}`}>Add cards to study</Link>
          </Button>
        </div>
      ) : (
        <FlashcardStudy cards={cards} deckTitle={deck.title} />
      )}
    </div>
  );
}
