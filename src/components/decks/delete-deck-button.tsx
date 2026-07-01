"use client";

import { useTransition } from "react";
import { deleteDeck } from "@/app/actions/decks";
import { Button } from "@/components/ui/button";

type DeleteDeckButtonProps = {
  deckId: number;
  deckTitle: string;
};

export function DeleteDeckButton({ deckId, deckTitle }: DeleteDeckButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (
      !confirm(
        `Delete "${deckTitle}"? This will permanently remove the deck and all its cards.`,
      )
    ) {
      return;
    }

    startTransition(async () => {
      await deleteDeck({ deckId });
    });
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={isPending}
    >
      {isPending ? "Deleting..." : "Delete"}
    </Button>
  );
}
