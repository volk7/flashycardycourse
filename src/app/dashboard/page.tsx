import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();

  return (
    <div className="flex flex-col flex-1 p-8 max-w-5xl mx-auto w-full gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s an overview of your flashcard activity.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Decks" value="0" description="No decks yet" />
        <StatCard label="Cards" value="0" description="No cards yet" />
        <StatCard label="Study streak" value="0" description="Days in a row" />
      </div>

      <div className="border rounded-xl p-6 flex flex-col gap-3">
        <h2 className="font-semibold text-lg">Get started</h2>
        <p className="text-muted-foreground text-sm">
          Create your first deck to start studying with flashcards.
        </p>
        <button className="self-start text-sm px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          Create a deck
        </button>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="border rounded-xl p-5 flex flex-col gap-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-3xl font-semibold">{value}</span>
      <span className="text-xs text-muted-foreground">{description}</span>
    </div>
  );
}
