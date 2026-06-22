import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";

import { cardsTable, decksTable } from "./db/schema";

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
  const [deck] = await db
    .insert(decksTable)
    .values({
      userId: "user_example",
      title: "Indonesian from English",
      description: "Basic vocabulary",
    })
    .returning();

  await db.insert(cardsTable).values([
    { deckId: deck.id, front: "Dog", back: "Anjing" },
    { deckId: deck.id, front: "Cat", back: "Kucing" },
  ]);

  console.log("Sample deck and cards created!");

  const decksWithCards = await db.query.decksTable.findMany({
    with: { cards: true },
    where: eq(decksTable.userId, "user_example"),
  });
  console.log("Decks with cards:", decksWithCards);

  await db.delete(decksTable).where(eq(decksTable.id, deck.id));
  console.log("Sample deck deleted (cards cascade)!");
}

main();
