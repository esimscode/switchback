"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUp } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Markdown from "react-markdown";
import { useEveAgent } from "eve/react";

import { getEveToken } from "@/lib/auth/client";
import { SwitchbackMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const MARK_PATH =
  "M 12 88 L 62 88 C 84 88 84 57 62 57 L 38 57 C 16 57 16 26 38 26 L 88 26";

type Act = "greeting" | "interview" | "arrived";

// Detect the moment onboarding completes: the create_career_profile tool
// finished and reported success.
type ToolPart = {
  type: string;
  toolName?: string;
  state?: string;
  output?: { created?: boolean; error?: string };
};

function profileWasCreated(
  messages: readonly { parts: readonly unknown[] }[],
): boolean {
  for (const message of messages) {
    for (const part of message.parts as ToolPart[]) {
      if (
        (part.type === "dynamic-tool" || part.type.startsWith("tool-")) &&
        part.toolName === "create_career_profile" &&
        part.state === "output-available" &&
        part.output?.error === undefined
      ) {
        return true;
      }
    }
  }
  return false;
}

export function WelcomeFlow() {
  const [act, setAct] = useState<Act>("greeting");

  return (
    <div className="flex h-svh flex-col bg-background">
      {act === "greeting" ? (
        <Greeting key="greeting" onBegin={() => setAct("interview")} />
      ) : act === "interview" ? (
        <Interview key="interview" onComplete={() => setAct("arrived")} />
      ) : (
        <Arrival key="arrived" />
      )}
    </div>
  );
}

function Greeting({ onBegin }: { onBegin: () => void }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className="flex flex-1 flex-col items-center justify-center gap-10 px-6"
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.4 }}
    >
      <motion.svg
        viewBox="0 0 100 100"
        fill="none"
        className="size-36 text-foreground sm:size-44"
        aria-hidden="true"
      >
        <motion.path
          d={MARK_PATH}
          stroke="currentColor"
          strokeWidth={11}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: reduceMotion ? 1 : 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
        />
      </motion.svg>

      <motion.div
        className="flex flex-col items-center gap-4 text-center"
        initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduceMotion ? 0 : 1.6, duration: 0.6 }}
      >
        <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">
          switchback
        </h1>
        <p className="eyebrow text-muted-foreground">
          Same mountain. Higher ground.
        </p>
        <p className="max-w-md text-sm text-muted-foreground">
          A private career strategist that knows your story and never
          oversells it. The next few minutes set your bearings — one honest
          conversation, no forms.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduceMotion ? 0 : 2.2, duration: 0.5 }}
      >
        <Button size="lg" onClick={onBegin}>
          Set your bearings <ArrowRight />
        </Button>
      </motion.div>
    </motion.section>
  );
}

function Interview({ onComplete }: { onComplete: () => void }) {
  const agent = useEveAgent({ auth: { bearer: getEveToken } });
  const [draft, setDraft] = useState("");
  const isBusy = agent.status === "submitted" || agent.status === "streaming";
  const bottomRef = useRef<HTMLDivElement>(null);
  const kickoffSent = useRef(false);
  const completed = useRef(false);
  const messageCount = agent.data.messages.length;

  // The strategist opens the conversation.
  useEffect(() => {
    if (!kickoffSent.current) {
      kickoffSent.current = true;
      void agent.send({
        message:
          "I'm a new user with no profile yet. Load the onboarding skill and begin my onboarding interview.",
      });
    }
  }, [agent]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageCount, agent.status]);

  // Arrival triggers once the profile lands and the agent has said its piece.
  useEffect(() => {
    if (
      !completed.current &&
      agent.status === "ready" &&
      profileWasCreated(agent.data.messages)
    ) {
      completed.current = true;
      const timer = setTimeout(onComplete, 1800);
      return () => clearTimeout(timer);
    }
  }, [agent.status, agent.data.messages, onComplete]);

  const send = (text: string) => {
    const message = text.trim();
    if (message.length === 0 || isBusy) return;
    setDraft("");
    void agent.send({ message });
  };

  return (
    <section className="animate-in fade-in flex min-h-0 flex-1 flex-col duration-500">
      <header className="animate-in fade-in slide-in-from-top-2 flex items-center gap-2 border-b px-6 py-4 duration-500">
        <SwitchbackMark className="size-4" strokeWidth={13} />
        <span className="text-sm font-semibold tracking-tight">switchback</span>
        <span className="eyebrow ml-auto text-muted-foreground">
          Setting your bearings
        </span>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto flex max-w-xl flex-col gap-6">
          {agent.data.messages.slice(1).map((message) => (
            <article
              key={message.id}
              className="animate-in fade-in slide-in-from-bottom-2 space-y-2 duration-300"
            >
              <p className="eyebrow text-muted-foreground">
                {message.role === "user" ? "You" : "Strategist"}
              </p>
              {message.parts.map((part, index) =>
                part.type === "text" ? (
                  message.role === "user" ? (
                    <p
                      key={index}
                      className="rounded-2xl rounded-tl-sm bg-secondary px-4 py-3 text-sm"
                    >
                      {part.text}
                    </p>
                  ) : (
                    <div
                      key={index}
                      className="prose prose-sm max-w-none dark:prose-invert"
                    >
                      <Markdown>{part.text}</Markdown>
                    </div>
                  )
                ) : null,
              )}
            </article>
          ))}
          {agent.status === "submitted" ? (
            <p className="eyebrow animate-pulse text-muted-foreground">
              Thinking…
            </p>
          ) : null}
          {agent.error ? (
            <p className="text-sm text-destructive">
              Something went wrong: {agent.error.message}
            </p>
          ) : null}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t px-6 py-4">
        <form
          className="mx-auto flex max-w-xl items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            send(draft);
          }}
        >
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send(draft);
              }
            }}
            placeholder="Answer in your own words…"
            disabled={isBusy}
            rows={1}
            className="max-h-40 min-h-10 resize-none rounded-3xl px-4 py-2.5 field-sizing-content"
          />
          <Button
            type="submit"
            size="icon"
            aria-label="Send"
            disabled={isBusy || draft.trim().length === 0}
            className="size-10"
          >
            <ArrowUp />
          </Button>
        </form>
      </div>
    </section>
  );
}

function Arrival() {
  const router = useRouter();

  return (
    <section className="animate-in fade-in zoom-in-95 m-4 flex flex-1 flex-col items-center justify-center gap-8 rounded-[1.5rem] bg-block-lime px-6 text-black duration-500">
      <SwitchbackMark className="size-24 text-black" />
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
          Bearings set.
        </h1>
        <p className="max-w-md text-sm">
          Your profile is in. From here, every job you analyze, every project
          you log, and every reflection you keep compounds — same mountain,
          higher ground.
        </p>
      </div>
      <Button
        size="lg"
        className="bg-black text-white hover:bg-black/80"
        onClick={() => router.push("/dashboard")}
      >
        Enter your workspace <ArrowRight />
      </Button>
    </section>
  );
}
