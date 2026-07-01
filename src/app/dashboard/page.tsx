import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { PlanBadge } from "@/components/billing/plan-badge";
import { CreateDeckDialog } from "@/components/decks/create-deck-dialog";
import { DeckLimitNotice } from "@/components/decks/deck-limit-notice";
import { DeckList } from "@/components/decks/deck-list";
import { db } from "@/db";
import { decksTable } from "@/db/schema";
import { FREE_DECK_LIMIT } from "@/lib/decks";

export default async function DashboardPage() {
  const { userId, has } = await auth.protect();

  const decksWithCards = await db.query.decksTable.findMany({
    where: eq(decksTable.userId, userId),
    with: { cards: true },
    orderBy: (decks, { desc }) => [desc(decks.updatedAt)],
  });

  const deckCount = decksWithCards.length;
  const isPro = has({ plan: "pro" });
  const hasUnlimitedDecks = has({ feature: "unlimited_decks" });
  const canCreateDeck = hasUnlimitedDecks || deckCount < FREE_DECK_LIMIT;
  const cardCount = decksWithCards.reduce(
    (total, deck) => total + deck.cards.length,
    0,
  );

  const decks = decksWithCards.map((deck) => ({
    id: deck.id,
    title: deck.title,
    description: deck.description,
    cardCount: deck.cards.length,
  }));

  return (
    <div className="flex flex-col flex-1 p-8 max-w-5xl mx-auto w-full gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <PlanBadge isPro={isPro} deckCount={deckCount} />
          </div>
          <p className="text-muted-foreground mt-1">
            Here&apos;s an overview of your flashcard activity.
          </p>
        </div>
        <CreateDeckDialog canCreateDeck={canCreateDeck} />
      </div>

      {!hasUnlimitedDecks && <DeckLimitNotice deckCount={deckCount} />}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Decks"
          value={String(deckCount)}
          description={
            deckCount === 0
              ? "No decks yet"
              : `${deckCount} deck${deckCount === 1 ? "" : "s"}`
          }
        />
        <StatCard
          label="Cards"
          value={String(cardCount)}
          description={
            cardCount === 0
              ? "No cards yet"
              : `${cardCount} card${cardCount === 1 ? "" : "s"}`
          }
        />
        <StatCard label="Study streak" value="0" description="Days in a row" />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-semibold text-lg">Your decks</h2>
        <DeckList decks={decks} />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="border rounded-xl p-5 flex flex-col gap-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-3xl font-semibold">{value}</span>
      <span className="text-xs text-muted-foreground">{description}</span>
    </div>
  );
}
