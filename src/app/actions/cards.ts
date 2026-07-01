"use server";

import { openai } from "@ai-sdk/openai";
import { auth } from "@clerk/nextjs/server";
import { generateText, NoObjectGeneratedError, Output } from "ai";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { cardsTable } from "@/db/schema";
import { getOwnedDeck } from "@/lib/decks";

const AI_GENERATED_CARD_COUNT = 20;

const flashcardSchema = z.object({
  front: z.string().describe("Question or term on the front of the card"),
  back: z.string().describe("Answer or definition on the back of the card"),
});

const flashcardsOutputSchema = z.object({
  cards: z
    .array(flashcardSchema)
    .length(AI_GENERATED_CARD_COUNT)
    .describe("The generated flashcards"),
});

const generateCardsWithAiSchema = z.object({
  deckId: z.number().int().positive(),
});

const createCardSchema = z.object({
  deckId: z.number().int().positive(),
  front: z.string().trim().min(1, "Front is required").max(5000),
  back: z.string().trim().min(1, "Back is required").max(5000),
});

const updateCardSchema = z.object({
  deckId: z.number().int().positive(),
  cardId: z.number().int().positive(),
  front: z.string().trim().min(1, "Front is required").max(5000),
  back: z.string().trim().min(1, "Back is required").max(5000),
});

const deleteCardSchema = z.object({
  deckId: z.number().int().positive(),
  cardId: z.number().int().positive(),
});

type CreateCardInput = z.infer<typeof createCardSchema>;
type UpdateCardInput = z.infer<typeof updateCardSchema>;
type DeleteCardInput = z.infer<typeof deleteCardSchema>;
type GenerateCardsWithAiInput = z.infer<typeof generateCardsWithAiSchema>;

function revalidateDeckCardPaths(deckId: number) {
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/decks/${deckId}`);
  revalidatePath(`/dashboard/decks/${deckId}/study`);
}

export async function createCard(input: CreateCardInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { deckId, front, back } = createCardSchema.parse(input);

  const deck = await getOwnedDeck(deckId, userId);
  if (!deck) throw new Error("Deck not found");

  await db.insert(cardsTable).values({ deckId, front, back });

  revalidateDeckCardPaths(deckId);
}

export async function updateCard(input: UpdateCardInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { deckId, cardId, front, back } = updateCardSchema.parse(input);

  const deck = await getOwnedDeck(deckId, userId);
  if (!deck) throw new Error("Deck not found");

  await db
    .update(cardsTable)
    .set({ front, back, updatedAt: new Date() })
    .where(and(eq(cardsTable.id, cardId), eq(cardsTable.deckId, deckId)));

  revalidateDeckCardPaths(deckId);
}

export async function deleteCard(input: DeleteCardInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { deckId, cardId } = deleteCardSchema.parse(input);

  const deck = await getOwnedDeck(deckId, userId);
  if (!deck) throw new Error("Deck not found");

  await db
    .delete(cardsTable)
    .where(and(eq(cardsTable.id, cardId), eq(cardsTable.deckId, deckId)));

  revalidateDeckCardPaths(deckId);
}

export async function generateCardsWithAi(input: GenerateCardsWithAiInput) {
  const { userId, has } = await auth();
  if (!userId) throw new Error("Unauthorized");

  if (!has({ feature: "ai_flashcard_generation" })) {
    throw new Error("Upgrade to Pro to generate flashcards with AI.");
  }

  const { deckId } = generateCardsWithAiSchema.parse(input);

  const deck = await getOwnedDeck(deckId, userId);
  if (!deck) throw new Error("Deck not found");

  const title = deck.title.trim();
  const description = deck.description?.trim();

  if (!title) {
    throw new Error("Add a deck title before generating cards with AI.");
  }

  if (!description) {
    throw new Error("Add a deck description before generating cards with AI.");
  }

  try {
    const { output } = await generateText({
      model: openai("gpt-4o-mini"),
      output: Output.object({
        name: "Flashcards",
        description: "A set of flashcards with front and back text",
        schema: flashcardsOutputSchema,
      }),
      prompt: `Generate exactly ${AI_GENERATED_CARD_COUNT} flashcards for a deck titled "${title}". Description: "${description}". Base the card content on the deck title and description. Each card must have a concise front and a clear back.`,
    });

    if (!output?.cards?.length) {
      throw new Error("AI did not return any flashcards. Please try again.");
    }

    await db.insert(cardsTable).values(
      output.cards.map((card) => ({
        deckId,
        front: card.front.trim(),
        back: card.back.trim(),
      })),
    );
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      throw new Error("AI failed to generate valid flashcards. Please try again.");
    }
    throw error;
  }

  revalidateDeckCardPaths(deckId);
}
