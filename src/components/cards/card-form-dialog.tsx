"use client";

import { useState, useTransition } from "react";
import { createCard, updateCard } from "@/app/actions/cards";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CardFormDialogProps = {
  deckId: number;
  card?: {
    id: number;
    front: string;
    back: string;
  };
  trigger?: React.ReactNode;
};

export function CardFormDialog({ deckId, card, trigger }: CardFormDialogProps) {
  const isEditing = Boolean(card);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const front = formData.get("front") as string;
    const back = formData.get("back") as string;

    startTransition(async () => {
      try {
        if (isEditing && card) {
          await updateCard({ deckId, cardId: card.id, front, back });
        } else {
          await createCard({ deckId, front, back });
          form.reset();
        }
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save card");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>{isEditing ? "Edit card" : "Add card"}</Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit card" : "Add card"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the front and back of this flashcard."
                : "Enter the front and back of your new flashcard."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="front">Front</Label>
              <Textarea
                id="front"
                name="front"
                defaultValue={card?.front ?? ""}
                placeholder="Question or term"
                rows={3}
                required
                disabled={isPending}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="back">Back</Label>
              <Textarea
                id="back"
                name="back"
                defaultValue={card?.back ?? ""}
                placeholder="Answer or definition"
                rows={3}
                required
                disabled={isPending}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : isEditing ? "Save changes" : "Add card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
