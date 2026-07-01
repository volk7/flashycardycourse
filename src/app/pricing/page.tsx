import { PricingTable } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | FlashyCardy",
  description: "Choose the plan that fits your flashcard study needs.",
};

export default function PricingPage() {
  return (
    <div className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="mx-auto w-full max-w-3xl flex flex-col gap-8">
        <div className="text-center flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Pricing</h1>
          <p className="text-muted-foreground">
            Start free with up to 3 decks, or upgrade to Pro for unlimited decks
            and AI flashcard generation.
          </p>
        </div>
        <PricingTable />
      </div>
    </div>
  );
}
