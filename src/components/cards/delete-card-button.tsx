"use client";

import { useTransition } from "react";
import { deleteCard } from "@/app/actions/cards";
import { Button } from "@/components/ui/button";

type DeleteCardButtonProps = {
  deckId: number;
  cardId: number;
};

export function DeleteCardButton({ deckId, cardId }: DeleteCardButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this card? This action cannot be undone.")) {
      return;
    }

    startTransition(async () => {
      await deleteCard({ deckId, cardId });
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
