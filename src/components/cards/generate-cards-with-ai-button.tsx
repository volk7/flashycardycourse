"use client";

import { SparklesIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { generateCardsWithAi } from "@/app/actions/cards";
import { updateDeck } from "@/app/actions/decks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type GenerateCardsWithAiButtonProps = {
  deckId: number;
  deckTitle: string;
  canUseAi: boolean;
  hasDescription: boolean;
};

export function GenerateCardsWithAiButton({
  deckId,
  deckTitle,
  canUseAi,
  hasDescription,
}: GenerateCardsWithAiButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [descriptionPromptOpen, setDescriptionPromptOpen] = useState(false);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSavingDescription, startDescriptionTransition] = useTransition();

  function handleGenerate() {
    setError(null);

    startTransition(async () => {
      try {
        await generateCardsWithAi({ deckId });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to generate cards");
      }
    });
  }

  function handleUpgradeClick() {
    router.push("/pricing");
  }

  function handleDescriptionSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDescriptionError(null);

    const formData = new FormData(event.currentTarget);
    const description = formData.get("description") as string;

    startDescriptionTransition(async () => {
      try {
        await updateDeck({
          deckId,
          title: deckTitle,
          description,
        });
        setDescriptionPromptOpen(false);
        router.refresh();
      } catch (err) {
        setDescriptionError(
          err instanceof Error ? err.message : "Failed to save description",
        );
      }
    });
  }

  if (!canUseAi) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUpgradeClick}
          >
            <SparklesIcon className="size-4" />
            Generate cards with AI
          </Button>
        </TooltipTrigger>
        <TooltipContent sideOffset={8}>
          AI flashcard generation is a Pro feature. Click to view pricing.
        </TooltipContent>
      </Tooltip>
    );
  }

  if (!hasDescription) {
    return (
      <>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDescriptionPromptOpen(true)}
            >
              <SparklesIcon className="size-4" />
              Generate cards with AI
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={8}>
            Add a deck description before generating cards with AI.
          </TooltipContent>
        </Tooltip>

        <Dialog open={descriptionPromptOpen} onOpenChange={setDescriptionPromptOpen}>
          <DialogContent>
            <form onSubmit={handleDescriptionSubmit}>
              <DialogHeader>
                <DialogTitle>Add a deck description</DialogTitle>
                <DialogDescription>
                  AI generation needs a deck description to create relevant flashcards.
                  Add one below, then try generating again.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-2 py-4">
                <Label htmlFor={`ai-description-${deckId}`}>Description</Label>
                <Textarea
                  id={`ai-description-${deckId}`}
                  name="description"
                  placeholder="What should these flashcards cover?"
                  rows={4}
                  required
                  disabled={isSavingDescription}
                />
                {descriptionError && (
                  <p className="text-sm text-destructive">{descriptionError}</p>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSavingDescription}>
                  {isSavingDescription ? "Saving..." : "Save description"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleGenerate}
        disabled={isPending}
      >
        <SparklesIcon className="size-4" />
        {isPending ? "Generating..." : "Generate cards with AI"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
