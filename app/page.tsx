import { AuthButtons } from "./components/auth-buttons";
import { MessageGenerator } from "./components/message-generator";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            <code className="rounded bg-black/[.06] px-1.5 py-0.5 font-mono text-[0.9em] dark:bg-white/[.08]">
              Followup AI
            </code>
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            AI-powered follow-up message generator for freelancers and small businesses chasing late payments.
          </p>
          <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
            <AuthButtons />
          </div>
        </div>
        <MessageGenerator />
      </main>
    </div>
  );
}
