import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { decksTable } from "@/db/schema";

export const FREE_DECK_LIMIT = 3;

export async function getUserDeckCount(userId: string) {
  const decks = await db
    .select({ id: decksTable.id })
    .from(decksTable)
    .where(eq(decksTable.userId, userId));

  return decks.length;
}

export async function getOwnedDeck(deckId: number, userId: string) {
  const [deck] = await db
    .select()
    .from(decksTable)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)));

  return deck ?? null;
}

export async function getOwnedDeckWithCards(deckId: number, userId: string) {
  const deck = await db.query.decksTable.findFirst({
    where: and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)),
    with: {
      cards: {
        orderBy: (cards, { desc }) => [desc(cards.updatedAt)],
      },
    },
  });

  return deck ?? null;
}
