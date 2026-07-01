import { createClerkClient } from "@clerk/backend";
import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";

import { cardsTable, decksTable } from "../db/schema";

const db = drizzle(process.env.DATABASE_URL!);

async function resolveUserId(): Promise<string> {
  const fromArg = process.argv[2];
  if (fromArg) return fromArg;

  const fromEnv = process.env.SEED_USER_ID;
  if (fromEnv) return fromEnv;

  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "No user ID provided. Pass one as an argument, set SEED_USER_ID, or configure CLERK_SECRET_KEY to auto-detect the newest Clerk user.",
    );
  }

  const clerk = createClerkClient({ secretKey });
  const { data } = await clerk.users.getUserList({
    limit: 1,
    orderBy: "-created_at",
  });

  const newestUser = data[0];
  if (!newestUser) {
    throw new Error("No Clerk users found. Sign up first, then re-run the seed.");
  }

  console.log(`Using newest Clerk user: ${newestUser.id}`);
  return newestUser.id;
}

const spanishCards = [
  { front: "Hello", back: "Hola" },
  { front: "Goodbye", back: "Adiós" },
  { front: "Thank you", back: "Gracias" },
  { front: "Please", back: "Por favor" },
  { front: "Yes", back: "Sí" },
  { front: "No", back: "No" },
  { front: "Water", back: "Agua" },
  { front: "Food", back: "Comida" },
  { front: "House", back: "Casa" },
  { front: "Friend", back: "Amigo / Amiga" },
  { front: "Love", back: "Amor" },
  { front: "Morning", back: "Mañana" },
  { front: "Night", back: "Noche" },
  { front: "Book", back: "Libro" },
  { front: "Dog", back: "Perro" },
];

const britishHistoryCards = [
  {
    front: "Who was the first Tudor monarch?",
    back: "Henry VII",
  },
  {
    front: "In what year did William the Conqueror win the Battle of Hastings?",
    back: "1066",
  },
  {
    front: "Which king famously had six wives?",
    back: "Henry VIII",
  },
  {
    front:
      "What was the name of the civil war between the Royalists and Parliamentarians?",
    back: "The English Civil War",
  },
  {
    front: "Who was Prime Minister during most of World War II?",
    back: "Winston Churchill",
  },
  {
    front: "When did the Glorious Revolution take place?",
    back: "1688",
  },
  {
    front: "Which queen ruled during the Elizabethan era?",
    back: "Elizabeth I",
  },
  {
    front: "What document did King John sign in 1215?",
    back: "Magna Carta",
  },
  {
    front: "When did the Acts of Union unite England and Scotland?",
    back: "1707",
  },
  {
    front: 'Who was known as the "Iron Lady"?',
    back: "Margaret Thatcher",
  },
  {
    front: "What year did the Battle of Waterloo take place?",
    back: "1815",
  },
  {
    front: "What Roman name was given to Britain?",
    back: "Britannia",
  },
  {
    front: "Who founded the Church of England?",
    back: "Henry VIII",
  },
  {
    front: "When did the Great Fire of London occur?",
    back: "1666",
  },
  {
    front: "What was the plague epidemic of 1665–1666 called?",
    back: "The Great Plague",
  },
];

async function main() {
  const userId = await resolveUserId();

  const deleted = await db
    .delete(decksTable)
    .where(eq(decksTable.userId, userId))
    .returning();

  if (deleted.length > 0) {
    console.log(`Removed ${deleted.length} existing deck(s) for user ${userId}`);
  }

  const [spanishDeck] = await db
    .insert(decksTable)
    .values({
      userId,
      title: "English to Spanish",
      description: "Common English words with their Spanish translations",
    })
    .returning();

  await db.insert(cardsTable).values(
    spanishCards.map((card) => ({
      deckId: spanishDeck.id,
      ...card,
    })),
  );

  const [historyDeck] = await db
    .insert(decksTable)
    .values({
      userId,
      title: "British History",
      description: "Questions and answers about key events and figures in British history",
    })
    .returning();

  await db.insert(cardsTable).values(
    britishHistoryCards.map((card) => ({
      deckId: historyDeck.id,
      ...card,
    })),
  );

  console.log("Created decks:");
  console.log(`  - ${spanishDeck.title} (id: ${spanishDeck.id}, ${spanishCards.length} cards)`);
  console.log(
    `  - ${historyDeck.title} (id: ${historyDeck.id}, ${britishHistoryCards.length} cards)`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
