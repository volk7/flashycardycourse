"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type StudyCard = {
  id: number;
  front: string;
  back: string;
};

type FlashcardStudyProps = {
  cards: StudyCard[];
  deckTitle: string;
};

function shuffleCards<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function FlashcardStudy({ cards, deckTitle }: FlashcardStudyProps) {
  const [shuffledCards, setShuffledCards] = useState<StudyCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setShuffledCards(shuffleCards(cards));
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [cards]);

  const total = shuffledCards.length;
  const currentCard = shuffledCards[currentIndex];

  const goToPrevious = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex((index) => (index === 0 ? total - 1 : index - 1));
    setIsFlipped(false);
  }, [total]);

  const goToNext = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex((index) => (index === total - 1 ? 0 : index + 1));
    setIsFlipped(false);
  }, [total]);

  const toggleFlip = useCallback(() => {
    setIsFlipped((flipped) => !flipped);
  }, []);

  const reshuffle = useCallback(() => {
    setShuffledCards(shuffleCards(cards));
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [cards]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          goToPrevious();
          break;
        case "ArrowRight":
          event.preventDefault();
          goToNext();
          break;
        case "ArrowUp":
        case "ArrowDown":
        case " ":
          event.preventDefault();
          toggleFlip();
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrevious, toggleFlip]);

  if (total === 0 || !currentCard) {
    return null;
  }

  const progress = ((currentIndex + 1) / total) * 100;

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">
      <div className="flex w-full flex-col gap-3">
        <div className="flex w-full items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>
            Card {currentIndex + 1} of {total}
          </span>
          <span className="truncate">{deckTitle}</span>
        </div>
        <Progress value={progress} aria-label={`Study progress: card ${currentIndex + 1} of ${total}`} />
      </div>

      <button
        type="button"
        onClick={toggleFlip}
        className={cn(
          "relative w-full min-h-64 sm:min-h-80 rounded-xl border bg-card p-8",
          "flex items-center justify-center text-center cursor-pointer",
          "transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        )}
        aria-label={isFlipped ? "Show front of card" : "Show back of card"}
      >
        <div className="flex flex-col gap-3 max-w-full">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {isFlipped ? "Back" : "Front"}
          </p>
          <p className="text-xl sm:text-2xl font-medium whitespace-pre-wrap break-words">
            {isFlipped ? currentCard.back : currentCard.front}
          </p>
        </div>
      </button>

      <p className="text-sm text-muted-foreground text-center">
        Click the card or press ↑ ↓ Space to flip. Use ← → to navigate.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button variant="outline" onClick={goToPrevious}>
          Previous
        </Button>
        <Button variant="outline" onClick={toggleFlip}>
          {isFlipped ? "Show front" : "Show back"}
        </Button>
        <Button variant="outline" onClick={goToNext}>
          Next
        </Button>
        <Button variant="secondary" onClick={reshuffle}>
          Shuffle again
        </Button>
      </div>
    </div>
  );
}
