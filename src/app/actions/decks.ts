"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { decksTable } from "@/db/schema";
import { FREE_DECK_LIMIT, getOwnedDeck, getUserDeckCount } from "@/lib/decks";

const createDeckSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  description: z.string().trim().max(2000).optional(),
});

const updateDeckSchema = z.object({
  deckId: z.number().int().positive(),
  title: z.string().trim().min(1, "Title is required").max(255),
  description: z.string().trim().max(2000).optional(),
});

const deleteDeckSchema = z.object({
  deckId: z.number().int().positive(),
});

type CreateDeckInput = z.infer<typeof createDeckSchema>;
type UpdateDeckInput = z.infer<typeof updateDeckSchema>;
type DeleteDeckInput = z.infer<typeof deleteDeckSchema>;

export async function createDeck(input: CreateDeckInput) {
  const { userId, has } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { title, description } = createDeckSchema.parse(input);

  if (!has({ feature: "unlimited_decks" })) {
    const deckCount = await getUserDeckCount(userId);
    if (deckCount >= FREE_DECK_LIMIT) {
      throw new Error(
        `Free plan allows up to ${FREE_DECK_LIMIT} decks. Upgrade to Pro for unlimited decks.`,
      );
    }
  }

  await db.insert(decksTable).values({
    title,
    description: description || null,
    userId,
  });

  revalidatePath("/dashboard");
}

export async function updateDeck(input: UpdateDeckInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { deckId, title, description } = updateDeckSchema.parse(input);

  const deck = await getOwnedDeck(deckId, userId);
  if (!deck) throw new Error("Deck not found");

  await db
    .update(decksTable)
    .set({
      title,
      description: description || null,
      updatedAt: new Date(),
    })
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)));

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/decks/${deckId}`);
}

export async function deleteDeck(input: DeleteDeckInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { deckId } = deleteDeckSchema.parse(input);

  const deck = await getOwnedDeck(deckId, userId);
  if (!deck) throw new Error("Deck not found");

  await db
    .delete(decksTable)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)));

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
